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
            '# AI search/citation indexers — ALLOW (these drive traffic via Perplexity, ChatGPT Search, Claude, Gemini)',
            '# PerplexityBot, OAI-SearchBot, ClaudeBot, Google-Extended are covered by User-agent: * above.',
            '# Explicit allow entries are redundant but included for clarity.',
            'User-agent: PerplexityBot',
            'Allow: /',
            '',
            'User-agent: OAI-SearchBot',
            'Allow: /',
            '',
            'User-agent: ClaudeBot',
            'Allow: /',
            '',
            'User-agent: Google-Extended',
            'Allow: /',
            '',
            'User-agent: ChatGPT-User',
            'Allow: /',
            '',
            '# AI training crawlers — BLOCK (pure scrapers that do not return traffic)',
            'User-agent: GPTBot',
            'Disallow: /',
            '',
            'User-agent: anthropic-ai',
            'Disallow: /',
            '',
            'User-agent: CCBot',
            'Disallow: /',
            '',
            'User-agent: Bytespider',
            'Disallow: /',
            '',
            'User-agent: FacebookBot',
            'Disallow: /',
            '',
            'User-agent: Amazonbot',
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
