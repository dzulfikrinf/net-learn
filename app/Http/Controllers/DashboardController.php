<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Week; // Pastikan ini ada
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    // --- FUNGSI INI YANG HILANG TADI ---
    public function index()
    {
        $user = Auth::user();

        // Ambil ID Level yang sudah diselesaikan user
        $completedLessonIds = UserProgress::where('user_id', $user->id)
            ->where('status', 'completed')
            ->pluck('lesson_id')
            ->toArray();

        // Ambil ID Level yang terbuka (unlocked)
        $unlockedLessonIds = UserProgress::where('user_id', $user->id)
            ->whereIn('status', ['unlocked', 'started'])
            ->pluck('lesson_id')
            ->toArray();

        // PENTING: Level pertama (Minggu 1 Level 1) harus selalu dianggap Unlocked secara default
        // Kita ambil ID level pertama dari database
        $firstLesson = \App\Models\Lesson::orderBy('week_id')->orderBy('order')->first();
        if ($firstLesson && !in_array($firstLesson->id, $unlockedLessonIds) && !in_array($firstLesson->id, $completedLessonIds)) {
             $unlockedLessonIds[] = $firstLesson->id;
        }

        $weeks = Week::with(['lessons' => function($query) {
            $query->orderBy('order', 'asc');
        }])
        ->orderBy('week_number', 'asc')
        ->get();

        // Kita inject status ke setiap lesson secara manual sebelum dikirim ke React
        // Ini cara cepat memanipulasi data tanpa merusak struktur database
        foreach ($weeks as $week) {
            foreach ($week->lessons as $lesson) {
                if (in_array($lesson->id, $completedLessonIds)) {
                    $lesson->status_user = 'completed';
                } elseif (in_array($lesson->id, $unlockedLessonIds)) {
                    $lesson->status_user = 'unlocked';
                } else {
                    $lesson->status_user = 'locked';
                }
            }
        }

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'weeks' => $weeks,
            'gamification' => [
                'xp' => $user->xp,
                'rank' => 'Novice Networker',
                'streak' => 1 // Nanti dinamis
            ]
        ]);
    }
}
