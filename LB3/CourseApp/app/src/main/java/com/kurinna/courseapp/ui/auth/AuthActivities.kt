package com.kurinna.courseapp.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.kurinna.courseapp.R
import com.kurinna.courseapp.data.repository.AppRepository
import com.kurinna.courseapp.data.repository.DataStorage
import com.kurinna.courseapp.ui.HomeActivity

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val etEmail    = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin   = findViewById<Button>(R.id.btnLogin)
        val tvRegister = findViewById<TextView>(R.id.tvRegister)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val pass  = etPassword.text.toString()
            if (email.isEmpty() || pass.isEmpty()) {
                Toast.makeText(this, "Заповніть всі поля", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            AppRepository.login(email, pass).fold(
                onSuccess = {
                    Toast.makeText(this, "Ласкаво просимо, ${it.name}!", Toast.LENGTH_SHORT).show()
                    DataStorage.saveAll(this)
                    startActivity(Intent(this, HomeActivity::class.java))
                    finish()
                },
                onFailure = {
                    Toast.makeText(this, it.message, Toast.LENGTH_SHORT).show()
                }
            )
        }

        tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etName     = findViewById<EditText>(R.id.etName)
        val etEmail    = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val etConfirm  = findViewById<EditText>(R.id.etConfirmPassword)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvLogin    = findViewById<TextView>(R.id.tvLogin)

        btnRegister.setOnClickListener {
            val name    = etName.text.toString().trim()
            val email   = etEmail.text.toString().trim()
            val pass    = etPassword.text.toString()
            val confirm = etConfirm.text.toString()
            when {
                name.isEmpty() || email.isEmpty() || pass.isEmpty() ->
                    Toast.makeText(this, "Заповніть всі поля", Toast.LENGTH_SHORT).show()
                pass != confirm ->
                    Toast.makeText(this, "Паролі не збігаються", Toast.LENGTH_SHORT).show()
                pass.length < 6 ->
                    Toast.makeText(this, "Пароль мінімум 6 символів", Toast.LENGTH_SHORT).show()
                else -> {
                    AppRepository.registerUser(email, name, pass).fold(
                        onSuccess = {
                            AppRepository.login(email, pass)
                            Toast.makeText(this, "Акаунт створено!", Toast.LENGTH_SHORT).show()
                            DataStorage.saveAll(this)
                            startActivity(Intent(this, HomeActivity::class.java))
                            finishAffinity()
                        },
                        onFailure = {
                            Toast.makeText(this, it.message, Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }

        tvLogin.setOnClickListener { finish() }
    }
}