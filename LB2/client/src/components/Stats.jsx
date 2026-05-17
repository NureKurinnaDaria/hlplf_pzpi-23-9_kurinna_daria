import { useEffect, useState } from "react";
import axios from "axios";

export default function Stats({ role }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (role === "admin") {
      axios.get("/api/stats").then((r) => setStats(r.data));
    }
  }, [role]);

  if (role !== "admin") {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h3>Доступ заборонено</h3>
        <p>Статистика доступна тільки адміністратору</p>
      </div>
    );
  }

  if (!stats) return <div className="empty-state">Завантаження...</div>;

  return (
    <div>
      <div className="info-bar">
        <strong>Статистика платформи</strong> — доступна тільки адміністратору.
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{stats.totalCourses}</div>
          <div>Курсів</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.totalUsers}</div>
          <div>Користувачів</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.totalEnrollments}</div>
          <div>Записів</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.totalLearningPaths}</div>
          <div>Програм</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">🏆 Топ курс</div>
        <div className="card-body">{stats.topCourse}</div>
      </div>
      <div className="card">
        <div className="card-header">📂 Категорії</div>
        <div className="card-body">
          {stats.categories.map((c) => (
            <span key={c} className="badge-code" style={{ marginRight: 8 }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
