import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CourseDetail({ token, username, role }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get(`/api/courses/${id}`).then((r) => setCourse(r.data));
  }, [id]);

  async function enroll() {
    try {
      const r = await axios.post(
        `/api/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMsg("✅ " + r.data.message);
      axios.get(`/api/courses/${id}`).then((r) => setCourse(r.data));
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.error || "Помилка"));
    }
  }

  async function addReview(e) {
    e.preventDefault();
    try {
      await axios.post(
        `/api/courses/${id}/reviews`,
        { text: reviewText, rating: reviewRating },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMsg("✅ Відгук додано!");
      setReviewText("");
      axios.get(`/api/courses/${id}`).then((r) => setCourse(r.data));
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.error || "Помилка"));
    }
  }

  if (!course) return <div className="empty-state">Завантаження...</div>;

  const isEnrolled = course.enrolledUsers.includes(username);
  const hasReviewed = course.reviews.some((r) => r.user === username);

  return (
    <div>
      <div className="card">
        <div className="card-header">{course.title}</div>
        <div className="card-body">
          <p style={{ marginBottom: 12 }}>{course.description}</p>
          <div className="meta-row">
            <span className="badge-code">{course.category}</span>
            <span className="meta-info">⏱ {course.duration}</span>
            <span className="rate-buy">⭐ {course.rating.toFixed(1)}</span>
            <span className="meta-info">
              👥 {course.enrolledUsers.length} студентів
            </span>
          </div>

          {msg && (
            <div className="alert" style={{ marginTop: 12 }}>
              {msg}
            </div>
          )}

          {token && role !== "admin" && !isEnrolled && (
            <button
              className="btn btn-success"
              style={{ marginTop: 16 }}
              onClick={enroll}
            >
              📝 Записатися на курс
            </button>
          )}
          {isEnrolled && (
            <div className="alert alert-success" style={{ marginTop: 12 }}>
              ✅ Ви записані на цей курс
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">💬 Відгуки ({course.reviews.length})</div>
        <div className="card-body">
          {course.reviews.length === 0 && (
            <div className="empty-state">
              <p>Відгуків ще немає</p>
            </div>
          )}
          {course.reviews.map((r, i) => (
            <div key={i} className="review-item">
              <strong>{r.user}</strong>
              <span className="rate-buy" style={{ marginLeft: 8 }}>
                {"⭐".repeat(r.rating)}
              </span>
              <p>{r.text}</p>
            </div>
          ))}

          {token && role !== "admin" && isEnrolled && !hasReviewed && (
            <form onSubmit={addReview} style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 10 }}>Залишити відгук:</h4>
              <select
                className="input"
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"⭐".repeat(n)} ({n})
                  </option>
                ))}
              </select>
              <textarea
                className="input"
                placeholder="Ваш відгук..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
              />
              <button className="btn btn-primary" type="submit">
                Надіслати
              </button>
            </form>
          )}
          {token && role !== "admin" && isEnrolled && hasReviewed && (
            <p className="meta-info" style={{ marginTop: 12 }}>
              ✅ Ви вже залишили відгук на цей курс
            </p>
          )}
          {token && role !== "admin" && !isEnrolled && (
            <p className="meta-info" style={{ marginTop: 12 }}>
              📌 Запишіться на курс, щоб залишити відгук
            </p>
          )}
          {!token && (
            <p className="meta-info" style={{ marginTop: 12 }}>
              Увійдіть, щоб залишити відгук
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
