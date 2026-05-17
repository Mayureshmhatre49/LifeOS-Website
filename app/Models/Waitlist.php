<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Waitlist extends Model
{
    use HasFactory;

    protected $table = 'waitlist';

    protected $fillable = [
        'email', 'referral_code', 'country', 
        'use_case', 'page_source', 'ip_address'
    ];
}
