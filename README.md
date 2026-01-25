# Simple Budget Monorepo

This is a lightweight budgeting application designed for families, self-hostable on Proxmox.

## Structure

- **apps/backend**: NestJS application with SQLite and Prisma.
- **apps/frontend**: React application with Vite, Mantine, and TanStack Query.
- **packages/domain**: Shared TypeScript types, Zod schemas, and business logic constants.

## Prerequisites

- Node.js (v18+)
- npm (v9+)

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build Shared Packages**:
    ```bash
    npm run build --workspaces
    ```

3.  **Setup Database**:
    ```bash
    npm run prisma:migrate -w apps/backend
    ```

## Running the Application

### Backend
```bash
npm run dev -w apps/backend
```
Runs on `http://localhost:3000`.

### Frontend
```bash
npm run dev -w apps/frontend
```
Runs on `http://localhost:5173`.

## Running with Docker

1.  **Build and Start**:
    ```bash
    docker-compose up -d --build
    ```

2.  **Access**:
    *   Frontend: `http://localhost:80`
    *   Backend: `http://localhost:3000`

For detailed deployment instructions, including Proxmox setup and backups, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Features

- Multi-user and multi-budget support.
- Configurable overflow policies (None, Limited, Unlimited).
- Recurring rules for automatic budget additions.
- Transaction tracking with categorization.
- Internationalization (English/Portuguese).
