<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Module;

class LearningController extends Controller
{
    public function show($slug)
    {
        // 1. Cari Level berdasarkan slug
        $lesson = Lesson::where('slug', $slug)
            ->with(['modules' => function($query) {
                $query->orderBy('order', 'asc'); // Ambil modul urut dari 1, 2, 3...
            }])
            ->firstOrFail(); // Kalau gak ketemu, error 404

        // 2. Cari Level Selanjutnya (untuk tombol "Next Level")
        $nextLesson = Lesson::where('order', '>', $lesson->order)->orderBy('order', 'asc')->first();

        // 3. Kirim ke React
        return Inertia::render('Learning/Show', [
            'lesson' => $lesson,
            'next_lesson_url' => $nextLesson ? route('learning.show', $nextLesson->slug) : route('dashboard'),
        ]);
    }
}
