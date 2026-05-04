<?php

use App\Http\Controllers\Marketing\BlogController;
use App\Http\Controllers\Marketing\LeadController;
use App\Http\Controllers\Marketing\PageController;
use App\Http\Controllers\Marketing\RobotsController;
use App\Http\Controllers\Marketing\SitemapController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ── Public pages ─────────────────────────────────────────────────────────
// 120 requests/minute per IP (global WAF rate — covers scraping & DDoS)
Route::middleware('throttle:120,1')
    ->controller(PageController::class)
    ->group(function () {
        Route::get('/',           'home')->name('home');
        Route::get('/features',   'features')->name('features');
        Route::get('/families',   'families')->name('families');
        Route::get('/pricing',    'pricing')->name('pricing');
        Route::get('/security',   'security')->name('security');
        Route::get('/enterprise', 'enterprise')->name('enterprise');
        Route::get('/about',      'about')->name('about');
        Route::get('/contact',    'contact')->name('contact');
        Route::get('/waitlist',   'waitlist')->name('waitlist');
        Route::get('/roadmap',    'roadmap')->name('roadmap');
        Route::get('/privacy',    'privacy')->name('privacy');
        Route::get('/terms',      'terms')->name('terms');
    });

// ── Blog ─────────────────────────────────────────────────────────────────
Route::middleware('throttle:120,1')->group(function () {
    Route::get('/blog',        [BlogController::class, 'index'])->name('blog.index');
    Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show')
        ->where('slug', '[a-z0-9\-]+');   // enforce clean slugs at routing layer
});

// ── Form submissions ──────────────────────────────────────────────────────
// Honeypot + tight throttle: 5 contact / 3 waitlist per IP per minute
Route::post('/lead', [LeadController::class, 'store'])
    ->middleware(['throttle:5,1', 'honeypot'])
    ->name('lead.store');

Route::post('/waitlist', [LeadController::class, 'waitlist'])
    ->middleware(['throttle:3,1', 'honeypot'])
    ->name('waitlist.store');

// ── SEO ───────────────────────────────────────────────────────────────────
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt',  [RobotsController::class, 'index'])->name('robots');
