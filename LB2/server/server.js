require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "courses_secret_fallback";
const PORT = process.env.PORT || 3000;
const USERS_FILE = "./users.json";
const COURSES_FILE = "./courses.json";
const PATHS_FILE = "./paths.json";

// ── Завантаження з файлів ──
function loadJSON(file, defaultValue) {
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file, "utf-8");
    return JSON.parse(data);
  }
  return defaultValue;
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function saveCourses() {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));
}

function savePaths() {
  fs.writeFileSync(PATHS_FILE, JSON.stringify(learningPaths, null, 2));
}

// ── Початкові дані курсів ──
const defaultCourses = [
  {
    id: 1,
    title: "Python для початківців",
    description: "Основи мови Python з нуля. Змінні, функції, цикли, ООП.",
    category: "Програмування",
    duration: "20 годин",
    level: "Початківець",
    rating: 0,
    reviews: [],
    enrolledUsers: [],
  },
  {
    id: 2,
    title: "Веб-дизайн з Figma",
    description:
      "Проектування інтерфейсів у Figma від прототипу до фінального дизайну.",
    category: "Дизайн",
    duration: "15 годин",
    level: "Середній",
    rating: 0,
    reviews: [],
    enrolledUsers: [],
  },
  {
    id: 3,
    title: "React з нуля",
    description: "Повний курс по React.js — хуки, стан, маршрутизація, API.",
    category: "Програмування",
    duration: "30 годин",
    level: "Середній",
    rating: 0,
    reviews: [],
    enrolledUsers: [],
  },
  {
    id: 4,
    title: "UI/UX для розробників",
    description:
      "Основи дизайну для тих, хто пише код. Кольори, типографіка, сітки.",
    category: "Дизайн",
    duration: "10 годин",
    level: "Початківець",
    rating: 0,
    reviews: [],
    enrolledUsers: [],
  },
];

const defaultPaths = [
  {
    id: 1,
    title: "Frontend розробник",
    description: "Повний шлях від дизайну до коду",
    courseIds: [2, 3],
    createdBy: "admin",
  },
];

// ── Завантаження даних ──
let users = loadJSON(USERS_FILE, []);
let courses = loadJSON(COURSES_FILE, defaultCourses);
let learningPaths = loadJSON(PATHS_FILE, defaultPaths);

// Якщо файл курсів не існував — зберегти дефолтні
if (!fs.existsSync(COURSES_FILE)) saveCourses();
if (!fs.existsSync(PATHS_FILE)) savePaths();

// ── Лічильники ──
let nextCourseId =
  courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1;
let nextUserId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
let nextPathId =
  learningPaths.length > 0
    ? Math.max(...learningPaths.map((p) => p.id)) + 1
    : 1;

// ── Валідація паролю ──
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Мінімум 8 символів");
  if (!/[A-Z]/.test(password)) errors.push("Хоча б одна велика літера");
  if (!/[a-z]/.test(password)) errors.push("Хоча б одна мала літера");
  if (!/[0-9]/.test(password)) errors.push("Хоча б одна цифра");
  if (!/[!@#$%^&*]/.test(password))
    errors.push("Хоча б один спецсимвол (!@#$%^&*)");
  return errors;
}

// ── Middleware авторизації ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Не авторизовано" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Невірний токен" });
  }
}

// ── Курси ──
app.get("/api/courses", (req, res) => {
  const { category, search, level } = req.query;
  let result = [...courses];
  if (category) result = result.filter((c) => c.category === category);
  if (level) result = result.filter((c) => c.level === level);
  if (search)
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()),
    );
  res.json(result);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });
  res.json(course);
});

app.get("/api/categories", (req, res) => {
  res.json([...new Set(courses.map((c) => c.category))]);
});

app.post("/api/courses", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ error: "Тільки адміністратор може додавати курси" });
  const { title, description, category, duration, level } = req.body;
  if (!title || !description || !category || !duration)
    return res.status(400).json({ error: "Заповніть всі поля" });
  const course = {
    id: nextCourseId++,
    title,
    description,
    category,
    duration,
    level: level || "Початківець",
    rating: 0,
    reviews: [],
    enrolledUsers: [],
  };
  courses.push(course);
  saveCourses();
  res.json({ message: "Курс додано", course });
});

// ── Запис на курс ──
app.post("/api/courses/:id/enroll", authMiddleware, (req, res) => {
  if (req.user.role === "admin")
    return res
      .status(403)
      .json({ error: "Адміністратор не може записуватись на курси" });
  const course = courses.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });
  if (course.enrolledUsers.includes(req.user.username))
    return res.status(400).json({ error: "Ви вже записані на цей курс" });
  course.enrolledUsers.push(req.user.username);
  saveCourses();
  res.json({ message: `Ви успішно записались на курс "${course.title}"` });
});

