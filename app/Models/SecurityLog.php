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

    /**
     * GDPR-friendly IP storage: hash the raw IP with the app key as a salt
     * so abuse-detection works (same IP → same hash) but no raw PII is stored.
     */
    public function setIpAddressAttribute(?string $value): void
    {
        if ($value === null || $value === '') {
            $this->attributes['ip_address'] = null;
            return;
        }
        $this->attributes['ip_address'] = hash('sha256', $value . config('app.key'));
    }
}
