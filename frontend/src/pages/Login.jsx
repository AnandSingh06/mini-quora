import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await API.post("/login", { username, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        navigate("/");
        window.location.reload();
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="auth">
      <h2>Welcome back</h2>
      <p className="auth-sub">Sign in to your account</p>

      <div className="auth-card">
        {error && (
          <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12, background: "var(--red-light)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
            {error}
          </p>
        )}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={handleLogin}>Sign in</button>
      </div>

      <p className="auth-footer">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
