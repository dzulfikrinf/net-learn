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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');

            // Tipe konten: 'text', 'video', 'quiz', 'simulator_vlsm', dll
            $table->string('type');

            // Isi materi (bisa HTML)
            $table->text('content')->nullable();

            // Kolom SAKTI: Menyimpan konfigurasi soal/simulator dalam JSON
            $table->json('data')->nullable();

            $table->integer('order'); // Slide ke-1, ke-2, dst
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
