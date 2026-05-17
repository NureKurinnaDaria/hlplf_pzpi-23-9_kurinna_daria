import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AuthPage from "./components/AuthPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import TaskBoard from "./components/TaskBoard.jsx";

const STORAGE_KEY = "level_3_4_taskboard_state";

const TAGS = [
  { label: "Навчання", color: "#8e44ad", bg: "#f3eafa" },
  { label: "Робота", color: "#2980b9", bg: "#eaf4fc" },
  { label: "Особисте", color: "#27ae60", bg: "#eafaf1" },
  { label: "Термінове", color: "#e74c3c", bg: "#fdecea" },
  { label: "Ідея", color: "#d68910", bg: "#fff8e1" },
];

const DEFAULT_STATE = {
  users: [
    {
      name: "Адміністратор",
      email: "admin@demo.com",
      password: "password123",
    },
  ],
  currentUserEmail: null,
  tasks: [
    {
      id: 1,
      title: "Підготувати звіт до практичного заняття",
      done: false,
      tags: ["Навчання", "Термінове"],
      userEmail: "admin@demo.com",
      createdAt: Date.now() - 3000,
    },
    {
      id: 2,
      title: "Повторити матеріал про React-компоненти",
      done: true,
      tags: ["Навчання"],
      userEmail: "admin@demo.com",
      createdAt: Date.now() - 2000,
    },
    {
      id: 3,
      title: "Записати ідею для нового проєкту",
      done: false,
      tags: ["Ідея", "Робота"],
      userEmail: "admin@demo.com",
      createdAt: Date.now() - 1000,
    },
  ],
  nextTaskId: 4,
};

function loadState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function App() {
  const [state, setState] = useState(loadState);
  const [currentPage, setCurrentPage] = useState("board");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = useMemo(() => {
    return state.users.find((user) => user.email === state.currentUserEmail);
  }, [state.users, state.currentUserEmail]);

  const currentUserTasks = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return state.tasks.filter((task) => task.userEmail === currentUser.email);
  }, [state.tasks, currentUser]);

  function login(email, password) {
    const user = state.users.find(
      (item) => item.email === email && item.password === password,
    );

    if (!user) {
      setAuthError("Невірний email або пароль.");
      return;
    }

    setState((prevState) => ({
      ...prevState,
      currentUserEmail: user.email,
    }));

    setAuthError("");
    setCurrentPage("board");
  }

  function register(name, email, password, passwordConfirm) {
    if (!name.trim()) {
      setAuthError("Введіть ім'я.");
      return;
    }

    if (!email.includes("@")) {
      setAuthError("Введіть коректний email.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Пароль має містити мінімум 6 символів.");
      return;
    }

    if (password !== passwordConfirm) {
      setAuthError("Паролі не збігаються.");
      return;
    }

    const emailExists = state.users.some((user) => user.email === email);

    if (emailExists) {
      setAuthError("Користувач із таким email вже існує.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
    };

    setState((prevState) => ({
      ...prevState,
      users: [...prevState.users, newUser],
      currentUserEmail: newUser.email,
    }));

    setAuthError("");
    setCurrentPage("board");
  }

  function logout() {
    setState((prevState) => ({
      ...prevState,
      currentUserEmail: null,
    }));

    setCurrentPage("board");
    setAuthError("");
  }

  function addTask(title, tags) {
    if (!currentUser) {
      return;
    }

    const newTask = {
      id: state.nextTaskId,
      title,
      done: false,
      tags,
      userEmail: currentUser.email,
      createdAt: Date.now(),
    };

    setState((prevState) => ({
      ...prevState,
      tasks: [newTask, ...prevState.tasks],
      nextTaskId: prevState.nextTaskId + 1,
    }));
  }

  function toggleTask(taskId) {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task,
      ),
    }));
  }

  function deleteTask(taskId) {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.filter((task) => task.id !== taskId),
    }));
  }

  function updateProfile(newName, newEmail) {
    if (!currentUser) {
      return { ok: false, message: "Користувача не знайдено." };
    }

    if (!newName.trim() || !newEmail.includes("@")) {
      return { ok: false, message: "Перевірте ім'я та email." };
    }

    const oldEmail = currentUser.email;
    const emailChanged = oldEmail !== newEmail;

    if (
      emailChanged &&
      state.users.some((user) => user.email === newEmail.trim())
    ) {
      return { ok: false, message: "Користувач із таким email вже існує." };
    }

    setState((prevState) => ({
      ...prevState,
      users: prevState.users.map((user) =>
        user.email === oldEmail
          ? { ...user, name: newName.trim(), email: newEmail.trim() }
          : user,
      ),
      currentUserEmail: newEmail.trim(),
      tasks: prevState.tasks.map((task) =>
        task.userEmail === oldEmail
          ? { ...task, userEmail: newEmail.trim() }
          : task,
      ),
    }));

    return { ok: true, message: "Профіль оновлено." };
  }

  function changePassword(currentPassword, newPassword, newPasswordConfirm) {
    if (!currentUser) {
      return { ok: false, message: "Користувача не знайдено." };
    }

    if (currentPassword !== currentUser.password) {
      return { ok: false, message: "Поточний пароль введено неправильно." };
    }

    if (newPassword.length < 6) {
      return {
        ok: false,
        message: "Новий пароль має містити мінімум 6 символів.",
      };
    }

    if (newPassword !== newPasswordConfirm) {
      return { ok: false, message: "Нові паролі не збігаються." };
    }

    setState((prevState) => ({
      ...prevState,
      users: prevState.users.map((user) =>
        user.email === currentUser.email
          ? { ...user, password: newPassword }
          : user,
      ),
    }));

    return { ok: true, message: "Пароль змінено." };
  }

  if (!currentUser) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        authError={authError}
        clearAuthError={() => setAuthError("")}
      />
    );
  }

  const totalTasks = currentUserTasks.length;
  const doneTasks = currentUserTasks.filter((task) => task.done).length;
  const activeTasks = currentUserTasks.filter((task) => !task.done).length;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>📋 TaskBoard</h1>
          <p>Інтерактивна дошка завдань із мітками та профілем користувача</p>
        </div>

        <div className="user-panel">
          <span>Привіт, {currentUser.name}</span>
          <button
            className="avatar"
            onClick={() => setCurrentPage("profile")}
            title="Профіль"
          >
            {currentUser.name[0].toUpperCase()}
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <nav className="page-tabs">
        <button
          className={currentPage === "board" ? "tab active" : "tab"}
          onClick={() => setCurrentPage("board")}
        >
          🗂 Дошка завдань
        </button>

        <button
          className={currentPage === "profile" ? "tab active" : "tab"}
          onClick={() => setCurrentPage("profile")}
        >
          👤 Профіль
        </button>
      </nav>

      {currentPage === "board" && (
        <>
          <section className="stats">
            <div className="stat-card">
              <span>{totalTasks}</span>
              <p>Усього</p>
            </div>
            <div className="stat-card">
              <span>{activeTasks}</span>
              <p>Активні</p>
            </div>
            <div className="stat-card">
              <span>{doneTasks}</span>
              <p>Завершені</p>
            </div>
          </section>

          <TaskBoard
            tags={TAGS}
            tasks={currentUserTasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        </>
      )}

      {currentPage === "profile" && (
        <ProfilePage
          user={currentUser}
          totalTasks={totalTasks}
          activeTasks={activeTasks}
          doneTasks={doneTasks}
          onUpdateProfile={updateProfile}
          onChangePassword={changePassword}
        />
      )}
    </div>
  );
}

export default App;
