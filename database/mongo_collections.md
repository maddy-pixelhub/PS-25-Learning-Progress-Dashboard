# MongoDB Collections for PS-25

Database: `learning_progress`

Collections:

- `learning_logs`: raw progress events from the FastAPI gateway and learner dashboard.
- `progress_embeddings`: semantic-search documents with `embeddingText`, a simple numeric `vector`, status, completion, performance, and weak topics.
- `activity_history`: learner activity audit trail for progress updates and insight generation.

Vector search requirement:

- The Node service exposes `GET /api/semantic-search?query=Courses not completed yet`.
- It also supports `GET /api/semantic-search?query=Topics where performance is low`.
- In a MongoDB Atlas deployment, create a vector index on `progress_embeddings.vector` and keep `embeddingText` as the explainable search text. The local project includes deterministic vectors so the feature can be demonstrated without a paid embedding API.
