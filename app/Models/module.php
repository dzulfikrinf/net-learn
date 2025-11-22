<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relasi: Modul milik Satu Level
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    // Casting kolom 'data' agar otomatis jadi JSON/Array saat diambil
    protected $casts = [
        'data' => 'array',
    ];
}
