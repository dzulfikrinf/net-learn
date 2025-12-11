<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Week; // Pastikan ini ada
use App\Models\UserProgress;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    // --- FUNGSI INI YANG HILANG TADI ---
    public function index($slug = null)
    {
        $user = Auth::user();

        // 1. TENTUKAN COURSE
        // Jika tidak ada slug (akses /dashboard biasa), kita arahkan ke course default (misal: jarkom)
        // Atau idealnya diarahkan ke halaman pemilihan course.
        if (!$slug) {
             // Opsional: Redirect ke halaman pilih course jika Anda sudah membuatnya
             // return to_route('course.selection');

             // Untuk sekarang, default ke jarkom biar gak error
             $slug = 'jarkom';
        }

        // Cari data Course berdasarkan slug
        $course = Course::where('slug', $slug)->firstOrFail();

        // 2. AMBIL WEEKS KHUSUS COURSE TERSEBUT (FILTERING)
        $weeks = Week::where('course_id', $course->id) // <--- INI KUNCINYA
            ->with(['lessons' => function($query) {
                $query->orderBy('order', 'asc');
            }])
            ->orderBy('week_number', 'asc')
            ->get();

        // --- Logika Status Unlock & Gamifikasi (Tetap Sama) ---
        $completedLessonIds = UserProgress::where('user_id', $user->id)
            ->where('status', 'completed')
            ->pluck('lesson_id')
            ->toArray();

        $unlockedLessonIds = UserProgress::where('user_id', $user->id)
            ->whereIn('status', ['unlocked', 'started'])
            ->pluck('lesson_id')
            ->toArray();

        // Unlock level pertama DARI COURSE INI saja
        $firstLesson = \App\Models\Lesson::whereHas('week', function($q) use ($course) {
                $q->where('course_id', $course->id);
            })
            ->orderBy('week_id')->orderBy('order')->first();

        if ($firstLesson && !in_array($firstLesson->id, $unlockedLessonIds) && !in_array($firstLesson->id, $completedLessonIds)) {
             $unlockedLessonIds[] = $firstLesson->id;
        }

        // Inject status
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
            'course' => $course, // Kirim data course untuk Judul Halaman
            'weeks' => $weeks,
            'gamification' => [
                'xp' => $user->xp,
                'rank' => 'Novice Networker',
                'stars' => $user->stars,
                'streak' => 1
            ]
        ]);
    }
}
