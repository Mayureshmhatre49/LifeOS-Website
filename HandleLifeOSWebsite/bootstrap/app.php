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
        // Trust X-Forwarded-For from load-balancers / CDN
        $middleware->trustProxies(
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
