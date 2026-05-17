import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Заповніть всі поля");
      return;
    }
    setLoading(true);
    try {
      const r = await axios.post("/api/login", form);
      onLogin(r.data.token, r.data.username, r.data.firstName, r.data.role);
    } catch (err) {
      setError(err.response?.data?.error || "Помилка входу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Вхід до акаунту</h2>
          <p>Раді бачити вас знову!</p>
        </div>
        <div className="auth-body">
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <label className="input-label">Email</label>
            <input
              className="input"
              placeholder="Введіть email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <label className="input-label">Пароль</label>
            <input
              className="input"
              type="password"
              placeholder="Введіть пароль"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Завантаження..." : "Увійти →"}
            </button>
          </form>
          <div className="auth-divider">Немає акаунту?</div>
          <Link to="/register" className="auth-link">
            Зареєструватися безкоштовно
          </Link>
        </div>
      </div>
    </div>
  );
}
