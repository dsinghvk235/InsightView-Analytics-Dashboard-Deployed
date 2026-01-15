 # Analytics Dashboard Monorepo

 A modern analytics dashboard built with a Spring Boot backend and a React + Vite frontend.

 ## Architecture

 - **Backend**: Spring Boot 3.x (Java 17), Maven
 - **Frontend**: React 18, Vite 5, TypeScript

 ## Structure

 - `backend/` – Spring Boot backend API
 - `frontend/` – React SPA served by Vite
 - `.github/` – CI workflows (GitHub Actions)

 ## Prerequisites

 - Java 17+
 - Maven 3.8+
 - Node.js 18+ and npm (or pnpm/yarn)

 ## Getting Started

 ### Backend

 ```bash
 cd backend
 mvn spring-boot:run
 ```

 The backend will be available at `http://localhost:8080`.

 ### Frontend

 ```bash
 cd frontend
 npm install
 npm run dev
 ```

 The frontend will be available at `http://localhost:5173`.

 ## Development Workflow

 - Backend and frontend are developed and deployed independently.
 - Local development expects the backend on port `8080` and frontend on `5173`.
 - The frontend dev server proxies API calls (e.g. `/api/*`) to the backend.

 For more details, see:

 - `backend/README.md`
 - `frontend/README.md`

