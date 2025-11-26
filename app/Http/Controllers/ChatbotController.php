<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            Log::error('Gemini Error: API Key tidak ditemukan di .env');
            return response()->json(['reply' => "Sistem Error: API Key belum disetting."], 500);
        }

        $systemInstruction = "Kamu adalah NetBot, asisten guru Jaringan Komputer. Jawablah pertanyaan siswa dengan singkat, jelas, dan santai.";

        try {
            $response = Http::withOptions(['verify' => false])
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $systemInstruction . "\n\n Pertanyaan: " . $userMessage]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Error Response: ' . $response->body());
                return response()->json(['reply' => "Maaf, otak saya sedang gangguan. (API Error)"], 500);
            }

            $data = $response->json();
            $botReply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, saya bingung.";

            return response()->json(['reply' => $botReply]);

        } catch (\Exception $e) {
            Log::error('Controller Crash: ' . $e->getMessage());
            return response()->json(['reply' => "Terjadi kesalahan internal server."], 500);
        }
    }
}
