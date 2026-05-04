<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $posts = class_exists(Post::class)
            ? Post::where('is_published', true)->latest('published_at')->get()
            : collect();

        // Per-page metadata: priority + changefreq tuned by importance
        $staticPages = [
            ['path' => '/',           'priority' => '1.0', 'changefreq' => 'daily',   'image' => 'images/og-main.png'],
            ['path' => '/features',   'priority' => '0.9', 'changefreq' => 'weekly',  'image' => 'images/og-main.png'],
            ['path' => '/pricing',    'priority' => '0.9', 'changefreq' => 'weekly',  'image' => 'images/og-main.png'],
            ['path' => '/families',   'priority' => '0.8', 'changefreq' => 'weekly',  'image' => 'images/families-hero.png'],
            ['path' => '/security',   'priority' => '0.8', 'changefreq' => 'monthly', 'image' => 'images/og-main.png'],
            ['path' => '/enterprise', 'priority' => '0.7', 'changefreq' => 'monthly', 'image' => 'images/og-main.png'],
            ['path' => '/about',      'priority' => '0.6', 'changefreq' => 'monthly', 'image' => 'images/og-main.png'],
            ['path' => '/roadmap',    'priority' => '0.7', 'changefreq' => 'weekly',  'image' => 'images/og-main.png'],
            ['path' => '/contact',    'priority' => '0.5', 'changefreq' => 'monthly', 'image' => null],
            ['path' => '/waitlist',   'priority' => '0.9', 'changefreq' => 'weekly',  'image' => 'images/og-main.png'],
            ['path' => '/blog',       'priority' => '0.7', 'changefreq' => 'daily',   'image' => null],
            ['path' => '/privacy',    'priority' => '0.3', 'changefreq' => 'yearly',  'image' => null],
            ['path' => '/terms',      'priority' => '0.3', 'changefreq' => 'yearly',  'image' => null],
        ];

        $xml = view('marketing.sitemap', compact('posts', 'staticPages'))->render();

        return response($xml, 200, [
            'Content-Type'  => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
