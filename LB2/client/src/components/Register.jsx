import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function checkRules(password) {
  return [
    { label: "Мінімум 8 символів", valid: password.length >= 8 },
    { label: "Велика літера (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Мала літера (a-z)", valid: /[a-z]/.test(password) },
    { label: "Цифра (0-9)", valid: /[0-9]/.test(password) },
    { label: "Спецсимвол (!@#$%^&*)", valid: /[!@#$%^&*]/.test(password) },
  ];
}

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const rules = checkRules(form.password);
  const allValid = rules.every((r) => r.valid);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!allValid) {
      setError("Пароль не відповідає вимогам");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Паролі не співпадають");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/register", form);
      setMsg("✅ Реєстрація успішна!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Помилка реєстрації");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🎓</div>
          <h2>Створити акаунт</h2>
          <p>Приєднуйтесь до тисяч студентів</p>
        </div>
        <div className="auth-body">
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label className="input-label">Імʼя</label>
                <input
                  className="input"
                  placeholder="Іванна"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="input-label">Прізвище</label>
                <input
                  className="input"
                  placeholder="Коваль"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <label className="input-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="ivanna@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <label className="input-label">Пароль</label>
            <input
              className="input"
              type="password"
              placeholder="Створіть надійний пароль"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {form.password && (
              <div className="password-rules">
                <p>Вимоги до паролю:</p>
                {rules.map((r) => (
                  <div
                    key={r.label}
                    className={`rule ${r.valid ? "valid" : "invalid"}`}
                  >
                    <span className="rule-icon">{r.valid ? "✅" : "○"}</span>
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <label className="input-label">Підтвердження паролю</label>
            <input
              className="input"
              type="password"
              placeholder="Повторіть пароль"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
            {form.confirm && form.password !== form.confirm && (
              <div className="alert alert-error" style={{ marginTop: -8 }}>
                ⚠️ Паролі не співпадають
              </div>
            )}

            <button
              className="btn btn-success btn-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Завантаження..." : "Зареєструватися →"}
            </button>
          </form>
          <div className="auth-divider">Вже є акаунт?</div>
          <Link to="/login" className="auth-link">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
}
