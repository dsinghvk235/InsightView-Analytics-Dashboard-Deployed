# Analytics Dashboard - Frontend

React + Vite frontend application for the Analytics Dashboard.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Routing**: React Router

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/       # React components
├── services/         # API services
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## API Integration

The Vite dev server is configured to proxy API requests to the backend:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Proxy: `/api/*` → `http://localhost:8080/*`

Example:
```typescript
const response = await fetch('/api/analytics')
```

## Development

### Adding Dependencies

```bash
npm install <package-name>
```

### Environment Variables

Create `.env.local` for local development:
```
VITE_API_URL=http://localhost:8080
```

## Best Practices

- Use TypeScript for type safety
- Follow React hooks best practices
- Keep components small and focused
- Use proper error boundaries
- Implement loading states
- Follow accessibility guidelines
