<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ChatbotController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/belajar/{slug}', [LearningController::class, 'show'])
    ->name('learning.show');
    Route::post('/belajar/{id}/complete', [ProgressController::class, 'complete'])
    ->name('learning.complete');
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])
    ->name('leaderboard');
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('chatbot.ask');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/teacher-dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/teacher/reset-password/{id}', [AdminController::class, 'resetPassword'])->name('admin.reset_password');
    Route::get('/teacher/student/{id}', [AdminController::class, 'show'])->name('admin.student_detail');
});

require __DIR__.'/auth.php';
