function TaskItem({ task, tags, onToggleTask, onDeleteTask }) {
  function getTagStyle(tagName) {
    const tag = tags.find((item) => item.label === tagName);

    if (!tag) {
      return {};
    }

    return {
      background: tag.bg,
      color: tag.color,
    };
  }

  return (
    <article className="task-card">
      <button
        className={task.done ? "task-check done" : "task-check"}
        onClick={() => onToggleTask(task.id)}
        title={task.done ? "Позначити активним" : "Позначити виконаним"}
      >
        {task.done ? "✓" : ""}
      </button>

      <div className="task-content">
        <h3 className={task.done ? "task-title done-text" : "task-title"}>
          {task.title}
        </h3>

        <div className="task-tags">
          {task.tags.length > 0 ? (
            task.tags.map((tag) => (
              <span key={tag} className="tag-chip" style={getTagStyle(tag)}>
                {tag}
              </span>
            ))
          ) : (
            <span className="no-tags">Без міток</span>
          )}
        </div>
      </div>

      <button
        className="btn btn-danger btn-sm"
        onClick={() => onDeleteTask(task.id)}
      >
        Видалити
      </button>
    </article>
  );
}

export default TaskItem;
