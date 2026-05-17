<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Web Application Firewall (WAF)
    |--------------------------------------------------------------------------
    | Toggle the BlockMaliciousRequests middleware globally.
    | Set SECURITY_WAF_ENABLED=false in .env to disable during debugging.
    */
    'waf_enabled' => env('SECURITY_WAF_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | HTTP Strict Transport Security (HSTS)
    |--------------------------------------------------------------------------
    | Only sent over HTTPS connections. max-age in seconds (1 year = 31536000).
    | Once preload is enabled and submitted to browsers' preload list, HTTPS
    | is enforced before any connection is ever made to the server.
    */
    'hsts_enabled'    => env('SECURITY_HSTS_ENABLED', true),
    'hsts_max_age'    => env('SECURITY_HSTS_MAX_AGE', 31536000),
    'hsts_subdomains' => env('SECURITY_HSTS_SUBDOMAINS', true),
    'hsts_preload'    => env('SECURITY_HSTS_PRELOAD', true),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    | Format: "maxAttempts,decayMinutes"
    | lead_store   — Contact form submissions
    | waitlist     — Waitlist signups
    | web_global   — All page views (brute-force / scraping prevention)
    */
    'rate_lead'     => env('SECURITY_RATE_LEAD', '5,1'),       // 5 per IP per minute
    'rate_waitlist' => env('SECURITY_RATE_WAITLIST', '3,1'),   // 3 per IP per minute
    'rate_web'      => env('SECURITY_RATE_WEB', '120,1'),      // 120 page views per minute

    /*
    |--------------------------------------------------------------------------
    | Honeypot
    |--------------------------------------------------------------------------
    | Hidden form field name. Bots autofill everything; humans never see it.
    | Keep this consistent with the blade templates.
    */
    'honeypot_field' => '_hp_website',

    /*
    |--------------------------------------------------------------------------
    | Trusted Proxies
    |--------------------------------------------------------------------------
    | List your load-balancer / CDN IP ranges here so X-Forwarded-For headers
    | are trusted for accurate IP detection.
    */
    'trusted_proxies' => env('TRUSTED_PROXIES', '*'),

];
