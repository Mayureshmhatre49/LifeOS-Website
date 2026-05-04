<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    private array $removeHeaders = [
        'X-Powered-By',
        'Server',
        'X-Runtime',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Strip headers that reveal server internals
        foreach ($this->removeHeaders as $header) {
            $response->headers->remove($header);
            header_remove($header);
        }

        // ── Clickjacking ─────────────────────────────────────────────
        $response->headers->set('X-Frame-Options', 'DENY');

        // ── MIME sniffing prevention ──────────────────────────────────
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // ── Legacy XSS filter (belt-and-suspenders for old browsers) ──
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // ── HTTPS enforcement (HSTS) ──────────────────────────────────
        if (config('security.hsts_enabled', true) && $request->isSecure()) {
            $maxAge     = config('security.hsts_max_age', 31536000);
            $subDomains = config('security.hsts_subdomains', true) ? '; includeSubDomains' : '';
            $preload    = config('security.hsts_preload', true) ? '; preload' : '';
            $response->headers->set('Strict-Transport-Security', "max-age={$maxAge}{$subDomains}{$preload}");
        }

        // ── Referrer policy ───────────────────────────────────────────
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // ── Feature/Permissions policy ────────────────────────────────
        $response->headers->set('Permissions-Policy', implode(', ', [
            'accelerometer=()',
            'ambient-light-sensor=()',
            'autoplay=()',
            'battery=()',
            'camera=()',
            'cross-origin-isolated=()',
            'display-capture=()',
            'document-domain=()',
            'encrypted-media=()',
            'execution-while-not-rendered=()',
            'execution-while-out-of-viewport=()',
            'fullscreen=()',
            'geolocation=()',
            'gyroscope=()',
            'keyboard-map=()',
            'magnetometer=()',
            'microphone=()',
            'midi=()',
            'navigation-override=()',
            'payment=()',
            'picture-in-picture=()',
            'publickey-credentials-get=()',
            'screen-wake-lock=()',
            'sync-xhr=()',
            'usb=()',
            'web-share=()',
            'xr-spatial-tracking=()',
        ]));

        // ── Cross-Origin policies ─────────────────────────────────────
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

        // ── Content Security Policy ───────────────────────────────────
        // Alpine.js uses inline x-on handlers, so unsafe-inline is required for scripts.
        // All other directives are locked down tightly.
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://translate.google.com https://translate.googleapis.com https://www.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' https://translate.googleapis.com https://translate.google.com",
            "frame-src https://translate.google.com",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "manifest-src 'self'",
            "worker-src 'none'",
            "upgrade-insecure-requests",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        // ── Cache: never cache sensitive pages ────────────────────────
        if ($this->isSensitivePage($request)) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
        }

        return $response;
    }

    private function isSensitivePage(Request $request): bool
    {
        $sensitive = ['/lead', '/waitlist', '/contact'];
        return in_array('/' . $request->path(), $sensitive, true);
    }
}
