<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    public function complete(Request $request, $lessonId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $lesson = Lesson::findOrFail($lessonId);

        // 1. Cek apakah data progress untuk level ini sudah ada?
        $progress = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();

        // LOGIKA BARU:
        // Berikan hadiah HANYA JIKA:
        // 1. Data belum ada sama sekali (NULL)
        // 2. ATAU Data ada, tapi statusnya BELUM 'completed' (misal: 'unlocked' atau 'started')

        if (!$progress || $progress->status !== 'completed') {

            // A. Update atau Buat Data Progress
            if (!$progress) {
                // Kalau belum ada data, buat baru
                $progress = new UserProgress();
                $progress->user_id = $user->id;
                $progress->lesson_id = $lessonId;
            }

            // Isi data kelulusan
            $progress->status = 'completed';
            $progress->score = 100;
            $progress->attempts = ($progress->attempts ?? 0) + 1;
            $progress->completed_at = now();
            $progress->save();

            // B. BERIKAN HADIAH (XP & BINTANG)
            // Karena ini pertama kali statusnya jadi 'completed', kita kasih hadiah
            $user->increment('xp', $lesson->xp_reward);
            $user->increment('stars', 1);

        } else {
            // --- SUDAH PERNAH LULUS SEBELUMNYA (REMEDIAL) ---
            // Cuma update timestamp ("baru saja dikerjakan lagi")
            // Tidak dapat XP/Bintang lagi agar tidak farming
            $progress->touch();
        }

        // 3. UNLOCK LEVEL SELANJUTNYA (Logic tetap sama)
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

        return to_route('dashboard')->with('message', 'Level Selesai!');
    }
}
