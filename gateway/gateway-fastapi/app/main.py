from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="PS-25 Learning Progress API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_URL = "http://localhost:8080"
NODE_URL = "http://localhost:5000"


def auth_headers(request: Request):
    authorization = request.headers.get("authorization")
    return {"Authorization": authorization} if authorization else {}


def send_request(method: str, base_url: str, path: str, **kwargs):
    try:
        response = requests.request(method, f"{base_url}{path}", timeout=10, **kwargs)
    except requests.RequestException as exc:
        service = "Spring Boot" if base_url == SPRING_URL else "Node/MongoDB"
        raise HTTPException(status_code=503, detail=f"{service} backend unavailable: {exc}")

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type:
        return response.json()

    return response.text


@app.get("/health")
def health():
    return {
        "status": "UP",
        "gateway": "FastAPI",
        "springBackend": SPRING_URL,
        "nodeMongoBackend": NODE_URL,
        "problemStatement": "PS-25 Learning Progress Tracking Dashboard",
    }


@app.post("/register")
def register(user: dict):
    return send_request("POST", SPRING_URL, "/api/users/register", json=user)


@app.post("/login")
def login(user: dict):
    return send_request("POST", SPRING_URL, "/api/users/login", json=user)


@app.get("/courses")
def get_courses(request: Request, search: str | None = Query(default=None)):
    params = {"search": search} if search else {}
    return send_request("GET", SPRING_URL, "/api/courses", params=params, headers=auth_headers(request))


@app.get("/courses/{course_id}")
def get_course(course_id: int, request: Request):
    return send_request("GET", SPRING_URL, f"/api/courses/{course_id}", headers=auth_headers(request))


@app.post("/courses")
def create_course(course: dict, request: Request):
    return send_request("POST", SPRING_URL, "/api/courses", json=course, headers=auth_headers(request))


@app.put("/courses/{course_id}")
def update_course(course_id: int, course: dict, request: Request):
    return send_request("PUT", SPRING_URL, f"/api/courses/{course_id}", json=course, headers=auth_headers(request))


@app.delete("/courses/{course_id}")
def delete_course(course_id: int, request: Request):
    return send_request("DELETE", SPRING_URL, f"/api/courses/{course_id}", headers=auth_headers(request))


@app.get("/progress")
def get_progress(request: Request, userId: int | None = Query(default=None), courseId: int | None = Query(default=None)):
    params = {key: value for key, value in {"userId": userId, "courseId": courseId}.items() if value is not None}
    return send_request("GET", SPRING_URL, "/api/progress", params=params, headers=auth_headers(request))


@app.post("/progress")
def save_progress(progress: dict, request: Request):
    saved = send_request("POST", SPRING_URL, "/api/progress", json=progress, headers=auth_headers(request))
    try:
        send_request("POST", NODE_URL, "/api/learning-logs", json={**progress, "progressId": saved.get("id")})
    except HTTPException:
        pass
    return saved


@app.get("/progress/summary")
def progress_summary(request: Request, userId: int = Query(...)):
    return send_request("GET", SPRING_URL, "/api/progress/summary", params={"userId": userId}, headers=auth_headers(request))


@app.get("/learning-search")
def semantic_learning_search(query: str, userId: int | None = Query(default=None)):
    params = {"query": query}
    if userId is not None:
        params["userId"] = userId
    return send_request("GET", NODE_URL, "/api/semantic-search", params=params)
