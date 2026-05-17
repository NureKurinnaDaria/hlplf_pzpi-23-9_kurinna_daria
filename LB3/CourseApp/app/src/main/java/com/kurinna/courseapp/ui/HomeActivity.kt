package com.kurinna.courseapp.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.kurinna.courseapp.R
import com.kurinna.courseapp.data.repository.AppRepository
import com.kurinna.courseapp.ui.auth.LoginActivity
import com.kurinna.courseapp.ui.courses.*
import com.kurinna.courseapp.data.repository.DataStorage

class HomeActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (!AppRepository.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        if (AppRepository.isAdmin()) {
            setContentView(R.layout.activity_home_admin)
            setupAdminNav()
        } else {
            setContentView(R.layout.activity_home)
            setupStudentNav()
        }
    }

    override fun onStop() {
        super.onStop()
        DataStorage.saveAll(this)
    }

    private fun setupStudentNav() {
        loadFragment(HomeFragment())
        findViewById<Button>(R.id.btnNavHome).setOnClickListener { loadFragment(HomeFragment()) }
        findViewById<Button>(R.id.btnNavCatalog).setOnClickListener { loadFragment(CatalogFragment()) }
        findViewById<Button>(R.id.btnNavPaths).setOnClickListener { loadFragment(StudentPathsFragment()) }
        findViewById<Button>(R.id.btnNavMy).setOnClickListener { loadFragment(MyCourseFragment()) }
        findViewById<Button>(R.id.btnNavProfile).setOnClickListener { loadFragment(ProfileFragment()) }
    }

    private fun setupAdminNav() {
        loadFragment(AdminCoursesFragment())
        findViewById<Button>(R.id.btnNavCourses).setOnClickListener { loadFragment(AdminCoursesFragment()) }
        findViewById<Button>(R.id.btnNavPaths).setOnClickListener { loadFragment(AdminPathsFragment()) }
        findViewById<Button>(R.id.btnNavAnalytics).setOnClickListener { loadFragment(AdminAnalyticsFragment()) }
        findViewById<Button>(R.id.btnNavAdminProfile).setOnClickListener { loadFragment(ProfileFragment()) }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.contentFrame, fragment)
            .commit()
    }
}