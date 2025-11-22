<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Week; // Pastikan ini ada
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    // --- FUNGSI INI YANG HILANG TADI ---
    public function index()
    {
        // 1. Ambil Data User yang sedang login
        $user = Auth::user();

        // 2. Ambil Data Kurikulum (Minggu beserta Level-nya)
        $weeks = Week::with(['lessons' => function($query) {
            $query->orderBy('order', 'asc');
        }])
        ->orderBy('week_number', 'asc')
        ->get();

        // 3. Kirim ke Frontend
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'weeks' => $weeks,
            'gamification' => [
                'xp' => $user->xp,
                'rank' => 'Novice Networker',
                'streak' => 0 // Nanti kita ambil dari user_progress
            ]
        ]);
    }
}
