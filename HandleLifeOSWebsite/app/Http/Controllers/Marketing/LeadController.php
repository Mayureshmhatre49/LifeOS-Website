<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadRequest;
use App\Http\Requests\WaitlistRequest;
use App\Models\Lead;
use App\Models\SecurityLog;
use App\Models\Waitlist;

class LeadController extends Controller
{
    public function store(LeadRequest $request)
    {
        $data = $request->validated();

        Lead::create([
            'name'         => $data['name'],
            'email'        => strtolower(trim($data['email'])),
            'company_name' => $data['company_name'] ?? null,
            'inquiry_type' => $data['inquiry_type'],
            'page_source'  => $this->safeReferer($request),
            'message'      => $data['message'] ?? null,
        ]);

        $this->logEvent($request, 'lead_submitted');

        return back()->with('success', "Message received. We'll reach out shortly.");
    }

    public function waitlist(WaitlistRequest $request)
    {
        $data = $request->validated();

        Waitlist::create([
            'email'       => $data['email'],
            'page_source' => $this->safeReferer($request),
            'ip_address'  => $this->hashIp($request->ip()),  // hashed — GDPR-friendly
        ]);

        $this->logEvent($request, 'waitlist_joined');

        return back()->with('success', "You're on the list. Early access invite incoming.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function safeReferer($request): string
    {
        $referer = $request->header('referer', '');
        // Accept only same-origin referers to prevent open-redirect logging
        $appUrl = rtrim(config('app.url'), '/');
        if (str_starts_with($referer, $appUrl)) {
            return substr($referer, 0, 255);
        }
        return 'direct';
    }

    private function hashIp(string $ip): string
    {
        // One-way hash — retains abuse-detection utility without storing raw PII
        return hash('sha256', $ip . config('app.key'));
    }

    private function logEvent($request, string $type): void
    {
        try {
            SecurityLog::create([
                'event_type' => $type,
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 500),
                'method'     => $request->method(),
                'path'       => substr($request->path(), 0, 500),
                'detail'     => '',
                'blocked'    => false,
            ]);
        } catch (\Throwable) {
            // Never let logging break the user flow
        }
    }
}
