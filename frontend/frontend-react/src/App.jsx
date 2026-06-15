import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function App() {

    return (

        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<ProtectedDashboard />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

function ProtectedDashboard() {
    const savedUser = localStorage.getItem("learningPortalUser");

    if (!savedUser) {
        return <Navigate to="/login" replace />;
    }

    return <Dashboard />;
}

export default App;
