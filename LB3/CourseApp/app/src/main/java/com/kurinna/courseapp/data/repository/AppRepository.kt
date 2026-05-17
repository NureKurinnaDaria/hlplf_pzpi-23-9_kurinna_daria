package com.kurinna.courseapp.data.repository

import com.kurinna.courseapp.data.model.*
import java.security.MessageDigest

object AppRepository {

    private val users = mutableListOf<User>()
    private val courses = mutableListOf<Course>()
    private val enrollments = mutableListOf<Enrollment>()
    private val reviews = mutableListOf<Review>()
    private val learningPaths = mutableListOf<LearningPath>()

    private var currentUser: User? = null
    private var nextUserId = 1
    private var nextCourseId = 1
    private var nextEnrollId = 1
    private var nextReviewId = 1
    private var nextPathId = 1

    init {
        initDefaultData()
    }

    fun initDefaultData() {
        // Додаємо тільки якщо даних ще немає
        if (users.isEmpty()) {
            users.add(User(nextUserId++, "admin@courseapp.com", "Адміністратор", hashPassword("admin123"), UserRole.ADMIN))
            users.add(User(nextUserId++, "demo@courseapp.com", "Demo User", hashPassword("password123"), UserRole.STUDENT))
        }
        if (courses.isEmpty()) {
            addCourse("Kotlin для початківців", "Базовий курс мови Kotlin", "Іван Петренко", "Програмування", 12)
            addCourse("Android розробка", "Повний курс Android з Kotlin", "Олена Коваль", "Програмування", 40)
            addCourse("UI/UX Дизайн", "Принципи та інструменти дизайну", "Марта Лисенко", "Дизайн", 20)
            addCourse("Python Data Science", "Аналіз даних із Python", "Дмитро Бондар", "Data Science", 30)
            addCourse("Машинне навчання", "ML алгоритми та їх застосування", "Sofiya Melnyk", "Data Science", 50)
            addCourse("Веб-розробка React", "Сучасний фронтенд на React", "Anton Kravets", "Веб", 35)
        }
    }

    // ── Авторизація ──────────────────────────────────────────────────────────

    fun registerUser(email: String, name: String, password: String): Result<User> {
        if (users.any { it.email == email })
            return Result.failure(Exception("Email вже зареєстровано"))
        val user = User(nextUserId++, email, name, hashPassword(password), UserRole.STUDENT)
        users.add(user)
        return Result.success(user)
    }

    fun login(email: String, password: String): Result<User> {
        val user = users.find { it.email == email && it.passwordHash == hashPassword(password) }
            ?: return Result.failure(Exception("Невірний email або пароль"))
        currentUser = user
        return Result.success(user)
    }

    fun logout() { currentUser = null }
    fun getCurrentUser() = currentUser
    fun isLoggedIn() = currentUser != null
    fun isAdmin() = currentUser?.role == UserRole.ADMIN

