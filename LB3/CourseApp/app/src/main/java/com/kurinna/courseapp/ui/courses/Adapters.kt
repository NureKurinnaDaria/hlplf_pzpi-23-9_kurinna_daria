package com.kurinna.courseapp.ui.courses

import android.view.*
import android.widget.*
import androidx.recyclerview.widget.RecyclerView
import com.kurinna.courseapp.R
import com.kurinna.courseapp.data.model.*
import com.kurinna.courseapp.data.repository.AppRepository

// ── CourseCardAdapter ────────────────────────────────────────────────────────

class CourseCardAdapter(
    private val items: List<Course>,
    private val onClick: (Course) -> Unit
) : RecyclerView.Adapter<CourseCardAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle      : TextView = view.findViewById(R.id.tvCourseTitle)
        val tvCategory   : TextView = view.findViewById(R.id.tvCourseCategory)
        val tvInstructor : TextView = view.findViewById(R.id.tvCourseInstructor)
        val tvRating     : TextView = view.findViewById(R.id.tvCourseRating)
        val tvDuration   : TextView = view.findViewById(R.id.tvCourseDuration)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_course_card, parent, false))

    override fun onBindViewHolder(h: VH, position: Int) {
        val c = items[position]
        h.tvTitle.text      = c.title
        h.tvCategory.text   = c.category
        h.tvInstructor.text = c.instructor
        h.tvDuration.text   = "${c.durationHours} год."
        h.tvRating.text     = "★ %.1f".format(AppRepository.getAverageRating(c.id))

        val user = AppRepository.getCurrentUser()
        if (user != null && AppRepository.isEnrolled(user.id, c.id)) {
            val status = AppRepository.getEnrollmentStatus(user.id, c.id)
            h.tvCategory.text = when (status) {
                EnrollmentStatus.ENROLLED    -> "✓ Записаний • ${c.category}"
                EnrollmentStatus.IN_PROGRESS -> "⟳ В процесі • ${c.category}"
                EnrollmentStatus.COMPLETED   -> "🏆 Завершено • ${c.category}"
                else -> c.category
            }
            h.tvCategory.setTextColor(when (status) {
                EnrollmentStatus.ENROLLED    -> android.graphics.Color.parseColor("#2196F3")
                EnrollmentStatus.IN_PROGRESS -> android.graphics.Color.parseColor("#FF9800")
                EnrollmentStatus.COMPLETED   -> android.graphics.Color.parseColor("#4CAF50")
                else -> android.graphics.Color.parseColor("#666666")
            })
        } else {
            h.tvCategory.text = c.category
            h.tvCategory.setTextColor(android.graphics.Color.parseColor("#666666"))
        }

        h.itemView.setOnClickListener { onClick(c) }
    }

    override fun getItemCount() = items.size
}

// ── ReviewAdapter ────────────────────────────────────────────────────────────

class ReviewAdapter(
    private val reviews: List<Review>
) : RecyclerView.Adapter<ReviewAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvAuthor  : TextView = view.findViewById(R.id.tvReviewAuthor)
        val tvRating  : TextView = view.findViewById(R.id.tvReviewRating)
        val tvComment : TextView = view.findViewById(R.id.tvReviewComment)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_review, parent, false))

    override fun onBindViewHolder(h: VH, position: Int) {
        val r = reviews[position]
        h.tvAuthor.text  = r.userName
        h.tvRating.text  = "${"★".repeat(r.rating.toInt())} (${r.rating})"
        h.tvComment.text = r.comment
    }

    override fun getItemCount() = reviews.size
}

// ── AdminCourseAdapter ───────────────────────────────────────────────────────

class AdminCourseAdapter(
    private val courses: List<Course>,
    private val onDelete: (Int) -> Unit
) : RecyclerView.Adapter<AdminCourseAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle      : TextView = view.findViewById(R.id.tvAdminCourseTitle)
        val tvInfo       : TextView = view.findViewById(R.id.tvAdminCourseInfo)
        val tvEnrollments: TextView = view.findViewById(R.id.tvAdminCourseEnrollments)
        val btnDelete    : Button   = view.findViewById(R.id.btnDeleteCourse)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_admin_course, parent, false))

    override fun onBindViewHolder(h: VH, position: Int) {
        val c = courses[position]
        h.tvTitle.text       = c.title
        h.tvInfo.text        = "${c.category} • ${c.instructor} • ${c.durationHours} год."
        h.tvEnrollments.text = "Записано: ${AppRepository.getEnrollmentsForCourse(c.id).size}  ★ %.1f".format(AppRepository.getAverageRating(c.id))
        h.btnDelete.setOnClickListener { onDelete(c.id) }
    }

    override fun getItemCount() = courses.size
}

