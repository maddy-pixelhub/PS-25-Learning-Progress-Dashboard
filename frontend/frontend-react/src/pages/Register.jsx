import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../sevices/api";

const emptyRegister = {
    name: "",
    email: "",
    password: "",
    role: "USER"
};

function Register() {
    const [form, setForm] = useState(emptyRegister);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const registerUser = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            const response = await API.post("/register", form);
            const user = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role
            };

            localStorage.setItem("learningPortalUser", JSON.stringify(user));
            navigate("/dashboard");
        } catch (error) {
            setMessage(getErrorMessage(error, "Registration failed. Try another email or check the backend."));
            console.log(error);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="eyebrow">Create Account</p>
                <h1>Register</h1>
                <p className="hero-copy">Create a PS-25 account for learner tracking or admin course management.</p>

                {message && <p className="message">{message}</p>}

                <form className="standalone-auth-form" onSubmit={registerUser}>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
                    <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required />
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="USER">Learner</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button className="primary-button" type="submit">Create Account</button>
                </form>

                <p className="auth-link">
                    Already registered? <Link to="/login">Login here</Link>
                </p>
            </section>
        </main>
    );
}

function getErrorMessage(error, fallbackMessage) {
    const detail = error.response?.data?.detail || error.response?.data?.message || error.response?.data;
    return typeof detail === "string" && detail.trim() ? detail : fallbackMessage;
}

export default Register;
