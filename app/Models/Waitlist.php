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

    // Hash raw IP before storage — matches SecurityLog pattern, GDPR-friendly
    public function setIpAddressAttribute(?string $value): void
    {
        if ($value === null || $value === '') {
            $this->attributes['ip_address'] = null;
            return;
        }
        $this->attributes['ip_address'] = hash('sha256', $value . config('app.key'));
    }
}
