<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');

            // Status: 'locked' (terkunci), 'unlocked' (terbuka), 'completed' (selesai)
            $table->string('status')->default('locked');

            // Data untuk Analisis Skripsi
            $table->integer('score')->default(0); // Nilai kognitif
            $table->integer('attempts')->default(0); // Berapa kali mencoba (mengukur kesulitan)
            $table->integer('time_spent')->default(0); // Detik (mengukur efisiensi)

            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
