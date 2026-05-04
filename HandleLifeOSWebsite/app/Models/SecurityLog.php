<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    public $timestamps = true;

    protected $fillable = [
        'event_type',
        'ip_address',
        'user_agent',
        'method',
        'path',
        'detail',
        'blocked',
    ];

    protected $casts = [
        'blocked' => 'boolean',
    ];

    // No updated_at — logs are write-once
    const UPDATED_AT = null;
}
