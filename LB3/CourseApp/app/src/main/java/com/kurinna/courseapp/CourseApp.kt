package com.kurinna.courseapp

import android.app.Application
import com.kurinna.courseapp.data.repository.AppRepository
import com.kurinna.courseapp.data.repository.DataStorage

class CourseApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // Спочатку завантажуємо збережені дані
        DataStorage.loadAll(this)
        // Потім додаємо дефолтні дані тільки якщо їх немає
        AppRepository.initDefaultData()
    }
}