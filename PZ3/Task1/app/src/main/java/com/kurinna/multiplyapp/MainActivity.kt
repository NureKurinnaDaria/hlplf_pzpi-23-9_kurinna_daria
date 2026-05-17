package com.kurinna.multiplyapp

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Знаходимо елементи на екрані
        val etA = findViewById<EditText>(R.id.etA)
        val etB = findViewById<EditText>(R.id.etB)
        val btnMultiply = findViewById<Button>(R.id.btnMultiply)
        val tvResult = findViewById<TextView>(R.id.tvResult)

        // Обробник натискання кнопки
        btnMultiply.setOnClickListener {
            val inputA = etA.text.toString()
            val inputB = etB.text.toString()

            // Перевірка що поля не порожні
            if (inputA.isEmpty() || inputB.isEmpty()) {
                tvResult.text = "Будь ласка, введіть обидва числа"
                return@setOnClickListener
            }

            val a = inputA.toDoubleOrNull()
            val b = inputB.toDoubleOrNull()

            // Перевірка що введено коректні числа
            if (a == null || b == null) {
                tvResult.text = "Введіть коректні числа"
                return@setOnClickListener
            }

            val result = a * b
            tvResult.text = "Результат: $a × $b = $result"
        }
    }
}