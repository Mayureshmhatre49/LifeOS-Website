<?php

namespace App\Http\Middleware;

use App\Models\SecurityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Honeypot protection: forms embed a hidden field that legitimate users never fill in.
 * Bots that autofill all fields will populate it, revealing themselves.
 *
 * Field name: _hp_website (looks like a plausible "website URL" field to bots)
 * The field must be present in the request AND must be empty to pass.
 * Requests missing the field entirely (e.g. direct API calls) are also flagged.
 */
class HoneypotGuard
{
    private string $field = '_hp_website';

    public function handle(Request $request, Closure $next): Response
    {
        // Only inspect POST requests to form endpoints
        if (!$request->isMethod('POST')) {
            return $next($request);
        }

        $value = $request->input($this->field);

        // Field missing entirely → direct programmatic POST (no browser form)
        if (!$request->has($this->field)) {
            $this->log($request, 'honeypot_field_missing');
            // Silently succeed so the attacker doesn't know they were detected
            return $this->silentReject($request);
        }

        // Field populated → bot filled it in
        if (!empty($value)) {
            $this->log($request, 'honeypot_triggered', $value);
            return $this->silentReject($request);
        }

        return $next($request);
    }

    private function silentReject(Request $request): Response
    {
        // Return a convincing 200 success so bots don't retry
        if ($request->expectsJson()) {
            return response()->json(['message' => 'OK'], 200);
        }

        return back()->with('success', 'Thank you! We\'ve received your message.');
    }

    private function log(Request $request, string $type, string $detail = ''): void
    {
        try {
            SecurityLog::create([
                'event_type' => $type,
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 500),
                'method'     => $request->method(),
                'path'       => substr($request->path(), 0, 500),
                'detail'     => substr($detail, 0, 500),
                'blocked'    => true,
            ]);
        } catch (\Throwable) {
            // Never let logging break the response
        }
    }
}
