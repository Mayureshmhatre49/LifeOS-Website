@props(['title', 'description', 'image', 'keywords', 'robots', 'author', 'publishedTime', 'modifiedTime', 'type'])

@php
    $defaultTitle       = 'HandleLife OS — AI for Everyday Life | Personal Life Operating System';
    $defaultDescription = 'HandleLife OS is the AI-powered personal life operating system that reduces mental load, helps you make smarter decisions, and handles the chaos of everyday life. Privacy-first, available worldwide.';
    $defaultKeywords    = 'AI life assistant, personal organization software, decision making AI, mental load app, family coordination, household management, personal AI, life operating system, productivity AI, digital life manager';

    $displayTitle       = isset($title) ? $title . ' | HandleLife OS' : $defaultTitle;
    $displayDescription = $description ?? $defaultDescription;
    $displayKeywords    = $keywords ?? $defaultKeywords;
    $displayRobots      = $robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    $displayType        = $type ?? 'website';
    $displayAuthor      = $author ?? 'HandleLife OS Team';

    // Strip query string and fragment from canonical to avoid duplicate-content signals
    $canonical = url()->current();

    // Resolve OG image as absolute URL (Open Graph requires absolute URLs)
    $ogImage = isset($image) ? (str_starts_with($image, 'http') ? $image : asset($image)) : asset('images/og-main.png');
@endphp

<title>{{ $displayTitle }}</title>
<meta name="description" content="{{ $displayDescription }}">
<meta name="keywords" content="{{ $displayKeywords }}">
<meta name="robots" content="{{ $displayRobots }}">
<meta name="googlebot" content="{{ $displayRobots }}">
<meta name="bingbot" content="{{ $displayRobots }}">
<meta name="author" content="{{ $displayAuthor }}">
<meta name="publisher" content="HandleLife OS">
<meta name="copyright" content="© {{ date('Y') }} HandleLife OS. All rights reserved.">
<meta name="rating" content="general">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="language" content="English">
<meta name="revisit-after" content="7 days">
<meta name="distribution" content="global">
<meta name="HandheldFriendly" content="true">
<meta name="MobileOptimized" content="320">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="{{ $displayType }}">
<meta property="og:url" content="{{ $canonical }}">
<meta property="og:site_name" content="HandleLife OS">
<meta property="og:title" content="{{ $displayTitle }}">
<meta property="og:description" content="{{ $displayDescription }}">
<meta property="og:image" content="{{ $ogImage }}">
<meta property="og:image:secure_url" content="{{ $ogImage }}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="HandleLife OS — AI for everyday life">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="es_ES">
<meta property="og:locale:alternate" content="fr_FR">
<meta property="og:locale:alternate" content="de_DE">
<meta property="og:locale:alternate" content="pt_BR">
<meta property="og:locale:alternate" content="hi_IN">
<meta property="og:locale:alternate" content="ar_SA">
<meta property="og:locale:alternate" content="zh_CN">
<meta property="og:locale:alternate" content="ja_JP">
@isset($publishedTime)
<meta property="article:published_time" content="{{ $publishedTime }}">
@endisset
@isset($modifiedTime)
<meta property="article:modified_time" content="{{ $modifiedTime }}">
@endisset

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@handlelifeos">
<meta name="twitter:creator" content="@handlelifeos">
<meta name="twitter:url" content="{{ $canonical }}">
<meta name="twitter:title" content="{{ $displayTitle }}">
<meta name="twitter:description" content="{{ $displayDescription }}">
<meta name="twitter:image" content="{{ $ogImage }}">
<meta name="twitter:image:alt" content="HandleLife OS — AI for everyday life">

<!-- Canonical (no query string, no fragment) -->
<link rel="canonical" href="{{ $canonical }}">

<!-- Discoverability -->
<link rel="sitemap" type="application/xml" title="Sitemap" href="{{ url('/sitemap.xml') }}">
<link rel="alternate" type="application/rss+xml" title="HandleLife OS Blog" href="{{ url('/blog/feed') }}">

<!-- Structured Data -->
<x-schema type="organization" />
<x-schema type="website" />
<x-schema type="softwareapp" />
@stack('schema')
