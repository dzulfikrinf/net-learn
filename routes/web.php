<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CourseUserController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\Admin\ModuleController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {

    // 1. Dashboard Utama (Pilih Mata Pelajaran)
    Route::get('/dashboard', [CourseUserController::class, 'index'])->name('dashboard');

    // 2. Peta Belajar Spesifik (Jarkom / Coding)
    // Kita ubah method index di DashboardController agar menerima slug
    Route::get('/course/{slug}', [DashboardController::class, 'index'])->name('course.map');

    Route::get('/belajar/{slug}', [LearningController::class, 'show'])
    ->name('learning.show');
    Route::post('/belajar/{id}/complete', [ProgressController::class, 'complete'])
    ->name('learning.complete');

    // Route untuk mulai timer (Start)
    Route::post('/belajar/{id}/start', [ProgressController::class, 'start'])->name('learning.start');

    // Route untuk catat kesalahan (Fail)
    Route::post('/belajar/{id}/fail', [ProgressController::class, 'recordFailure'])->name('learning.fail');

    // Route complete (yang sudah ada)
    Route::post('/belajar/{id}/complete', [ProgressController::class, 'complete'])->name('learning.complete');

    Route::get('/leaderboard', [LeaderboardController::class, 'index'])
    ->name('leaderboard');
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('chatbot.ask');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    // Dashboard Admin
    Route::get('/teacher-dashboard', [AdminController::class, 'index'])->name('admin.dashboard');

    // Detail Siswa
    Route::get('/teacher/student/{id}', [AdminController::class, 'show'])->name('admin.student_detail');

    // Generate AI Report (Manual/Awal)
    Route::post('/teacher/student/{id}/analyze', [AdminController::class, 'generateReport'])->name('admin.student_analyze');

    Route::post('/teacher/student/{id}/refresh-ai', [AdminController::class, 'forceRegenerateReport'])->name('admin.student_refresh_ai');

    // MANAJEMEN KONTEN UTAMA
    Route::get('/admin/content', [App\Http\Controllers\Admin\CourseController::class, 'index'])->name('admin.content.index');

    // CREATE WEEK
    Route::post('/admin/course/{id}/week', [App\Http\Controllers\Admin\CourseController::class, 'storeWeek'])->name('admin.week.store');

    // CREATE LESSON
    Route::post('/admin/week/{id}/lesson', [App\Http\Controllers\Admin\CourseController::class, 'storeLesson'])->name('admin.lesson.store');

    // CREATE COURSE
    Route::post('/admin/course', [App\Http\Controllers\Admin\CourseController::class, 'store'])->name('admin.course.store');

    // PAGE: Lihat daftar modul di lesson tertentu
    Route::get('/admin/lesson/{id}/modules', [App\Http\Controllers\Admin\ModuleController::class, 'index'])->name('admin.lesson.modules');

    // ACTION: Simpan urutan drag & drop
    Route::post('/admin/lesson/{id}/reorder', [App\Http\Controllers\Admin\ModuleController::class, 'reorder'])->name('admin.modules.reorder');

    // 1. Route untuk membuka form tambah materi
    Route::get('/admin/lesson/{id}/create-module', [ModuleController::class, 'create'])->name('admin.module.create');

    // 2. Route untuk tombol "Simpan"
    Route::post('/admin/lesson/{id}/store-module', [ModuleController::class, 'store'])->name('admin.module.store');

    // Reset Password
    Route::post('/teacher/reset-password/{id}', [AdminController::class, 'resetPassword'])->name('admin.reset_password');
});

require __DIR__.'/auth.php';
