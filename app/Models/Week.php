<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Week extends Model
{
    use HasFactory;

    // Izinkan semua kolom diisi (biar gampang seeding)
    protected $guarded = [];

    // Relasi: Satu Minggu punya BANYAK Level
    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }
}
