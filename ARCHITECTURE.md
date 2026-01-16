# Analytics Dashboard - Architecture Design

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                         │
│  React App (Vite) - Dashboard UI, Charts, Filters           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend Layer (Spring Boot)               │
│  - REST Controllers                                          │
│  - Service Layer (AnalyticsService, TransactionService)     │
│  - In-Memory Cache (@Cacheable)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│  PostgreSQL  │ │ PostgreSQL │ │  Scheduler│
│  Raw Data    │ │ Aggregates │ │  (Jobs)   │
│  (500k+ txns)│ │(Pre-comp.) │ |           │
│              │ │            │ │ Pre-aggreg│
│  Indexed     │ │ Fast reads │ │ every 5min│
└──────────────┘ └────────────┘ └───────────┘
```

**Design Principles:**
- **Start Simple**: PostgreSQL aggregates + Spring in-memory cache
- **Meet Constraints**: <300ms KPI latency with 500k transactions
- **Evolve Later**: Clear path to add Redis, partitioning, etc. when needed

## Component Breakdown

### 1. Frontend (React)
- **Role**: User interface, data visualization
- **Responsibilities**:
  - Render dashboards and charts
  - Handle user filters and pagination
  - Make API calls to backend
  - Client-side state management

### 2. Backend API (Spring Boot)
- **Role**: Business logic and data orchestration
- **Key Components**:
  - **Controllers**: REST endpoints (`/api/analytics/kpis`, `/api/transactions`)
  - **Services**: Business logic for KPI calculations
  - **Repositories**: Data access layer (JPA)
  - **DTOs**: Data transfer objects for API responses

### 3. Database (PostgreSQL)
- **Role**: Persistent storage
- **Structure**:
  - **Raw Transaction Table**: All 500k+ transactions (indexed)
  - **Aggregate Tables**: Pre-computed metrics (hourly/daily)
  - **Indexes**: On date, user_id, status columns (essential for performance)

### 4. Caching (Spring @Cacheable - In-Memory)
- **Role**: Fast KPI retrieval within same request cycle
- **Strategy**: Cache computed KPIs for 1-5 minutes (configurable)
- **Why**: Avoid recalculating same KPIs for concurrent requests
- **Note**: In-memory cache is sufficient for MVP. Can evolve to Redis later if needed.

## Data Flow

### Scenario 1: User Requests Dashboard KPIs

```
1. User opens dashboard
   ↓
2. Frontend calls GET /api/analytics/kpis?period=today
   ↓
3. Backend checks in-memory cache (@Cacheable)
   ├─ Cache HIT → Return cached data (<50ms)
   └─ Cache MISS → Continue to step 4
   ↓
4. Backend queries aggregate table (not raw transactions)
   ├─ If aggregate exists → Return + cache result (<200ms)
   └─ If not → Calculate from raw data + cache (<500ms, rare)
   ↓
5. Response sent to frontend
```

### Scenario 2: User Searches Transactions (Pagination)

```
1. User searches transactions with filters
   ↓
2. Frontend calls GET /api/transactions?page=0&size=20&filter=...
   ↓
3. Backend validates pagination params
   ↓
4. Backend queries PostgreSQL with:
   - WHERE clauses (indexed)
   - LIMIT/OFFSET for pagination
   - ORDER BY for sorting
   ↓
5. Returns page data + total count
   ↓
6. Frontend renders table with pagination controls
```

### Scenario 3: Background Aggregation (Scheduled Job)

```
1. Scheduled job runs every 5 minutes (@Scheduled)
   ↓
2. Calculates KPIs from last period (raw transactions)
   ↓
3. Stores results in aggregate tables (PostgreSQL)
   ↓
4. Cache is invalidated, next request rebuilds from aggregates
   ↓
