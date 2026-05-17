package com.kurinna.courseapp.ui.courses

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.kurinna.courseapp.R
import com.kurinna.courseapp.data.model.*
import com.kurinna.courseapp.data.repository.AppRepository
import com.kurinna.courseapp.data.repository.DataStorage

// ── HomeFragment (Студент) ───────────────────────────────────────────────────

class HomeFragment : Fragment() {
    private lateinit var adapter: CourseCardAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)
        val user = AppRepository.getCurrentUser() ?: return view
        view.findViewById<TextView>(R.id.tvWelcome).text = "Привіт, ${user.name}!"
        val rvPopular = view.findViewById<RecyclerView>(R.id.rvPopular)
        rvPopular.layoutManager = LinearLayoutManager(context)
        adapter = CourseCardAdapter(AppRepository.getAllCourses()) {
            openCourse(it.id)
        }
        rvPopular.adapter = adapter
        return view
    }

    override fun onResume() {
        super.onResume()
        adapter = CourseCardAdapter(AppRepository.getAllCourses()) {
            openCourse(it.id)
        }
        view?.findViewById<RecyclerView>(R.id.rvPopular)?.adapter = adapter
    }

    private fun openCourse(id: Int) {
        startActivity(Intent(requireContext(), CourseDetailActivity::class.java).putExtra("course_id", id))
    }
}

// ── CatalogFragment ──────────────────────────────────────────────────────────

class CatalogFragment : Fragment() {
    private var currentList: List<Course> = emptyList()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_catalog, container, false)
        setupViews(view)
        return view
    }

    override fun onResume() {
        super.onResume()
        view?.let { setupViews(it) }
    }

    private fun setupViews(view: View) {
        val etSearch  = view.findViewById<EditText>(R.id.etSearch)
        val spinner   = view.findViewById<Spinner>(R.id.spinnerCategory)
        val rvCourses = view.findViewById<RecyclerView>(R.id.rvCourses)
        rvCourses.layoutManager = LinearLayoutManager(context)

        val categories = listOf("Всі") + AppRepository.getCategories()
        spinner.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, categories)
            .also { it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }

        fun refresh() {
            val query = etSearch.text.toString().trim()
            val cat   = spinner.selectedItem as String
            var list  = if (query.isEmpty()) AppRepository.getAllCourses() else AppRepository.searchCourses(query)
            if (cat != "Всі") list = list.filter { it.category == cat }
            rvCourses.adapter = CourseCardAdapter(list) {
                startActivity(Intent(requireContext(), CourseDetailActivity::class.java).putExtra("course_id", it.id))
            }
        }
        refresh()

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = refresh()
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, b: Int, c: Int) {}
        })
        spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p: AdapterView<*>?, v: View?, pos: Int, id: Long) = refresh()
            override fun onNothingSelected(p: AdapterView<*>?) {}
        }
    }
}

// ── MyCourseFragment ─────────────────────────────────────────────────────────

class MyCourseFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_my_courses, container, false)
        val user = AppRepository.getCurrentUser() ?: return view
        val rvCourses = view.findViewById<RecyclerView>(R.id.rvMyCourses)
        rvCourses.layoutManager = LinearLayoutManager(context)
        val enrolled = AppRepository.getEnrolledCourses(user.id)
        if (enrolled.isEmpty()) {
            view.findViewById<TextView>(R.id.tvEmpty).visibility = View.VISIBLE
        } else {
            rvCourses.adapter = CourseCardAdapter(enrolled) {
                startActivity(Intent(requireContext(), CourseDetailActivity::class.java).putExtra("course_id", it.id))
            }
        }
        return view
    }
}

// ── StudentPathsFragment ─────────────────────────────────────────────────────

class StudentPathsFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_student_paths, container, false)
        val user = AppRepository.getCurrentUser() ?: return view
        val rvPaths = view.findViewById<RecyclerView>(R.id.rvStudentPaths)
        rvPaths.layoutManager = LinearLayoutManager(context)

        fun refresh() {
            val paths = AppRepository.getAllLearningPaths()
            if (paths.isEmpty()) {
                view.findViewById<TextView>(R.id.tvNoPaths).visibility = View.VISIBLE
                rvPaths.visibility = View.GONE
            } else {
                view.findViewById<TextView>(R.id.tvNoPaths).visibility = View.GONE
                rvPaths.visibility = View.VISIBLE
                rvPaths.adapter = StudentPathAdapter(paths, user.id) { pathId ->
                    startActivity(
                        Intent(requireContext(), StudentPathDetailActivity::class.java)
                            .putExtra("path_id", pathId)
                    )
                }
            }
        }
        refresh()
        return view
    }
}

// ── StudentPathDetailActivity ────────────────────────────────────────────────

class StudentPathDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_student_path_detail)

        val pathId = intent.getIntExtra("path_id", -1)
        val user   = AppRepository.getCurrentUser() ?: run { finish(); return }
        val path   = AppRepository.getLearningPathById(pathId) ?: run { finish(); return }

        supportActionBar?.title = path.title
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val tvDesc    = findViewById<TextView>(R.id.tvStudentPathDesc)
        val rvCourses = findViewById<RecyclerView>(R.id.rvStudentPathCourses)
        tvDesc.text   = path.description
        rvCourses.layoutManager = LinearLayoutManager(this)

        fun refresh() {
            val courses = path.courseIds.mapNotNull { AppRepository.getCourseById(it) }
            rvCourses.adapter = CourseCardAdapter(courses) { course ->
                startActivity(
                    Intent(this, CourseDetailActivity::class.java)
                        .putExtra("course_id", course.id)
                )
            }
        }
        refresh()
    }

    override fun onResume() {
        super.onResume()
        val pathId = intent.getIntExtra("path_id", -1)
        val path   = AppRepository.getLearningPathById(pathId) ?: return
        val user   = AppRepository.getCurrentUser() ?: return
        val rvCourses = findViewById<RecyclerView>(R.id.rvStudentPathCourses)
        val courses = path.courseIds.mapNotNull { AppRepository.getCourseById(it) }
        rvCourses.adapter = CourseCardAdapter(courses) { course ->
            startActivity(
                Intent(this, CourseDetailActivity::class.java)
                    .putExtra("course_id", course.id)
            )
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) { finish(); return true }
        return super.onOptionsItemSelected(item)
    }
}

// ── ProfileFragment ──────────────────────────────────────────────────────────

class ProfileFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_profile, container, false)
        val user = AppRepository.getCurrentUser() ?: return view

        view.findViewById<TextView>(R.id.tvEmail).text = user.email
        view.findViewById<TextView>(R.id.tvStats).text =
            "Записано курсів: ${AppRepository.getEnrolledCourses(user.id).size}"

        val etName = view.findViewById<EditText>(R.id.etName)
        etName.setText(user.name)

        view.findViewById<Button>(R.id.btnSaveName).setOnClickListener {
            val name = etName.text.toString().trim()
            if (name.isEmpty()) {
                Toast.makeText(context, "Ім'я не може бути порожнім", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            AppRepository.updateUserName(user.id, name)
            Toast.makeText(context, "Ім'я оновлено", Toast.LENGTH_SHORT).show()
        }

        view.findViewById<Button>(R.id.btnChangePassword).setOnClickListener {
            val old = view.findViewById<EditText>(R.id.etOldPassword).text.toString()
            val new = view.findViewById<EditText>(R.id.etNewPassword).text.toString()
            AppRepository.changePassword(user.id, old, new).fold(
                onSuccess = { Toast.makeText(context, "Пароль змінено", Toast.LENGTH_SHORT).show() },
                onFailure = { Toast.makeText(context, it.message, Toast.LENGTH_SHORT).show() }
            )
        }

        view.findViewById<Button>(R.id.btnLogout).setOnClickListener {
            AppRepository.logout()
            startActivity(Intent(requireContext(), com.kurinna.courseapp.ui.auth.LoginActivity::class.java))
            requireActivity().finishAffinity()
        }
        return view
    }
}

// ── CourseDetailActivity ─────────────────────────────────────────────────────

class CourseDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_course_detail)

        val courseId = intent.getIntExtra("course_id", -1)
        val course   = AppRepository.getCourseById(courseId) ?: run { finish(); return }
        val user     = AppRepository.getCurrentUser()        ?: run { finish(); return }

        supportActionBar?.title = course.title
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val tvTitle       = findViewById<TextView>(R.id.tvTitle)
        val tvDescription = findViewById<TextView>(R.id.tvDescription)
        val tvInstructor  = findViewById<TextView>(R.id.tvInstructor)
        val tvDuration    = findViewById<TextView>(R.id.tvDuration)
        val tvRating      = findViewById<TextView>(R.id.tvRating)
        val tvStatus      = findViewById<TextView>(R.id.tvStatus)
        val btnEnroll     = findViewById<Button>(R.id.btnEnroll)
        val btnReview     = findViewById<Button>(R.id.btnAddReview)
        val rvReviews     = findViewById<RecyclerView>(R.id.rvReviews)
        val btnInProgress = findViewById<Button>(R.id.btnInProgress)
        val btnCompleted  = findViewById<Button>(R.id.btnCompleted)

        tvTitle.text       = course.title
        tvDescription.text = course.description
        tvInstructor.text  = "Викладач: ${course.instructor}"
        tvDuration.text    = "Тривалість: ${course.durationHours} год. • ${course.category}"
        rvReviews.layoutManager = LinearLayoutManager(this)

        fun refresh() {
            tvRating.text = "Рейтинг: %.1f ★  (${AppRepository.getReviewsForCourse(courseId).size} відгуків)".format(
                AppRepository.getAverageRating(courseId))
            rvReviews.adapter = ReviewAdapter(AppRepository.getReviewsForCourse(courseId))

            if (AppRepository.isEnrolled(user.id, courseId)) {
                btnEnroll.visibility = View.GONE
                btnReview.visibility = if (AppRepository.hasUserReviewed(user.id, courseId))
                    View.GONE else View.VISIBLE

                // Показуємо статус та кнопки зміни статусу
                val currentStatus = AppRepository.getEnrollmentStatus(user.id, courseId)
                tvStatus.text = "Статус: " + when (currentStatus) {
                    EnrollmentStatus.ENROLLED     -> "✓ Записаний"
                    EnrollmentStatus.IN_PROGRESS  -> "⟳ В процесі"
                    EnrollmentStatus.COMPLETED    -> "🏆 Завершено"
                    else -> ""
                }
                tvStatus.setTextColor(when (currentStatus) {
                    EnrollmentStatus.ENROLLED     -> android.graphics.Color.parseColor("#2196F3")
                    EnrollmentStatus.IN_PROGRESS  -> android.graphics.Color.parseColor("#FF9800")
                    EnrollmentStatus.COMPLETED    -> android.graphics.Color.parseColor("#4CAF50")
                    else -> android.graphics.Color.parseColor("#666666")
                })

                btnInProgress.visibility = View.VISIBLE
                btnCompleted.visibility  = View.VISIBLE
            } else {
                btnEnroll.visibility     = View.VISIBLE
                btnReview.visibility     = View.GONE
                btnInProgress.visibility = View.GONE
                btnCompleted.visibility  = View.GONE
                tvStatus.text = "Ви ще не записані"
                tvStatus.setTextColor(android.graphics.Color.parseColor("#666666"))
            }
        }
        refresh()

        btnEnroll.setOnClickListener {
            AppRepository.enrollCourse(user.id, courseId).fold(
                onSuccess = {
                    DataStorage.saveAll(this)
                    Toast.makeText(this, "Ви успішно записались!", Toast.LENGTH_SHORT).show()
                    refresh()
                },
                onFailure = { Toast.makeText(this, it.message, Toast.LENGTH_SHORT).show() }
            )
        }

        btnReview.setOnClickListener {
            showReviewDialog(user.id, courseId) { refresh() }
        }

        btnInProgress.setOnClickListener {
            AppRepository.updateEnrollmentStatus(user.id, courseId, EnrollmentStatus.IN_PROGRESS)
            refresh()
            Toast.makeText(this, "Статус: В процесі", Toast.LENGTH_SHORT).show()
        }

        btnCompleted.setOnClickListener {
            AppRepository.updateEnrollmentStatus(user.id, courseId, EnrollmentStatus.COMPLETED)
            refresh()
            Toast.makeText(this, "Статус: Завершено 🏆", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showReviewDialog(userId: Int, courseId: Int, onDone: () -> Unit) {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 0)
        }
        val ratingBar = RatingBar(this).apply { numStars = 5; stepSize = 0.5f; rating = 5f }
        val etComment = EditText(this).apply { hint = "Ваш відгук..." }
        layout.addView(ratingBar)
        layout.addView(etComment)

        AlertDialog.Builder(this)
            .setTitle("Залишити відгук")
            .setView(layout)
            .setPositiveButton("Надіслати") { _, _ ->
                val comment = etComment.text.toString().trim()
                if (comment.isEmpty()) {
                    Toast.makeText(this, "Напишіть відгук", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                AppRepository.addReview(userId, courseId, ratingBar.rating, comment).fold(
                    onSuccess = {
                        DataStorage.saveAll(this)
                        Toast.makeText(this, "Відгук додано!", Toast.LENGTH_SHORT).show()
                        onDone()
                    },
                    onFailure = { Toast.makeText(this, it.message, Toast.LENGTH_SHORT).show() }
                )
            }
            .setNegativeButton("Скасувати", null)
            .show()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) { finish(); return true }
        return super.onOptionsItemSelected(item)
    }
}

