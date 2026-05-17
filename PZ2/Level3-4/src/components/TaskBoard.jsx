import { useMemo, useState } from "react";
import TaskForm from "./TaskForm.jsx";
import TaskItem from "./TaskItem.jsx";

function TaskBoard({ tags, tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (search.trim()) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter === "active") {
      result = result.filter((task) => !task.done);
    }

    if (statusFilter === "done") {
      result = result.filter((task) => task.done);
    }

    if (tagFilter !== "all") {
      result = result.filter((task) => task.tags.includes(tagFilter));
    }

    return result;
  }, [tasks, search, statusFilter, tagFilter]);

  return (
    <main className="board">
      <TaskForm tags={tags} onAddTask={onAddTask} />

      <section className="card">
        <h2>🔎 Пошук і фільтрація</h2>

        <div className="filters-grid">
          <div className="form-group">
            <label>Пошук</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Введіть назву завдання..."
            />
          </div>

          <div className="form-group">
            <label>Статус</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Всі</option>
              <option value="active">Активні</option>
              <option value="done">Завершені</option>
            </select>
          </div>

          <div className="form-group">
            <label>Мітка</label>
            <select
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
            >
              <option value="all">Всі мітки</option>
              {tags.map((tag) => (
                <option key={tag.label} value={tag.label}>
                  {tag.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="tasks-section">
        <div className="section-header">
          <h2>Мої завдання</h2>
          <span>Показано: {filteredTasks.length}</span>
        </div>

        <div className="tasks-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                tags={tags}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          ) : (
            <div className="empty-state">
              😕 Завдань не знайдено. Додайте нове завдання або змініть фільтри.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default TaskBoard;