5. Dashboard requests now hit aggregates (<200ms)
```

## Performance Strategy

### Goal: <300ms KPI Latency with 500k+ Transactions

**Core Principle**: Never calculate KPIs from 500k rows in real-time. Always use pre-computed aggregates.

#### Strategy 1: Pre-Aggregation (Critical)
- **Problem**: Calculating KPIs from 500k rows takes 2-5 seconds
- **Solution**: Pre-compute aggregates in background jobs every 5 minutes
- **Implementation**:
  ```
  Aggregate Tables:
  - daily_metrics (date, total_revenue, transaction_count, success_count, ...)
  - hourly_metrics (date, hour, metrics...) - optional, add if needed
  ```
- **Benefit**: Query 30-365 rows instead of 500k rows → <200ms

#### Strategy 2: Database Indexes (Essential)
- **Indexes on transactions table**:
  ```sql
  CREATE INDEX idx_transactions_date ON transactions(created_at DESC);
  CREATE INDEX idx_transactions_user ON transactions(user_id);
  CREATE INDEX idx_transactions_status ON transactions(status);
  ```
- **Why**: Fast filtering and aggregation queries
- **Connection Pooling**: HikariCP (default in Spring Boot, 10 connections)

#### Strategy 3: In-Memory Caching (Simple)
- **Spring @Cacheable**: Cache KPI results for 1-5 minutes
- **Why**: Handle concurrent requests without hitting database
- **Result**: Cache hits <50ms, cache misses <200ms (from aggregates)

#### Strategy 4: Query Best Practices
- **Use Aggregates**: Always query aggregate tables for KPIs, never raw transactions
- **Pagination**: Always use LIMIT/OFFSET (20-50 items per page)
- **Select Specific Columns**: Use DTOs, not full entities
- **Native Queries**: For complex aggregations, use @Query with native SQL

### Performance Targets

| Operation | Target | Strategy |
|-----------|--------|----------|
| KPI Dashboard Load | <300ms | Aggregate tables + in-memory cache |
| Transaction Search | <500ms | Indexed queries + pagination |
| KPI Cache Hit | <50ms | Spring @Cacheable (in-memory) |
| KPI Cache Miss | <200ms | Aggregate table query |
| Background Aggregation | <30s | Scheduled job (@Scheduled), async |

## Database Schema Design

### Core Tables

```sql
-- Raw Transaction Table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING
    payment_method VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    metadata JSONB
);

-- Indexes
CREATE INDEX idx_transactions_date ON transactions(created_at DESC);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- Aggregate Table (Pre-computed daily metrics)
CREATE TABLE daily_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    unique_users INT DEFAULT 0,
    avg_transaction_amount DECIMAL(15,2),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast date range queries
CREATE INDEX idx_daily_metrics_date ON daily_metrics(metric_date DESC);

-- Note: Add hourly_metrics table later if hourly granularity is needed
```

## Technology Stack

### Current Stack
- ✅ Spring Boot 3 (with built-in caching support)
- ✅ PostgreSQL (with proper indexes)
- ✅ React + Vite

### Built-in Features (No Additional Dependencies Needed)

1. **Caching**: Spring @Cacheable (Caffeine or Simple cache)
   - In-memory caching, sufficient for MVP
   - No Redis needed initially

2. **Scheduling**: Spring @Scheduled
   - Pre-aggregate metrics every 5 minutes
   - Built into Spring Boot, no extra setup

3. **Monitoring**: Spring Boot Actuator (already included)
   - Track API latency via `/actuator/metrics`
   - Health checks via `/actuator/health`

4. **Connection Pooling**: HikariCP (default in Spring Boot)
   - Default 10 connections, sufficient for MVP

## Implementation Phases

### Phase 1: Foundation (MVP)
- ✅ Spring Boot backend structure
- ✅ PostgreSQL connection
- Create `transactions` table with indexes
- Create `daily_metrics` aggregate table
- Basic transaction CRUD endpoints
- ✅ React frontend structure

### Phase 2: Performance (Meet <300ms Constraint)
- Implement scheduled aggregation job (@Scheduled)
- Create AnalyticsService that queries aggregates (not raw data)
- Add Spring @Cacheable for in-memory caching
- Add database indexes (date, user_id, status)
- Test with 500k transaction dataset

### Phase 3: Polish
- Query optimization (native queries for aggregations)
- Response DTOs (only return needed fields)
- Frontend pagination for transaction lists
- Error handling and validation

### Phase 4: Monitoring & Validation
- Add logging for performance tracking
- Monitor via Actuator endpoints
- Load testing to validate <300ms target
- Performance profiling

## Evolution Path (When Needed)

### When to Add Redis
- **Trigger**: Multiple app instances (horizontal scaling) or cache size > 1GB
- **Benefit**: Shared cache across instances
- **Current**: In-memory cache works fine for single instance

### When to Add Hourly Aggregates
- **Trigger**: Need hourly granularity in dashboards
- **Benefit**: More detailed time-series analysis
- **Current**: Daily aggregates sufficient for most KPIs

### When to Add Table Partitioning
- **Trigger**: Transaction table > 10M rows or slow queries
- **Benefit**: Faster queries on recent data
- **Current**: Indexes sufficient for 500k-1M rows

### When to Add Read Replicas
- **Trigger**: High read load or need to offload analytics queries
- **Benefit**: Separate read/write workloads
- **Current**: Single PostgreSQL instance sufficient

## Summary

**MVP Approach:**
- PostgreSQL aggregates + Spring in-memory cache
- Scheduled jobs every 5 minutes
- Proper database indexes
- **Result**: <300ms KPI latency with 500k transactions

**Evolution Strategy:**
- Start simple, add complexity only when needed
- Clear triggers for each optimization
- No premature optimization
