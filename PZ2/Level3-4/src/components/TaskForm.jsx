import { useState } from "react";

function TaskForm({ tags, onAddTask }) {
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  function toggleTag(tagLabel) {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagLabel)
        ? prevTags.filter((tag) => tag !== tagLabel)
        : [...prevTags, tagLabel],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    onAddTask(title.trim(), selectedTags);
    setTitle("");
    setSelectedTags([]);
  }

  return (
    <section className="card">
      <h2>➕ Нове завдання</h2>

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Назва завдання</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Наприклад: підготувати звіт"
          />
        </div>

        <div className="form-group">
          <label>Мітки</label>

          <div className="tag-picker">
            {tags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                className={
                  selectedTags.includes(tag.label)
                    ? "tag-option selected"
                    : "tag-option"
                }
                style={{ background: tag.bg, color: tag.color }}
                onClick={() => toggleTag(tag.label)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" type="submit">
          Додати завдання
        </button>
      </form>
    </section>
  );
}

export default TaskForm;