    private fun hashPassword(password: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(password.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    // ── Курси ────────────────────────────────────────────────────────────────

    fun getAllCourses(): List<Course> = courses.toList()

    fun getCourseById(id: Int): Course? = courses.find { it.id == id }

    fun getCategories(): List<String> = courses.map { it.category }.distinct().sorted()

    fun searchCourses(query: String): List<Course> {
        val q = query.lowercase()
        return courses.filter {
            it.title.lowercase().contains(q) ||
                    it.description.lowercase().contains(q) ||
                    it.category.lowercase().contains(q)
        }
    }

    fun addCourse(title: String, description: String, instructor: String, category: String, durationHours: Int): Course {
        val course = Course(nextCourseId++, title, description, instructor, category, durationHours)
        courses.add(course)
        return course
    }

    fun deleteCourse(courseId: Int) {
        courses.removeAll { it.id == courseId }
        enrollments.removeAll { it.courseId == courseId }
        reviews.removeAll { it.courseId == courseId }
        learningPaths.forEach { it.courseIds.remove(courseId) }
    }

    // ── Записи ───────────────────────────────────────────────────────────────

    fun enrollCourse(userId: Int, courseId: Int): Result<Enrollment> {
        if (enrollments.any { it.userId == userId && it.courseId == courseId })
            return Result.failure(Exception("Вже записано на цей курс"))
        val enrollment = Enrollment(nextEnrollId++, courseId, userId)
        enrollments.add(enrollment)
        return Result.success(enrollment)
    }

    fun isEnrolled(userId: Int, courseId: Int): Boolean =
        enrollments.any { it.userId == userId && it.courseId == courseId }

    fun getEnrollmentStatus(userId: Int, courseId: Int): EnrollmentStatus? =
        enrollments.find { it.userId == userId && it.courseId == courseId }?.status

    fun updateEnrollmentStatus(userId: Int, courseId: Int, status: EnrollmentStatus) {
        enrollments.find { it.userId == userId && it.courseId == courseId }?.status = status
    }

    fun getEnrolledCourses(userId: Int): List<Course> {
        val ids = enrollments.filter { it.userId == userId }.map { it.courseId }
        return courses.filter { it.id in ids }
    }

    fun getEnrollmentsForCourse(courseId: Int): List<Enrollment> =
        enrollments.filter { it.courseId == courseId }

    // ── Відгуки ──────────────────────────────────────────────────────────────

    fun addReview(userId: Int, courseId: Int, rating: Float, comment: String): Result<Review> {
        if (!isEnrolled(userId, courseId))
            return Result.failure(Exception("Спочатку запишіться на курс"))
        if (reviews.any { it.userId == userId && it.courseId == courseId })
            return Result.failure(Exception("Ви вже залишили відгук"))
        val user = users.find { it.id == userId }
            ?: return Result.failure(Exception("Користувача не знайдено"))
        val review = Review(nextReviewId++, courseId, userId, user.name, rating, comment)
        reviews.add(review)
        return Result.success(review)
    }

    fun getReviewsForCourse(courseId: Int): List<Review> =
        reviews.filter { it.courseId == courseId }

    fun getAverageRating(courseId: Int): Float {
        val r = getReviewsForCourse(courseId)
        return if (r.isEmpty()) 0f else r.map { it.rating }.average().toFloat()
    }

    fun hasUserReviewed(userId: Int, courseId: Int): Boolean =
        reviews.any { it.userId == userId && it.courseId == courseId }

    // ── Навчальні програми (тільки адмін) ───────────────────────────────────

    fun createLearningPath(title: String, description: String, courseIds: List<Int>): LearningPath {
        val path = LearningPath(nextPathId++, title, description, courseIds.toMutableList())
        learningPaths.add(path)
        return path
    }

    fun getAllLearningPaths(): List<LearningPath> = learningPaths.toList()

    fun getLearningPathById(id: Int): LearningPath? = learningPaths.find { it.id == id }

    fun addCourseToPath(pathId: Int, courseId: Int) {
        learningPaths.find { it.id == pathId }?.courseIds?.add(courseId)
    }

    fun removeCourseFromPath(pathId: Int, courseId: Int) {
        learningPaths.find { it.id == pathId }?.courseIds?.remove(courseId)
    }

    fun deleteLearningPath(pathId: Int) {
        learningPaths.removeAll { it.id == pathId }
    }

    // ── Аналітика (тільки адмін) ─────────────────────────────────────────────

    fun getSystemAnalytics(): List<CourseAnalytics> {
        return courses.map { course ->
            CourseAnalytics(
                courseId         = course.id,
                courseTitle      = course.title,
                totalEnrollments = getEnrollmentsForCourse(course.id).size,
                averageRating    = getAverageRating(course.id),
                totalReviews     = getReviewsForCourse(course.id).size
            )
        }.sortedByDescending { it.totalEnrollments }
    }

    fun getTotalUsers(): Int = users.count { it.role == UserRole.STUDENT }
    fun getTotalEnrollments(): Int = enrollments.size
    fun getTotalCourses(): Int = courses.size

    // ── Профіль ──────────────────────────────────────────────────────────────

    fun updateUserName(userId: Int, newName: String): Boolean {
        val idx = users.indexOfFirst { it.id == userId }
        if (idx == -1) return false
        users[idx] = users[idx].copy(name = newName)
        if (currentUser?.id == userId) currentUser = users[idx]
        return true
    }

    fun changePassword(userId: Int, oldPassword: String, newPassword: String): Result<Unit> {
        val user = users.find { it.id == userId }
            ?: return Result.failure(Exception("Користувача не знайдено"))
        if (user.passwordHash != hashPassword(oldPassword))
            return Result.failure(Exception("Старий пароль невірний"))
        val idx = users.indexOf(user)
        users[idx] = user.copy(passwordHash = hashPassword(newPassword))
        return Result.success(Unit)
    }

    // ── Функції для збереження/завантаження ─────────────────────────────────────

    fun getUsersForSave() = users.toList()
    fun getCoursesForSave() = courses.toList()
    fun getEnrollmentsForSave() = enrollments.toList()
    fun getReviewsForSave() = reviews.toList()
    fun getPathsForSave() = learningPaths.toList()

    fun loadUsers(data: List<User>) {
        users.clear()
        users.addAll(data)
        nextUserId = (data.maxOfOrNull { it.id } ?: 0) + 1
    }

    fun loadCourses(data: List<Course>) {
        courses.clear()
        courses.addAll(data)
        nextCourseId = (data.maxOfOrNull { it.id } ?: 0) + 1
    }

    fun loadEnrollments(data: List<Enrollment>) {
        enrollments.clear()
        enrollments.addAll(data)
        nextEnrollId = (data.maxOfOrNull { it.id } ?: 0) + 1
    }

    fun loadReviews(data: List<Review>) {
        reviews.clear()
        reviews.addAll(data)
        nextReviewId = (data.maxOfOrNull { it.id } ?: 0) + 1
    }

    fun loadPaths(data: List<LearningPath>) {
        learningPaths.clear()
        learningPaths.addAll(data)
        nextPathId = (data.maxOfOrNull { it.id } ?: 0) + 1
    }

    fun loginById(userId: Int) {
        currentUser = users.find { it.id == userId }
    }
}