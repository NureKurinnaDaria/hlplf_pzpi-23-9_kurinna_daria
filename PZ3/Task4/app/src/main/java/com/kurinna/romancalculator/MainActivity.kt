package com.kurinna.romancalculator

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    val romanValues = listOf(
        1000 to "M", 900 to "CM", 500 to "D", 400 to "CD",
        100 to "C", 90 to "XC", 50 to "L", 40 to "XL",
        10 to "X", 9 to "IX", 5 to "V", 4 to "IV", 1 to "I"
    )

    fun romanToInt(s: String): Int? {
        val valid = setOf('I', 'V', 'X', 'L', 'C', 'D', 'M')
        if (s.isEmpty() || s.any { it !in valid }) return null
        var result = 0
        var prev = 0
        for (ch in s.reversed()) {
            val curr = when (ch) {
                'I' -> 1; 'V' -> 5; 'X' -> 10; 'L' -> 50
                'C' -> 100; 'D' -> 500; 'M' -> 1000
                else -> return null
            }
            if (curr < prev) result -= curr else result += curr
            prev = curr
        }
        return result
    }

    fun intToRoman(num: Int): String {
        if (num <= 0) return "Помилка"
        var n = num
        val result = StringBuilder()
        for ((value, symbol) in romanValues) {
            while (n >= value) {
                result.append(symbol)
                n -= value
            }
        }
        return result.toString()
    }

    fun calculate(op: String) {
        val etA = findViewById<EditText>(R.id.etA)
        val etB = findViewById<EditText>(R.id.etB)
        val tvResult = findViewById<TextView>(R.id.tvResult)
        val tvResultArabic = findViewById<TextView>(R.id.tvResultArabic)

        val a = romanToInt(etA.text.toString().uppercase())
        val b = romanToInt(etB.text.toString().uppercase())

        if (a == null || b == null) {
            tvResult.text = "Помилка"
            tvResultArabic.text = "Введіть коректні римські числа"
            return
        }

        val result = when (op) {
            "+" -> a + b
            "-" -> a - b
            "*" -> a * b
            "/" -> {
                if (b == 0) {
                    tvResult.text = "Помилка"
                    tvResultArabic.text = "Ділення на нуль!"
                    return
                }
                a / b
            }
            else -> return
        }

        if (result <= 0) {
            tvResult.text = "Помилка"
            tvResultArabic.text = "Результат має бути більше нуля"
            return
        }

        if (result > 3999) {
            tvResult.text = "Помилка"
            tvResultArabic.text = "Результат більше 3999"
            return
        }

        tvResult.text = intToRoman(result)
        tvResultArabic.text = "= $result (арабськими)"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnAdd).setOnClickListener { calculate("+") }
        findViewById<Button>(R.id.btnSub).setOnClickListener { calculate("-") }
        findViewById<Button>(R.id.btnMul).setOnClickListener { calculate("*") }
        findViewById<Button>(R.id.btnDiv).setOnClickListener { calculate("/") }
    }
}