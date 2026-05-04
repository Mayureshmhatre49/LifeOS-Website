<?php

use App\Http\Middleware\BlockMaliciousRequests;
use App\Http\Middleware\HoneypotGuard;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ── 1. Global middleware (every request) ──────────────────────
        $middleware->append(SecurityHeaders::class);
        $middleware->append(BlockMaliciousRequests::class);

        // ── 2. Named aliases (applied per-route) ──────────────────────
        $middleware->alias([
            'honeypot' => HoneypotGuard::class,
        ]);

        // ── 3. Trusted proxies ────────────────────────────────────────
        // X-Forwarded-* headers from arbitrary clients are spoofable; only
        // honour them from proxy hops listed in TRUSTED_PROXIES (env-driven).
        // Use "*" only when you fully control every network hop in front of
        // the app (i.e. running behind a single, trusted CDN like Cloudflare).
        // env() is used directly because config() isn't available at boot.
        $trustedProxiesRaw = env('TRUSTED_PROXIES', '*');
        $trustedProxies = $trustedProxiesRaw === '*'
            ? '*'
            : array_filter(array_map('trim', explode(',', (string) $trustedProxiesRaw)));

        $middleware->trustProxies(
            at: $trustedProxies,
            headers: Request::HEADER_X_FORWARDED_FOR
                   | Request::HEADER_X_FORWARDED_HOST
                   | Request::HEADER_X_FORWARDED_PORT
                   | Request::HEADER_X_FORWARDED_PROTO
                   | Request::HEADER_X_FORWARDED_AWS_ELB,
        );

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