// ── AdminPathAdapter ─────────────────────────────────────────────────────────

class AdminPathAdapter(
    private val paths: List<LearningPath>,
    private val onClick: (Int) -> Unit,
    private val onDelete: (Int) -> Unit
) : RecyclerView.Adapter<AdminPathAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle  : TextView = view.findViewById(R.id.tvAdminPathTitle)
        val tvInfo   : TextView = view.findViewById(R.id.tvAdminPathInfo)
        val btnDelete: Button   = view.findViewById(R.id.btnDeletePath)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_admin_path, parent, false))

    override fun onBindViewHolder(h: VH, position: Int) {
        val p = paths[position]
        h.tvTitle.text = p.title
        h.tvInfo.text  = "${p.courseIds.size} курсів • ${p.description}"
        h.itemView.setOnClickListener { onClick(p.id) }
        h.btnDelete.setOnClickListener { onDelete(p.id) }
    }

    override fun getItemCount() = paths.size
}

// ── AdminPathCourseAdapter ───────────────────────────────────────────────────

class AdminPathCourseAdapter(
    private val courses: List<Course>,
    private val onRemove: (Int) -> Unit
) : RecyclerView.Adapter<AdminPathCourseAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle : TextView = view.findViewById(R.id.tvPathCourseTitle)
        val tvInfo  : TextView = view.findViewById(R.id.tvPathCourseInfo)
        val btnRemove: Button  = view.findViewById(R.id.btnRemoveCourse)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_path_course, parent, false))

    override fun onBindViewHolder(h: VH, position: Int) {
        val c = courses[position]
        h.tvTitle.text = c.title
        h.tvInfo.text  = "${c.category} • ${c.durationHours} год."
        h.btnRemove.setOnClickListener { onRemove(c.id) }
    }

    override fun getItemCount() = courses.size
}

// ── AnalyticsCourseAdapter ───────────────────────────────────────────────────

class AnalyticsCourseAdapter(
    private val items: List<CourseAnalytics>
) : RecyclerView.Adapter<AnalyticsCourseAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle      : TextView = view.findViewById(R.id.tvAnalyticsCourseTitle)
        val tvRating     : TextView = view.findViewById(R.id.tvAnalyticsRating)
        val tvEnrollments: TextView = view.findViewById(R.id.tvAnalyticsEnrollments)
        val tvReviews    : TextView = view.findViewById(R.id.tvAnalyticsReviews)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_analytics_course, parent, false))

    override fun onBindViewHolder(h: VH, pos: Int) {
        val a = items[pos]
        h.tvTitle.text       = a.courseTitle
        h.tvRating.text      = "★ %.1f".format(a.averageRating)
        h.tvEnrollments.text = "Записано: ${a.totalEnrollments}"
        h.tvReviews.text     = "Відгуків: ${a.totalReviews}"
    }

    override fun getItemCount() = items.size
}

// ── StudentPathAdapter ───────────────────────────────────────────────────────

class StudentPathAdapter(
    private val paths: List<LearningPath>,
    private val userId: Int,
    private val onClick: (Int) -> Unit
) : RecyclerView.Adapter<StudentPathAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle   : TextView = view.findViewById(R.id.tvStudentPathTitle)
        val tvInfo    : TextView = view.findViewById(R.id.tvStudentPathInfo)
        val tvEnrolled: TextView = view.findViewById(R.id.tvStudentPathEnrolled)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_student_path, parent, false))

    override fun onBindViewHolder(h: VH, position: Int) {
        val path = paths[position]
        h.tvTitle.text = path.title
        h.tvInfo.text  = "${path.courseIds.size} курсів • ${path.description}"

        val enrolledCount = path.courseIds.count { courseId ->
            AppRepository.isEnrolled(userId, courseId)
        }
        h.tvEnrolled.text = "Записаний на: $enrolledCount/${path.courseIds.size} курсів"
        h.tvEnrolled.setTextColor(
            if (enrolledCount > 0) android.graphics.Color.parseColor("#4CAF50")
            else android.graphics.Color.parseColor("#999999")
        )
        h.itemView.setOnClickListener { onClick(path.id) }
    }

    override fun getItemCount() = paths.size
}