import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function CourseList({ token, role }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    level: "",
  });
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchCourses();
    axios.get("/api/categories").then((r) => setCategories(r.data));
  }, [search, category, level]);

  function fetchCourses() {
    axios
      .get("/api/courses", { params: { search, category, level } })
      .then((r) => setCourses(r.data));
  }

  function startEdit(course) {
    setEditId(course.id);
    setEditForm({
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      level: course.level,
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      await axios.put(`/api/courses/${editId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Курс оновлено!");
      setEditId(null);
      fetchCourses();
    } catch (err) {
      setMsg(err.response?.data?.error || "Помилка");
    }
  }

  async function deleteCourse(id) {
    if (!window.confirm("Видалити цей курс?")) return;
    try {
      await axios.delete(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Курс видалено!");
      fetchCourses();
    } catch (err) {
      setMsg(err.response?.data?.error || "Помилка");
    }
  }

  async function addCourse(e) {
    e.preventDefault();
    try {
      await axios.post("/api/courses", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Курс додано!");
      setShowAdd(false);
      setForm({
        title: "",
        description: "",
        category: "",
        duration: "",
        level: "",
      });
      fetchCourses();
    } catch (err) {
      setMsg(err.response?.data?.error || "Помилка");
    }
  }

  return (
    <div>
      <div className="info-bar">
        <strong>Рівень 1:</strong> Каталог курсів. &nbsp;
        <strong>Рівень 2:</strong> Запис та відгуки на сторінці курсу. &nbsp;
        <strong>Рівень 4:</strong> Додавання нових курсів (тільки адмін).
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="🔍 Пошук курсу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Всі категорії</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="input"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Всі рівні</option>
          <option value="Початківець">Початківець</option>
          <option value="Середній">Середній</option>
          <option value="Просунутий">Просунутий</option>
        </select>
        {role === "admin" && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAdd(!showAdd)}
          >
            ➕ Додати курс
          </button>
        )}
      </div>

      {msg && <div className="alert">{msg}</div>}

      {showAdd && role === "admin" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">Новий курс</div>
          <div className="card-body">
            <form onSubmit={addCourse} className="form-grid">
              <input
                className="input"
                placeholder="Назва"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="input"
                placeholder="Категорія"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                className="input"
                placeholder="Тривалість (напр. 10 годин)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
              <select
                className="input"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                <option value="">Оберіть рівень</option>
                <option value="Початківець">Початківець</option>
                <option value="Середній">Середній</option>
                <option value="Просунутий">Просунутий</option>
              </select>
              <textarea
                className="input"
                placeholder="Опис"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button className="btn btn-success" type="submit">
                Зберегти
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="course-grid">
        {courses.map((course) =>
          editId === course.id ? (
            <div className="card course-card" key={course.id}>
              <div className="card-header">✏️ Редагування: {course.title}</div>
              <div className="card-body">
                <form onSubmit={saveEdit} className="form-grid">
                  <input
                    className="input"
                    placeholder="Назва"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Категорія"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Тривалість"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm({ ...editForm, duration: e.target.value })
                    }
                  />
                  <select
                    className="input"
                    value={editForm.level}
                    onChange={(e) =>
                      setEditForm({ ...editForm, level: e.target.value })
                    }
                  >
                    <option value="Початківець">Початківець</option>
                    <option value="Середній">Середній</option>
                    <option value="Просунутий">Просунутий</option>
                  </select>
                  <textarea
                    className="input"
                    placeholder="Опис"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-success" type="submit">
                      Зберегти
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => setEditId(null)}
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card course-card" key={course.id}>
              <div className="card-header">{course.title}</div>
              <div className="card-body">
                <p>{course.description}</p>
                <div className="meta-row">
                  <span className="badge-code">{course.category}</span>
                  <span className="meta-info">⏱ {course.duration}</span>
                  <span className="rate-buy">
                    ⭐ {course.rating.toFixed(1)}
                  </span>
                </div>
                <div className="meta-info">
                  👥 Записано: {course.enrolledUsers.length}
                </div>
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-primary"
                  style={{ marginTop: 12, display: "inline-block" }}
                >
                  Детальніше →
                </Link>
                {role === "admin" && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-warning"
                      onClick={() => startEdit(course)}
                    >
                      ✏️ Редагувати
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteCourse(course.id)}
                    >
                      🗑️ Видалити
                    </button>
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
