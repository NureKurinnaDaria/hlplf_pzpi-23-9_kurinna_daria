package com.kurinna.courseapp.data.repository

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.kurinna.courseapp.data.model.*

object DataStorage {

    private const val PREFS_NAME = "courseapp_data"
    private val gson = Gson()

    // ── Збереження ───────────────────────────────────────────────────────────

    fun saveAll(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val editor = prefs.edit()
        editor.putString("users",         gson.toJson(AppRepository.getUsersForSave()))
        editor.putString("courses",       gson.toJson(AppRepository.getCoursesForSave()))
        editor.putString("enrollments",   gson.toJson(AppRepository.getEnrollmentsForSave()))
        editor.putString("reviews",       gson.toJson(AppRepository.getReviewsForSave()))
        editor.putString("paths",         gson.toJson(AppRepository.getPathsForSave()))
        editor.putString("currentUserId", AppRepository.getCurrentUser()?.id?.toString() ?: "")
        editor.apply()
    }

    // ── Завантаження ─────────────────────────────────────────────────────────

    fun loadAll(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val usersJson       = prefs.getString("users", null)
        val coursesJson     = prefs.getString("courses", null)
        val enrollmentsJson = prefs.getString("enrollments", null)
        val reviewsJson     = prefs.getString("reviews", null)
        val pathsJson       = prefs.getString("paths", null)
        val currentUserId   = prefs.getString("currentUserId", "")

        if (usersJson != null) {
            val type = object : TypeToken<List<User>>() {}.type
            val users: List<User> = gson.fromJson(usersJson, type)
            AppRepository.loadUsers(users)
        }

        if (coursesJson != null) {
            val type = object : TypeToken<List<Course>>() {}.type
            val courses: List<Course> = gson.fromJson(coursesJson, type)
            AppRepository.loadCourses(courses)
        }

        if (enrollmentsJson != null) {
            val type = object : TypeToken<List<Enrollment>>() {}.type
            val enrollments: List<Enrollment> = gson.fromJson(enrollmentsJson, type)
            AppRepository.loadEnrollments(enrollments)
        }

        if (reviewsJson != null) {
            val type = object : TypeToken<List<Review>>() {}.type
            val reviews: List<Review> = gson.fromJson(reviewsJson, type)
            AppRepository.loadReviews(reviews)
        }

        if (pathsJson != null) {
            val type = object : TypeToken<List<LearningPath>>() {}.type
            val paths: List<LearningPath> = gson.fromJson(pathsJson, type)
            AppRepository.loadPaths(paths)
        }

        if (!currentUserId.isNullOrEmpty()) {
            AppRepository.loginById(currentUserId.toInt())
        }
    }

    fun clearAll(context: Context) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit().clear().apply()
    }
}