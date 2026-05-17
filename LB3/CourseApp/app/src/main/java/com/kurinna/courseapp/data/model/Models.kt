package com.kurinna.courseapp.data.model

import java.util.Date

enum class UserRole {
    STUDENT, ADMIN
}

data class User(
    val id: Int,
    val email: String,
    val name: String,
    val passwordHash: String,
    val role: UserRole = UserRole.STUDENT,
    val createdAt: Date = Date()
)

data class Course(
    val id: Int,
    val title: String,
    val description: String,
    val instructor: String,
    val category: String,
    val durationHours: Int
)

enum class EnrollmentStatus {
    ENROLLED,      // Записаний
    IN_PROGRESS,   // В процесі
    COMPLETED      // Завершено
}

data class Enrollment(
    val id: Int,
    val courseId: Int,
    val userId: Int,
    val enrolledAt: Date = Date(),
    var status: EnrollmentStatus = EnrollmentStatus.ENROLLED
)

data class Review(
    val id: Int,
    val courseId: Int,
    val userId: Int,
    val userName: String,
    val rating: Float,
    val comment: String,
    val createdAt: Date = Date()
)

data class LearningPath(
    val id: Int,
    val title: String,
    val description: String,
    val courseIds: MutableList<Int> = mutableListOf(),
    val createdAt: Date = Date()
)

data class CourseAnalytics(
    val courseId: Int,
    val courseTitle: String,
    val totalEnrollments: Int,
    val averageRating: Float,
    val totalReviews: Int
)