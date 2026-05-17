package com.kurinna.sentencecounter

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    val selectedFiles = mutableListOf<Pair<String, android.net.Uri>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnPickFiles = findViewById<Button>(R.id.btnPickFiles)
        val btnCount = findViewById<Button>(R.id.btnCount)
        val tvFiles = findViewById<TextView>(R.id.tvFiles)
        val tvResult = findViewById<TextView>(R.id.tvResult)

        btnPickFiles.setOnClickListener {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "text/plain"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            startActivityForResult(intent, 1)
        }

        btnCount.setOnClickListener {
            if (selectedFiles.isEmpty()) {
                tvResult.text = "Спочатку виберіть файли!"
                return@setOnClickListener
            }

            val result = StringBuilder()
            for ((name, uri) in selectedFiles) {
                val text = contentResolver.openInputStream(uri)
                    ?.bufferedReader()?.readText() ?: ""
                val count = text.split(Regex("[.!?]+"))
                    .filter { it.isNotBlank() }.size
                result.appendLine("$name — $count речень")
            }
            tvResult.text = result.toString()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 1 && resultCode == Activity.RESULT_OK) {
            selectedFiles.clear()
            val tvFiles = findViewById<TextView>(R.id.tvFiles)

            data?.clipData?.let { clip ->
                for (i in 0 until clip.itemCount) {
                    val uri = clip.getItemAt(i).uri
                    val name = uri.lastPathSegment ?: "файл $i"
                    selectedFiles.add(Pair(name, uri))
                }
            } ?: data?.data?.let { uri ->
                val name = uri.lastPathSegment ?: "файл"
                selectedFiles.add(Pair(name, uri))
            }

            tvFiles.text = selectedFiles.joinToString("\n") { it.first }
        }
    }
}