CREATE DATABASE learning_progress;

\c learning_progress;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    level VARCHAR(50),
    total_modules INTEGER DEFAULT 0,
    topics VARCHAR(1000),
    description VARCHAR(1200)
);

CREATE TABLE IF NOT EXISTS progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(40) NOT NULL DEFAULT 'IN_PROGRESS',
    completion_percentage INTEGER DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    current_module VARCHAR(255),
    weak_topics VARCHAR(1000),
    summary VARCHAR(1200),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);