// ── Відгуки ──
app.post("/api/courses/:id/reviews", authMiddleware, (req, res) => {
  if (req.user.role === "admin")
    return res
      .status(403)
      .json({ error: "Адміністратор не може залишати відгуки" });
  const course = courses.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });
  if (!course.enrolledUsers.includes(req.user.username))
    return res
      .status(403)
      .json({ error: "Ви можете залишити відгук лише після запису на курс" });
  const alreadyReviewed = course.reviews.find(
    (r) => r.user === req.user.username,
  );
  if (alreadyReviewed)
    return res
      .status(400)
      .json({ error: "Ви вже залишили відгук на цей курс" });
  const { text, rating } = req.body;
  if (!text || !rating)
    return res.status(400).json({ error: "Заповніть всі поля" });
  const review = { user: req.user.username, text, rating: Number(rating) };
  course.reviews.push(review);
  course.rating =
    course.reviews.reduce((sum, r) => sum + r.rating, 0) /
    course.reviews.length;
  saveCourses();
  res.json({ message: "Відгук додано", review });
});

// ── Авторизація ──
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: "Заповніть всі поля" });
  if (users.find((u) => u.email === email))
    return res.status(400).json({ error: "Email вже використовується" });
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0)
    return res.status(400).json({ error: passwordErrors.join(", ") });
  const hash = await bcrypt.hash(password, 10);
  const username = `${firstName} ${lastName}`;
  users.push({
    id: nextUserId++,
    username,
    email,
    firstName,
    lastName,
    password: hash,
    role: "user",
    createdAt: new Date().toISOString(),
  });
  saveUsers();
  res.json({ message: "Реєстрація успішна" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Заповніть всі поля" });
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "Користувача не знайдено" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Невірний пароль" });
  const token = jwt.sign(
    { username: user.username, firstName: user.firstName, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
  res.json({
    token,
    username: user.username,
    firstName: user.firstName,
    role: user.role,
  });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  const user = users.find((u) => u.username === req.user.username);
  const enrolled = courses.filter((c) =>
    c.enrolledUsers.includes(req.user.username),
  );
  res.json({ ...user, password: undefined, enrolledCourses: enrolled });
});

// ── Навчальні програми ──
app.get("/api/learning-paths", (req, res) => {
  const result = learningPaths.map((path) => ({
    ...path,
    courses: path.courseIds
      .map((id) => courses.find((c) => c.id === id))
      .filter(Boolean),
  }));
  res.json(result);
});

app.post("/api/learning-paths", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ error: "Тільки адміністратор може створювати програми" });
  const { title, description, courseIds } = req.body;
  if (!title || !courseIds?.length)
    return res.status(400).json({ error: "Заповніть всі поля" });
  const path = {
    id: nextPathId++,
    title,
    description,
    courseIds,
    createdBy: req.user.username,
  };
  learningPaths.push(path);
  savePaths();
  res.json({ message: "Програму створено", path });
});

// ── Редагування курсу ──
app.put("/api/courses/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ error: "Тільки адміністратор може редагувати курси" });
  const course = courses.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });
  const { title, description, category, duration, level } = req.body;
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (duration) course.duration = duration;
  if (level) course.level = level;
  saveCourses();
  res.json({ message: "Курс оновлено", course });
});

// ── Видалення курсу ──
app.delete("/api/courses/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ error: "Тільки адміністратор може видаляти курси" });
  const idx = courses.findIndex((c) => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Курс не знайдено" });
  courses.splice(idx, 1);
  // Прибрати курс з усіх програм
  learningPaths.forEach((p) => {
    p.courseIds = p.courseIds.filter((id) => id !== Number(req.params.id));
  });
  saveCourses();
  savePaths();
  res.json({ message: "Курс видалено" });
});

// ── Статистика ──
app.get("/api/stats", (req, res) => {
  res.json({
    totalCourses: courses.length,
    totalUsers: users.length,
    totalLearningPaths: learningPaths.length,
    totalEnrollments: courses.reduce(
      (sum, c) => sum + c.enrolledUsers.length,
      0,
    ),
    topCourse:
      [...courses].sort((a, b) => b.rating - a.rating)[0]?.title || "—",
    categories: [...new Set(courses.map((c) => c.category))],
  });
});

// ── Ініціалізація адміна ──
async function initAdmin() {
  if (!users.find((u) => u.email === "admin@coursehub.com")) {
    const hash = await bcrypt.hash("Admin123!", 10);
    users.push({
      id: 0,
      username: "admin",
      email: "admin@coursehub.com",
      firstName: "Admin",
      lastName: "",
      password: hash,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    saveUsers();
  }
}

initAdmin().then(() => {
  app.listen(PORT, () =>
    console.log(`Сервер запущено на http://localhost:${PORT}`),
  );
});
