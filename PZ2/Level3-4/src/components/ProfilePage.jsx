import { useEffect, useState } from "react";

function ProfilePage({
  user,
  totalTasks,
  activeTasks,
  doneTasks,
  onUpdateProfile,
  onChangePassword,
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [profileMessage, setProfileMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  function handleProfileSubmit(event) {
    event.preventDefault();

    const result = onUpdateProfile(name, email);
    setProfileMessage(result.message);

    setTimeout(() => {
      setProfileMessage("");
    }, 2500);
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();

    const result = onChangePassword(
      currentPassword,
      newPassword,
      newPasswordConfirm,
    );

    setPasswordMessage(result.message);

    if (result.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    }

    setTimeout(() => {
      setPasswordMessage("");
    }, 2500);
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <div className="profile-stats">
          <div>
            <span>{totalTasks}</span>
            <p>Усього</p>
          </div>
          <div>
            <span>{activeTasks}</span>
            <p>Активні</p>
          </div>
          <div>
            <span>{doneTasks}</span>
            <p>Завершені</p>
          </div>
        </div>
      </section>

      <section className="profile-forms">
        <form className="card" onSubmit={handleProfileSubmit}>
          <h2>✏️ Редагування профілю</h2>

          <div className="form-group">
            <label>Ім'я</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Зберегти зміни
          </button>

          {profileMessage && (
            <p className="message success-message">{profileMessage}</p>
          )}
        </form>

        <form className="card" onSubmit={handlePasswordSubmit}>
          <h2>🔒 Зміна пароля</h2>

          <div className="form-group">
            <label>Поточний пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Новий пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="мін. 6 символів"
            />
          </div>

          <div className="form-group">
            <label>Підтвердження нового пароля</label>
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(event) => setNewPasswordConfirm(event.target.value)}
              placeholder="повторіть пароль"
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Змінити пароль
          </button>

          {passwordMessage && (
            <p className="message warning-message">{passwordMessage}</p>
          )}
        </form>
      </section>
    </main>
  );
}

export default ProfilePage;
