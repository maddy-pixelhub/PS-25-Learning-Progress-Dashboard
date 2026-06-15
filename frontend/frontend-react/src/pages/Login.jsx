import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../sevices/api";

const emptyLogin = {
    email: "",
    password: ""
};

function Login() {
    const [form, setForm] = useState(emptyLogin);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            const response = await API.post("/login", form);
            const data = response.data;
            const token = typeof data === "string" ? data : data.token;
            const user = typeof data === "string"
                ? { name: form.email.split("@")[0], email: form.email, role: "USER" }
                : data.user;

            localStorage.setItem("token", token);
            localStorage.setItem("learningPortalUser", JSON.stringify(user));
            navigate("/dashboard");
        } catch (error) {
            setMessage(getErrorMessage(error, "Login failed. Start FastAPI/Spring Boot and try again."));
            console.log(error);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="eyebrow">PS-25 Learning Progress</p>
                <h1>Login</h1>
                <p className="hero-copy">
                    Sign in as a learner or admin to track module completion, performance, summaries, and insights.
                </p>

                {message && <p className="message">{message}</p>}

                <form className="standalone-auth-form" onSubmit={handleLogin}>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
                    <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required />
                    <button className="primary-button" type="submit">Login</button>
                </form>

                <p className="auth-link">
                    New learner? <Link to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    );
}

function getErrorMessage(error, fallbackMessage) {
    const detail = error.response?.data?.detail || error.response?.data?.message || error.response?.data;
    return typeof detail === "string" && detail.trim() ? detail : fallbackMessage;
}

export default Login;