// ── AdminCoursesFragment ─────────────────────────────────────────────────────

class AdminCoursesFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_admin_courses, container, false)
        val rvCourses = view.findViewById<RecyclerView>(R.id.rvAdminCourses)
        val btnAdd    = view.findViewById<Button>(R.id.btnAddCourse)
        rvCourses.layoutManager = LinearLayoutManager(context)

        fun refresh() {
            rvCourses.adapter = AdminCourseAdapter(AppRepository.getAllCourses(),
                onDelete = { courseId ->
                    AlertDialog.Builder(requireContext())
                        .setTitle("Видалити курс?")
                        .setMessage("Це також видалить всі записи на цей курс")
                        .setPositiveButton("Видалити") { _, _ ->
                            AppRepository.deleteCourse(courseId)
                            refresh()
                        }
                        .setNegativeButton("Скасувати", null).show()
                }
            )
        }
        refresh()

        btnAdd.setOnClickListener { showAddCourseDialog { refresh() } }
        return view
    }

    private fun showAddCourseDialog(onAdded: () -> Unit) {
        val layout = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL; setPadding(48, 24, 48, 0)
        }
        val etTitle      = EditText(requireContext()).apply { hint = "Назва курсу" }
        val etDesc       = EditText(requireContext()).apply { hint = "Опис" }
        val etInstructor = EditText(requireContext()).apply { hint = "Викладач" }
        val etCategory   = EditText(requireContext()).apply { hint = "Категорія" }
        val etDuration   = EditText(requireContext()).apply { hint = "Тривалість (год.)"; inputType = android.text.InputType.TYPE_CLASS_NUMBER }
        layout.addView(etTitle); layout.addView(etDesc); layout.addView(etInstructor)
        layout.addView(etCategory); layout.addView(etDuration)

        AlertDialog.Builder(requireContext())
            .setTitle("Новий курс")
            .setView(layout)
            .setPositiveButton("Додати") { _, _ ->
                val title    = etTitle.text.toString().trim()
                val duration = etDuration.text.toString().toIntOrNull() ?: 0
                if (title.isEmpty()) {
                    Toast.makeText(context, "Введіть назву", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                AppRepository.addCourse(title, etDesc.text.toString(),
                    etInstructor.text.toString(), etCategory.text.toString(), duration)
                Toast.makeText(context, "Курс додано!", Toast.LENGTH_SHORT).show()
                onAdded()
            }
            .setNegativeButton("Скасувати", null).show()
    }
}

// ── AdminPathsFragment ───────────────────────────────────────────────────────

class AdminPathsFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view    = inflater.inflate(R.layout.fragment_admin_paths, container, false)
        val rvPaths = view.findViewById<RecyclerView>(R.id.rvAdminPaths)
        val btnAdd  = view.findViewById<Button>(R.id.btnAddPath)
        rvPaths.layoutManager = LinearLayoutManager(context)

        fun refresh() {
            rvPaths.adapter = AdminPathAdapter(AppRepository.getAllLearningPaths(),
                onClick = {
                    startActivity(Intent(requireContext(), AdminPathDetailActivity::class.java).putExtra("path_id", it))
                },
                onDelete = { pathId ->
                    AlertDialog.Builder(requireContext())
                        .setTitle("Видалити програму?")
                        .setPositiveButton("Видалити") { _, _ ->
                            AppRepository.deleteLearningPath(pathId); refresh()
                        }
                        .setNegativeButton("Скасувати", null).show()
                }
            )
        }
        refresh()

        btnAdd.setOnClickListener {
            val layout = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.VERTICAL; setPadding(48, 24, 48, 0)
            }
            val etTitle = EditText(requireContext()).apply { hint = "Назва програми" }
            val etDesc  = EditText(requireContext()).apply { hint = "Опис" }
            layout.addView(etTitle); layout.addView(etDesc)

            AlertDialog.Builder(requireContext())
                .setTitle("Нова програма")
                .setView(layout)
                .setPositiveButton("Створити") { _, _ ->
                    val title = etTitle.text.toString().trim()
                    if (title.isEmpty()) {
                        Toast.makeText(context, "Введіть назву", Toast.LENGTH_SHORT).show()
                        return@setPositiveButton
                    }
                    AppRepository.createLearningPath(title, etDesc.text.toString(), emptyList())
                    Toast.makeText(context, "Програму створено!", Toast.LENGTH_SHORT).show()
                    refresh()
                }
                .setNegativeButton("Скасувати", null).show()
        }
        return view
    }
}

// ── AdminPathDetailActivity ──────────────────────────────────────────────────

class AdminPathDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_path_detail)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val pathId = intent.getIntExtra("path_id", -1)
        val path   = AppRepository.getLearningPathById(pathId) ?: run { finish(); return }
        supportActionBar?.title = path.title

        val tvDesc    = findViewById<TextView>(R.id.tvPathDesc)
        val rvCourses = findViewById<RecyclerView>(R.id.rvPathCourses)
        val btnAdd    = findViewById<Button>(R.id.btnAddCourseToPath)
        tvDesc.text   = path.description
        rvCourses.layoutManager = LinearLayoutManager(this)

        fun refresh() {
            val courses = path.courseIds.mapNotNull { AppRepository.getCourseById(it) }
            rvCourses.adapter = AdminPathCourseAdapter(courses) { courseId ->
                AppRepository.removeCourseFromPath(pathId, courseId)
                refresh()
            }
        }
        refresh()

        btnAdd.setOnClickListener {
            val available = AppRepository.getAllCourses().filter { it.id !in path.courseIds }
            if (available.isEmpty()) {
                Toast.makeText(this, "Всі курси вже додані", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val names = available.map { it.title }.toTypedArray()
            AlertDialog.Builder(this)
                .setTitle("Додати курс")
                .setItems(names) { _, idx ->
                    AppRepository.addCourseToPath(pathId, available[idx].id)
                    refresh()
                }.show()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) { finish(); return true }
        return super.onOptionsItemSelected(item)
    }
}

// ── AdminAnalyticsFragment ───────────────────────────────────────────────────

class AdminAnalyticsFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_admin_analytics, container, false)

        view.findViewById<TextView>(R.id.tvTotalUsers).text =
            "👤 Користувачів: ${AppRepository.getTotalUsers()}"
        view.findViewById<TextView>(R.id.tvTotalCourses).text =
            "📚 Курсів: ${AppRepository.getTotalCourses()}"
        view.findViewById<TextView>(R.id.tvTotalEnrollments).text =
            "📋 Всього записів: ${AppRepository.getTotalEnrollments()}"

        val rvAnalytics = view.findViewById<RecyclerView>(R.id.rvAnalytics)
        rvAnalytics.layoutManager = LinearLayoutManager(context)
        rvAnalytics.adapter = AnalyticsCourseAdapter(AppRepository.getSystemAnalytics())
        return view
    }
}