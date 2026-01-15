 # Analytics Dashboard - Backend

 Spring Boot 3.x backend API for the Analytics Dashboard.

 ## Tech Stack

 - **Framework**: Spring Boot 3.2.0
 - **Language**: Java 17
 - **Build Tool**: Maven
 - **Database**: H2 (dev), PostgreSQL (prod)
 - **Observability**: Spring Boot Actuator

 ## Prerequisites

 - Java 17 or higher
 - Maven 3.8+

 ## Getting Started

 ### Run Locally

 ```bash
 mvn spring-boot:run
 ```

 The application will start on `http://localhost:8080`.

 ### Build

 ```bash
 mvn clean package
 ```

 ### Run Tests

 ```bash
 mvn test
 ```

 ## Key Endpoints

 - Health: `GET /actuator/health`
 - Metrics: `GET /actuator/metrics`
 - H2 Console (dev only): `GET /h2-console`

 ## Configuration

 - Main config: `src/main/resources/application.yml`
 - Dev profile: `src/main/resources/application-dev.yml`

 ## Suggested Package Structure

 ```text
 com.analytics.dashboard
 ├── controller      # REST controllers
 ├── service         # Business logic
 ├── repository      # Data access
 ├── model           # Entity models
 └── dto             # Data transfer objects
 ```

 ## Best Practices

 - Use `@RestController` for HTTP endpoints.
 - Use DTOs for request/response payloads.
 - Centralize error handling with `@ControllerAdvice`.
 - Keep business logic in services, not controllers.
 - Prefer constructor injection for dependencies.

