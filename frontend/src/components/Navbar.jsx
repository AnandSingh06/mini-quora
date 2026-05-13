import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // seed input from URL so it stays in sync on page load
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/");
    }
  };

  const handleClear = () => {
    setQuery("");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">Mini Quora</h2>

      {/* SEARCH BAR */}
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search by topic"
          />
          {query && (
            <button type="button" className="search-clear" onClick={handleClear} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </form>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {token ? (
          <>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>@{username}</span>
            <Link to="/create" className="create-btn">+ Create</Link>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
