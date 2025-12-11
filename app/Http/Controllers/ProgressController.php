<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    // 1. DIPANGGIL SAAT HALAMAN DIBUKA
    public function start(Request $request, $lessonId)
    {
        $user = Auth::user();

        $progress = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();

        if (!$progress) {
            // Data Baru: Set attempts = 1 (Percobaan pertama)
            UserProgress::create([
                'user_id' => $user->id,
                'lesson_id' => $lessonId,
                'status' => 'started',
                'attempts' => 1,
                'score' => 0,
                'created_at' => now(), // Waktu mulai
            ]);
        } else {
            // Data Ada: Cek apakah baru dibuka (unlock otomatis)?
            if ($progress->status === 'unlocked' || $progress->status === 'locked') {
                $progress->status = 'started';
                $progress->created_at = now(); // Reset waktu mulai
                $progress->attempts = 1;       // Reset attempts jadi 1
                $progress->save();
            }
        }

        return response()->json(['message' => 'Timer started']);
    }

    // 2. DIPANGGIL SAAT SALAH JAWAB KUIS
    public function recordFailure(Request $request, $lessonId)
    {
        $user = Auth::user();

        $progress = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();

        if ($progress) {
            $progress->attempts += 1; // Tambah manual
            $progress->save();
        }

        return response()->json(['message' => 'Kesalahan dicatat']);
    }

    // 3. DIPANGGIL SAAT SELESAI
    public function complete(Request $request, $lessonId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $lesson = Lesson::findOrFail($lessonId);

        $progress = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();

        if (!$progress) {
            // Jaga-jaga jika data hilang (edge case)
            $progress = new UserProgress();
            $progress->user_id = $user->id;
            $progress->lesson_id = $lessonId;
            $progress->attempts = 1;
        }

        // --- HITUNG SKOR ---
        $currentAttempts = $progress->attempts;
        $calculatedScore = max(60, 100 - (($currentAttempts - 1) * 10));

        // Cek apakah ini kelulusan pertama?
        if ($progress->status !== 'completed') {
            $progress->status = 'completed';
            $progress->score = $calculatedScore;
            $progress->completed_at = now();
            $progress->save();

            // --- HADIAH (XP & BINTANG) ---
            $user->xp += $lesson->xp_reward;
            $user->stars += 1;
            $user->save();

        } else {
            // Remedial
            $progress->touch();
        }

        // --- UNLOCK NEXT LEVEL ---
        $nextLesson = Lesson::where('week_id', $lesson->week_id)
            ->where('order', '>', $lesson->order)
            ->orderBy('order', 'asc')
            ->first();

        if (!$nextLesson) {
             $nextLesson = Lesson::where('week_id', '>', $lesson->week_id)
                ->orderBy('week_id', 'asc')
                ->orderBy('order', 'asc')
                ->first();
        }

        if ($nextLesson) {
            UserProgress::firstOrCreate(
                ['user_id' => $user->id, 'lesson_id' => $nextLesson->id],
                ['status' => 'unlocked']
            );
        }

        $lesson->load('week.course');
        $courseSlug = $lesson->week->course->slug;

        // 2. Redirect ke Peta Course spesifik (misal: /course/jarkom)
        return to_route('course.map', $courseSlug)->with('message', 'Level Selesai! XP Bertambah.');
    }
}
