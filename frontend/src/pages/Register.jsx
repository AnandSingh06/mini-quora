import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) { setMsg("Fill all fields"); return; }
    const res = await API.post("/register", { username, password });
    if (res.data.error) { setMsg(res.data.error); return; }
    setMsg("Registered! Redirecting...");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="auth">
      <h2>Create account</h2>
      <p className="auth-sub">Join the conversation</p>

      <div className="auth-card">
        {msg && (
          <p style={{ fontSize: 13, marginBottom: 12, padding: "8px 12px", borderRadius: "var(--radius-sm)", background: msg.includes("!") ? "#f0fdf4" : "var(--red-light)", color: msg.includes("!") ? "#15803d" : "var(--red)" }}>
            {msg}
          </p>
        )}
        <input
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Create account</button>
      </div>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
