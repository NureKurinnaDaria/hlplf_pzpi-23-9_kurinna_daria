import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function LearningPath({ token, role }) {
  const [paths, setPaths] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseIds: [],
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    axios.get("/api/learning-paths").then((r) => setPaths(r.data));
    axios.get("/api/courses").then((r) => setCourses(r.data));
  }, []);

  function toggleCourse(id) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id)
        ? f.courseIds.filter((c) => c !== id)
        : [...f.courseIds, id],
    }));
  }

  async function createPath(e) {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/learning-paths", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Програму створено!");
      setShowAdd(false);
      setForm({ title: "", description: "", courseIds: [] });
      axios.get("/api/learning-paths").then((r) => setPaths(r.data));
    } catch (err) {
      setError(err.response?.data?.error || "Помилка");
    }
  }

  return (
    <div>
      <div className="info-bar">
        <strong>Рівень 3:</strong> Навчальні програми — набори курсів для
        досягнення мети.
        {role === "admin" &&
          " Ви можете створювати нові програми як адміністратор."}
      </div>

      {/* Кнопка тільки для адміна */}
      {role === "admin" && (
        <button
          className="btn btn-primary"
          style={{ marginBottom: 20 }}
          onClick={() => setShowAdd(!showAdd)}
        >
          ➕ Створити програму
        </button>
      )}

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showAdd && role === "admin" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">Нова навчальна програма</div>
          <div className="card-body">
            <form onSubmit={createPath}>
              <label className="input-label">Назва програми</label>
              <input
                className="input"
                placeholder="Наприклад: Fullstack розробник"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <label className="input-label">Опис</label>
              <textarea
                className="input"
                placeholder="Опишіть програму..."
                value={form.description}
                rows={3}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <label className="input-label">Оберіть курси</label>
              <div className="checkbox-list">
                {courses.map((c) => (
                  <label key={c.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.courseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    <span>{c.title}</span>
                    <span className="badge badge-primary">{c.category}</span>
                  </label>
                ))}
              </div>

              <button
                className="btn btn-success"
                type="submit"
                style={{ marginTop: 12 }}
              >
                Зберегти програму
              </button>
            </form>
          </div>
        </div>
      )}

      {paths.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3>Програм ще немає</h3>
          {role === "admin" && <p>Створіть першу навчальну програму</p>}
        </div>
      )}

      {paths.map((path) => (
        <div className="card" key={path.id}>
          <div className="card-header">🗺️ {path.title}</div>
          <div className="card-body">
            <p style={{ marginBottom: 16, color: "var(--text-light)" }}>
              {path.description}
            </p>
            <p style={{ fontWeight: 700, marginBottom: 10 }}>Курси програми:</p>
            {path.courses.map((c) => (
              /* Клікабельний курс */
              <Link
                to={`/courses/${c.id}`}
                key={c.id}
                className="path-course-item"
              >
                <div>
                  <span
                    className="badge badge-primary"
                    style={{ marginRight: 8 }}
                  >
                    {c.category}
                  </span>
                  <strong>{c.title}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="stars">⭐</span>
                  <span className="rating-num">{c.rating.toFixed(1)}</span>
                  <span
                    style={{ color: "var(--primary)", fontSize: "0.85rem" }}
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
            <p className="meta-info" style={{ marginTop: 12 }}>
              Автор: {path.createdBy}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
