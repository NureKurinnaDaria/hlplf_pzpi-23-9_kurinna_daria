import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import CourseList from "./components/CourseList";
import CourseDetail from "./components/CourseDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import LearningPath from "./components/LearningPath";
import Stats from "./components/Stats";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
  const [firstName, setFirstName] = useState(
    localStorage.getItem("firstName") || "",
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogin(t, u, f, r) {
    setToken(t);
    setUsername(u);
    setFirstName(f);
    setRole(r);
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    localStorage.setItem("firstName", f);
    localStorage.setItem("role", r);
    navigate("/");
  }

  function handleLogout() {
    setToken("");
    setUsername("");
    setFirstName("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("firstName");
    localStorage.removeItem("role");
    navigate("/");
  }

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <div>
      <header className="header">
        <div>
          <h1>🎓 CourseHub</h1>
          <div className="subtitle">Навчайся. Розвивайся. Досягай.</div>
        </div>
      </header>

      <nav className="nav">
        <Link to="/" className={isActive("/")}>
          📚 Курси
        </Link>
        <Link to="/paths" className={isActive("/paths")}>
          🗺️ Програми
        </Link>
        {role === "admin" && (
          <Link to="/stats" className={isActive("/stats")}>
            📊 Статистика
          </Link>
        )}
        <div className="nav-spacer" />
        {token ? (
          <>
            <span className="nav-user">👋 {firstName || username}</span>
            <button className="nav-btn" onClick={handleLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive("/login")}>
              Увійти
            </Link>
            <Link to="/register" className={isActive("/register")}>
              Реєстрація
            </Link>
          </>
        )}
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<CourseList token={token} role={role} />} />
          <Route
            path="/courses/:id"
            element={
              <CourseDetail token={token} username={username} role={role} />
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/paths"
            element={<LearningPath token={token} role={role} />}
          />
          <Route path="/stats" element={<Stats role={role} />} />{" "}
        </Routes>
      </div>
    </div>
  );
}
