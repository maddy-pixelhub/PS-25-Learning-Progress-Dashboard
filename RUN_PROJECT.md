# PS-25 Learning Progress Tracking Dashboard

Converted from the job portal project into a learning progress dashboard with:

- React frontend with admin and user pages.
- FastAPI API gateway on port `8000`.
- Spring Boot backend on port `8080` with JWT authentication, RBAC, CRUD, and PostgreSQL tables `users`, `courses`, `progress`.
- Node.js backend on port `5000` with MongoDB collections `learning_logs`, `progress_embeddings`, `activity_history`.
- Semantic learning search examples: `Courses not completed yet` and `Topics where performance is low`.

## Demo Accounts

- Admin: `admin@ps25.local` / `password`
- Learner: `learner@ps25.local` / `password`

## Run Order

1. Create PostgreSQL database:

```sql
CREATE DATABASE learning_progress;
```

Optional full schema: `database/postgres_schema.sql`.

2. Start Spring Boot:

```bash
cd backend/backend
mvn spring-boot:run
```

3. Start MongoDB locally, then start Node backend:

```bash
cd node-backend
npm install
npm start
```

4. Start FastAPI gateway:

```bash
cd gateway/gateway-fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

5. Start React frontend:

```bash
cd frontend/frontend-react
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

## Rubric Coverage

- Frontend UI: dashboard metrics, course list, progress forms, admin/user role views, insight search.
- FastAPI gateway: routes React traffic to Spring and Node services.
- Spring Boot security: JWT token generation/parsing with admin/user role access.
- Spring Boot CRUD/business logic: courses, progress tracking, completion/performance summaries.
- Node.js backend: learning logs, activity history, semantic search API.
- PostgreSQL + MongoDB: SQL schema plus Mongo collections documented and implemented.
- Integration: React -> FastAPI -> Spring/PostgreSQL and React -> FastAPI -> Node/MongoDB.
- Git collaboration: keep commits per service/layer and use feature branches for reviews.
