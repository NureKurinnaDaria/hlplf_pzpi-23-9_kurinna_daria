package com.kurinna.guesswordgame

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    val words = listOf("котик", "собака", "будинок", "машина", "телефон",
        "книга", "сонце", "місяць", "зірка", "дерево")

    var currentWord = ""
    var guessedLetters = mutableListOf<Char>()
    var attemptsLeft = 6

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvWord = findViewById<TextView>(R.id.tvWord)
        val tvAttempts = findViewById<TextView>(R.id.tvAttempts)
        val etLetter = findViewById<EditText>(R.id.etLetter)
        val btnGuess = findViewById<Button>(R.id.btnGuess)
        val tvMessage = findViewById<TextView>(R.id.tvMessage)
        val btnNewGame = findViewById<Button>(R.id.btnNewGame)

        fun startNewGame() {
            currentWord = words.random()
            guessedLetters.clear()
            attemptsLeft = 6
            tvMessage.text = ""
            tvAttempts.text = "Спроби: $attemptsLeft"
            tvWord.text = currentWord.map { '_' }.joinToString(" ")
            btnGuess.isEnabled = true
        }

        fun updateWordDisplay(): String {
            return currentWord.map {
                if (it in guessedLetters) it else '_'
            }.joinToString(" ")
        }

        startNewGame()

        btnGuess.setOnClickListener {
            val input = etLetter.text.toString().lowercase()
            etLetter.text.clear()

            if (input.isEmpty()) {
                tvMessage.text = "Введіть літеру!"
                return@setOnClickListener
            }

            val letter = input[0]

            if (letter in guessedLetters) {
                tvMessage.text = "Ви вже вгадували цю літеру!"
                return@setOnClickListener
            }

            guessedLetters.add(letter)

            if (letter in currentWord) {
                tvMessage.text = "Правильно! ✓"
            } else {
                attemptsLeft--
                tvMessage.text = "Немає такої літери! ✗"
            }

            tvWord.text = updateWordDisplay()
            tvAttempts.text = "Спроби: $attemptsLeft"

            if (!tvWord.text.contains('_')) {
                tvMessage.text = "Ви виграли! 🎉"
                btnGuess.isEnabled = false
            } else if (attemptsLeft == 0) {
                tvMessage.text = "Ви програли! Слово: $currentWord"
                btnGuess.isEnabled = false
            }
        }

        btnNewGame.setOnClickListener {
            startNewGame()
        }
    }
}