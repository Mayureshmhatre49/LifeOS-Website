<?php echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n"; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
@php
    $hreflangs = ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ru', 'zh', 'ja', 'ko', 'hi', 'ar', 'tr', 'pl', 'sv', 'id', 'vi', 'uk', 'ms'];
@endphp
@foreach($staticPages as $page)
    <url>
        <loc>{{ url($page['path']) }}</loc>
        <changefreq>{{ $page['changefreq'] }}</changefreq>
        <priority>{{ $page['priority'] }}</priority>
        @foreach($hreflangs as $lang)
            <xhtml:link rel="alternate" hreflang="{{ $lang }}" href="{{ url($page['path']) }}" />
        @endforeach
        <xhtml:link rel="alternate" hreflang="x-default" href="{{ url($page['path']) }}" />
        @if(!empty($page['image']))
            <image:image>
                <image:loc>{{ asset($page['image']) }}</image:loc>
                <image:title>HandleLife OS</image:title>
                <image:caption>HandleLife OS — AI for everyday life</image:caption>
            </image:image>
        @endif
    </url>
@endforeach

@foreach($posts as $post)
    <url>
        <loc>{{ route('blog.show', $post->slug) }}</loc>
        <lastmod>{{ optional($post->updated_at)->format('Y-m-d') ?? now()->format('Y-m-d') }}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
@endforeach
</urlset>
