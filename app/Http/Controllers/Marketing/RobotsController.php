<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function index(): Response
    {
        $appUrl = rtrim(config('app.url'), '/');

        $lines = [
            '# robots.txt for HandleLife OS',
            '# Generated dynamically — do not edit static file',
            '',
            '# Allow all well-behaved crawlers',
            'User-agent: *',
            'Allow: /',
            'Crawl-delay: 1',
            '',
            '# Block sensitive / non-indexable paths',
            'Disallow: /lead',
            'Disallow: /waitlist/store',
            'Disallow: /api/',
            'Disallow: /admin',
            'Disallow: /admin/',
            'Disallow: /login',
            'Disallow: /logout',
            'Disallow: /password',
            'Disallow: /storage/',
            'Disallow: /vendor/',
            'Disallow: /*.env$',
            'Disallow: /*.log$',
            'Disallow: /*.sql$',
            'Disallow: /*?*utm_',
            'Disallow: /*?*fbclid',
            'Disallow: /*?*gclid',
            'Disallow: /*?*ref=',
            '',
            '# Block aggressive scrapers and AI training crawlers (allow indexing crawlers)',
            'User-agent: GPTBot',
            'Disallow: /',
            '',
            'User-agent: ChatGPT-User',
            'Disallow: /',
            '',
            'User-agent: CCBot',
            'Disallow: /',
            '',
            'User-agent: anthropic-ai',
            'Disallow: /',
            '',
            'User-agent: Claude-Web',
            'Disallow: /',
            '',
            'User-agent: Google-Extended',
            'Disallow: /',
            '',
            'User-agent: PerplexityBot',
            'Disallow: /',
            '',
            'User-agent: Amazonbot',
            'Disallow: /',
            '',
            'User-agent: Bytespider',
            'Disallow: /',
            '',
            'User-agent: FacebookBot',
            'Disallow: /',
            '',
            '# Allow image search crawlers',
            'User-agent: Googlebot-Image',
            'Allow: /images/',
            'Allow: /build/',
            '',
            '# Sitemap',
            'Sitemap: ' . $appUrl . '/sitemap.xml',
            '',
            '# Host (canonical hostname)',
            'Host: ' . parse_url($appUrl, PHP_URL_HOST),
            '',
        ];

        return response(implode("\n", $lines), 200, [
            'Content-Type'  => 'text/plain; charset=UTF-8',
            'Cache-Control' => 'public, max-age=86400, stale-while-revalidate=604800',
        ]);
    }
}
