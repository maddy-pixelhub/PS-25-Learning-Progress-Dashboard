import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../sevices/api";

const emptyCourse = {
    title: "",
    category: "",
    level: "Beginner",
    totalModules: 8,
    topics: "",
    description: ""
};

const emptyProgress = {
    courseId: "",
    status: "IN_PROGRESS",
    completionPercentage: 25,
    performanceScore: 70,
    timeSpentMinutes: 45,
    currentModule: "Module 1",
    weakTopics: "",
    summary: ""
};

function Dashboard() {
    const navigate = useNavigate();
    const savedUser = localStorage.getItem("learningPortalUser");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const isAdmin = parsedUser?.role === "ADMIN";
    const [courses, setCourses] = useState([]);
    const [progressRows, setProgressRows] = useState([]);
    const [insights, setInsights] = useState([]);
    const [semanticResults, setSemanticResults] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseForm, setCourseForm] = useState(emptyCourse);
    const [progressForm, setProgressForm] = useState(emptyProgress);
    const [query, setQuery] = useState("Courses not completed yet");
    const [message, setMessage] = useState("");

    const authHeader = useMemo(() => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    const loadDashboard = useCallback(async () => {
        try {
            const [courseResponse, progressResponse] = await Promise.all([
                API.get("/courses", { headers: authHeader }),
                API.get("/progress", { headers: authHeader, params: { userId: parsedUser?.id || 1 } })
            ]);

            setCourses(courseResponse.data);
            setProgressRows(progressResponse.data);
            setSelectedCourse(courseResponse.data[0] || null);
            setProgressForm((current) => ({
                ...current,
                courseId: courseResponse.data[0]?.id || ""
            }));
            buildLocalInsights(progressResponse.data, courseResponse.data);
        } catch (error) {
            setMessage(getErrorMessage(error, "Unable to load learning data. Start FastAPI and Spring Boot."));
            console.log(error);
        }
    }, [authHeader, parsedUser?.id]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const buildLocalInsights = (progress, courseList) => {
        const courseMap = new Map(courseList.map((course) => [course.id, course.title]));
        const generated = progress
            .filter((row) => row.status !== "COMPLETED" || Number(row.performanceScore) < 70)
            .map((row) => ({
                title: courseMap.get(row.courseId) || `Course ${row.courseId}`,
                text: Number(row.performanceScore) < 70
                    ? `Performance is low in ${row.weakTopics || row.currentModule}. Add practice and review sessions.`
                    : `${row.completionPercentage}% complete. Continue from ${row.currentModule}.`
            }));

        setInsights(generated.length ? generated : [{ title: "On track", text: "All visible progress records look healthy." }]);
    };

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("learningPortalUser");
        navigate("/login");
    };

    const createCourse = async (event) => {
        event.preventDefault();
        try {
            const response = await API.post("/courses", courseForm, { headers: authHeader });
            const updatedCourses = [response.data, ...courses];
            setCourses(updatedCourses);
            setSelectedCourse(response.data);
            setCourseForm(emptyCourse);
            setMessage("Course created for learners.");
        } catch (error) {
            setMessage(getErrorMessage(error, "Course creation failed. Admin role and JWT are required."));
            console.log(error);
        }
    };

    const saveProgress = async (event) => {
        event.preventDefault();
        try {
            const payload = {
                ...progressForm,
                userId: parsedUser?.id || 1,
                courseId: Number(progressForm.courseId),
                completionPercentage: Number(progressForm.completionPercentage),
                performanceScore: Number(progressForm.performanceScore),
                timeSpentMinutes: Number(progressForm.timeSpentMinutes)
            };
            const response = await API.post("/progress", payload, { headers: authHeader });
            const updatedRows = [response.data, ...progressRows.filter((row) => row.id !== response.data.id)];
            setProgressRows(updatedRows);
            buildLocalInsights(updatedRows, courses);
            setMessage("Progress status and performance saved.");
        } catch (error) {
            setMessage(getErrorMessage(error, "Could not save progress."));
            console.log(error);
        }
    };

    const runSemanticSearch = async (event) => {
        event.preventDefault();
        try {
            const response = await API.get("/learning-search", { params: { query, userId: parsedUser?.id || 1 } });
            setSemanticResults(response.data.results || response.data);
            setMessage("Semantic learning search completed.");
        } catch (error) {
            const fallback = localSemanticSearch(query, progressRows, courses);
            setSemanticResults(fallback);
            setMessage("Node/Mongo search is offline, so local dashboard insights were used.");
        }
    };

    const averageCompletion = average(progressRows.map((row) => row.completionPercentage));
    const averagePerformance = average(progressRows.map((row) => row.performanceScore));
    const completedCount = progressRows.filter((row) => row.status === "COMPLETED").length;

    return (
        <main>
            <nav className="top-nav">
                <div>
                    <strong>Learning Progress Tracking Dashboard</strong>
                    <span>{parsedUser?.email} | {isAdmin ? "Admin page" : "User page"}</span>
                </div>
                <button className="secondary-button" type="button" onClick={logoutUser}>Logout</button>
            </nav>

            <section className="hero-section">
                <div>
                    <p className="eyebrow">PS-25 Learning Progress Tracking Dashboard</p>
                    <h1>Progress, performance, and intelligent learning insights</h1>
                    <p className="hero-copy">
                        Track progress status, completion levels, performance scores, summaries, learning logs, and semantic queries across courses and modules.
                    </p>
                </div>
                <div className="hero-stats" aria-label="Learning progress summary">
                    <span><strong>{courses.length}</strong> Courses</span>
                    <span><strong>{averageCompletion}%</strong> Complete</span>
                    <span><strong>{averagePerformance}%</strong> Performance</span>
                </div>
            </section>

            {message && <p className="message">{message}</p>}

            <section className="toolbar-panel learning-toolbar">
                <div className="metric-card"><strong>{progressRows.length}</strong><span>Progress records</span></div>
                <div className="metric-card"><strong>{completedCount}</strong><span>Completed courses</span></div>
                <div className="metric-card"><strong>{progressRows.length - completedCount}</strong><span>In progress or pending</span></div>
                <div className="metric-card"><strong>{isAdmin ? "ADMIN" : "USER"}</strong><span>JWT + RBAC role</span></div>
            </section>

            <section className="workspace-grid">
                <aside className="courses-panel">
                    <div className="section-heading">
                        <h2>Courses</h2>
                        <span>PostgreSQL courses table</span>
                    </div>
                    <div className="course-list">
                        {courses.map((course) => (
                            <button
                                className={`course-row ${selectedCourse?.id === course.id ? "active" : ""}`}
                                key={course.id}
                                onClick={() => {
                                    setSelectedCourse(course);
                                    setProgressForm((current) => ({ ...current, courseId: course.id }));
                                }}
                            >
                                <span className="course-title">{course.title}</span>
                                <span>{course.category} | {course.level}</span>
                                <small>{course.totalModules} modules</small>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="detail-panel">
                    {selectedCourse ? (
                        <>
                            <p className="eyebrow">{selectedCourse.category}</p>
                            <h2>{selectedCourse.title}</h2>
                            <p>{selectedCourse.description}</p>
                            <div className="chip-row">
                                {splitTags(selectedCourse.topics).map((topic) => <span className="chip" key={topic}>{topic}</span>)}
                            </div>
                            <div className="progress-list">
                                {progressRows.filter((row) => row.courseId === selectedCourse.id).map((row) => (
                                    <article className="progress-card" key={row.id}>
                                        <div>
                                            <strong>{row.status}</strong>
                                            <span>{row.currentModule} | {row.completionPercentage}% complete</span>
                                            <small>Weak topics: {row.weakTopics || "None"}</small>
                                        </div>
                                        <meter min="0" max="100" value={row.performanceScore}>{row.performanceScore}</meter>
                                    </article>
                                ))}
                            </div>
                        </>
                    ) : <div className="empty-state">No course selected.</div>}
                </section>
            </section>

            <section className="bottom-grid">
                {isAdmin ? (
                    <form className="panel-form" onSubmit={createCourse}>
                        <div className="section-heading"><h2>Admin Course Management</h2><span>CRUD via Spring Boot</span></div>
                        <div className="form-grid">
                            <input name="title" value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} placeholder="Course title" required />
                            <input name="category" value={courseForm.category} onChange={(event) => setCourseForm({ ...courseForm, category: event.target.value })} placeholder="Category" required />
                            <select name="level" value={courseForm.level} onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                            <input name="totalModules" value={courseForm.totalModules} onChange={(event) => setCourseForm({ ...courseForm, totalModules: event.target.value })} type="number" min="1" placeholder="Modules" required />
                        </div>
                        <input name="topics" value={courseForm.topics} onChange={(event) => setCourseForm({ ...courseForm, topics: event.target.value })} placeholder="Topics: SQL, Joins, Indexing" />
                        <textarea name="description" value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} placeholder="Course summary" rows="3" required />
                        <button className="primary-button" type="submit">Create Course</button>
                    </form>
                ) : (
                    <form className="panel-form" onSubmit={saveProgress}>
                        <div className="section-heading"><h2>User Progress Update</h2><span>progress table</span></div>
                        <select name="courseId" value={progressForm.courseId} onChange={(event) => setProgressForm({ ...progressForm, courseId: event.target.value })} required>
                            <option value="">Select course</option>
                            {courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
                        </select>
                        <div className="form-grid">
                            <select name="status" value={progressForm.status} onChange={(event) => setProgressForm({ ...progressForm, status: event.target.value })}>
                                <option>NOT_STARTED</option>
                                <option>IN_PROGRESS</option>
                                <option>COMPLETED</option>
                            </select>
                            <input name="currentModule" value={progressForm.currentModule} onChange={(event) => setProgressForm({ ...progressForm, currentModule: event.target.value })} placeholder="Current module" />
                            <input name="completionPercentage" value={progressForm.completionPercentage} onChange={(event) => setProgressForm({ ...progressForm, completionPercentage: event.target.value })} type="number" min="0" max="100" />
                            <input name="performanceScore" value={progressForm.performanceScore} onChange={(event) => setProgressForm({ ...progressForm, performanceScore: event.target.value })} type="number" min="0" max="100" />
                        </div>
                        <input name="weakTopics" value={progressForm.weakTopics} onChange={(event) => setProgressForm({ ...progressForm, weakTopics: event.target.value })} placeholder="Weak topics" />
                        <textarea name="summary" value={progressForm.summary} onChange={(event) => setProgressForm({ ...progressForm, summary: event.target.value })} placeholder="Progress summary" rows="3" />
                        <button className="primary-button" type="submit">Save Progress</button>
                    </form>
                )}

                <section className="tracking-panel">
                    <form onSubmit={runSemanticSearch}>
                        <div className="section-heading"><h2>Intelligent Insights</h2><span>MongoDB vector search</span></div>
                        <div className="track-row">
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Courses not completed yet" />
                            <button className="primary-button" type="submit">Search</button>
                        </div>
                    </form>
                    <div className="application-list">
                        {(semanticResults.length ? semanticResults : insights).map((item, index) => (
                            <article className="application-card insight-card" key={`${item.title}-${index}`}>
                                <div>
                                    <strong>{item.title || item.courseTitle}</strong>
                                    <span>{item.text || item.summary || item.reason}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}

function average(values) {
    const usable = values.map(Number).filter((value) => Number.isFinite(value));
    if (!usable.length) return 0;
    return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

function splitTags(value) {
    return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function localSemanticSearch(query, progressRows, courses) {
    const text = query.toLowerCase();
    const courseMap = new Map(courses.map((course) => [course.id, course.title]));
    const rows = text.includes("low")
        ? progressRows.filter((row) => Number(row.performanceScore) < 70)
        : progressRows.filter((row) => row.status !== "COMPLETED");

    return rows.map((row) => ({
        title: courseMap.get(row.courseId) || `Course ${row.courseId}`,
        text: `${row.status}, ${row.completionPercentage}% complete, performance ${row.performanceScore}%. ${row.weakTopics || row.summary || ""}`
    }));
}

function getErrorMessage(error, fallbackMessage) {
    const detail = error.response?.data?.detail || error.response?.data?.message || error.response?.data;
    return typeof detail === "string" && detail.trim() ? detail : fallbackMessage;
}

export default Dashboard;
