import { useState } from "react";

function AuthPage({ onLogin, onRegister, authError, clearAuthError }) {
  const [mode, setMode] = useState("login");

  const [loginEmail, setLoginEmail] = useState("admin@demo.com");
  const [loginPassword, setLoginPassword] = useState("password123");

  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  function switchMode(nextMode) {
    setMode(nextMode);
    clearAuthError();
  }

  function handleLogin(event) {
    event.preventDefault();
    onLogin(loginEmail.trim(), loginPassword);
  }

  function handleRegister(event) {
    event.preventDefault();
    onRegister(name, regEmail.trim(), regPassword, regPasswordConfirm);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📋 TaskBoard</h1>
        <p className="subtitle">
          Увійдіть або зареєструйтесь для роботи з дошкою завдань
        </p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("login")}
          >
            Вхід
          </button>

          <button
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("register")}
          >
            Реєстрація
          </button>
        </div>

        {authError && <div className="error-box">{authError}</div>}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button className="btn btn-primary full-width" type="submit">
              Увійти
            </button>

            <p className="demo-text">Демо: admin@demo.com / password123</p>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Ім'я</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Іван Петренко"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(event) => setRegEmail(event.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={regPassword}
                onChange={(event) => setRegPassword(event.target.value)}
                placeholder="мін. 6 символів"
              />
            </div>

            <div className="form-group">
              <label>Підтвердження пароля</label>
              <input
                type="password"
                value={regPasswordConfirm}
                onChange={(event) => setRegPasswordConfirm(event.target.value)}
                placeholder="повторіть пароль"
              />
            </div>

            <button className="btn btn-primary full-width" type="submit">
              Зареєструватись
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
