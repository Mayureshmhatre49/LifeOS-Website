@props(['type', 'data' => []])

@php
    $base = rtrim(config('app.url'), '/');

    $organization = [
        '@context' => 'https://schema.org',
        '@type'    => 'Organization',
        'name'     => 'HandleLife OS',
        'legalName'=> 'HandleLife OS',
        'url'      => $base,
        'logo'     => [
            '@type'  => 'ImageObject',
            'url'    => asset('images/logo.png'),
            'width'  => 512,
            'height' => 512,
        ],
        'description' => 'AI-powered personal life operating system that reduces mental load and helps people handle everyday life with clarity.',
        'foundingDate' => '2025',
        'slogan'       => 'Handle life with clarity.',
        'sameAs' => [
            'https://twitter.com/handlelifeos',
            'https://x.com/handlelifeos',
            'https://linkedin.com/company/handlelifeos',
            'https://www.facebook.com/handlelifeos',
            'https://www.instagram.com/handlelifeos',
            'https://www.youtube.com/@handlelifeos',
        ],
        'contactPoint' => [
            '@type'         => 'ContactPoint',
            'contactType'   => 'customer support',
            'url'           => $base . '/contact',
            'availableLanguage' => ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Hindi', 'Arabic', 'Chinese', 'Japanese'],
            'areaServed'    => 'Worldwide',
        ],
        'address' => [
            '@type'           => 'PostalAddress',
            'addressLocality' => 'San Francisco',
            'addressRegion'   => 'CA',
            'addressCountry'  => 'US',
        ],
    ];

    $website = [
        '@context'         => 'https://schema.org',
        '@type'            => 'WebSite',
        'name'             => 'HandleLife OS',
        'alternateName'    => 'HandleLife',
        'url'              => $base,
        'description'      => 'AI for everyday life — the personal life operating system.',
        'inLanguage'       => ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ru', 'zh', 'ja', 'ko', 'hi', 'ar', 'tr', 'pl', 'sv', 'id', 'vi', 'uk', 'ms'],
        'publisher'        => ['@type' => 'Organization', 'name' => 'HandleLife OS'],
        'potentialAction'  => [
            '@type'       => 'SearchAction',
            'target'      => [
                '@type'       => 'EntryPoint',
                'urlTemplate' => $base . '/blog?search={search_term_string}',
            ],
            'query-input' => 'required name=search_term_string',
        ],
    ];

    $softwareApp = [
        '@context'        => 'https://schema.org',
        '@type'           => 'SoftwareApplication',
        'name'            => 'HandleLife OS',
        'applicationCategory'    => 'LifestyleApplication',
        'applicationSubCategory' => 'PersonalProductivity',
        'operatingSystem' => 'Web',
        'url'             => $base,
        'description'     => 'AI-powered personal life operating system. Reduce mental load, organize your household, and make better decisions.',
        'image'           => asset('images/og-main.png'),
        'softwareVersion' => '1.0',
        'offers' => [
            '@type'         => 'Offer',
            'price'         => '0',
            'priceCurrency' => 'USD',
            'availability'  => 'https://schema.org/PreOrder',
        ],
        'author'          => ['@type' => 'Organization', 'name' => 'HandleLife OS'],
        'publisher'       => ['@type' => 'Organization', 'name' => 'HandleLife OS'],
    ];

    $schema = match($type) {
        'organization'  => $organization,
        'website'       => $website,
        'softwareapp'   => $softwareApp,
        'breadcrumb'    => [
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => collect($data)->map(function ($item, $i) use ($base) {
                return [
                    '@type'    => 'ListItem',
                    'position' => $i + 1,
                    'name'     => $item['name'],
                    'item'     => str_starts_with($item['url'] ?? '', 'http') ? $item['url'] : $base . ($item['url'] ?? ''),
                ];
            })->values()->all(),
        ],
        'faq' => [
            '@context'   => 'https://schema.org',
            '@type'      => 'FAQPage',
            'mainEntity' => collect($data)->map(fn ($qa) => [
                '@type'          => 'Question',
                'name'           => $qa['q'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => $qa['a'],
                ],
            ])->values()->all(),
        ],
        'product' => array_merge([
            '@context' => 'https://schema.org',
            '@type'    => 'Product',
        ], $data),
        'offer' => array_merge([
            '@context' => 'https://schema.org',
            '@type'    => 'Offer',
        ], $data),
        'contactpage' => [
            '@context'   => 'https://schema.org',
            '@type'      => 'ContactPage',
            'name'       => 'Contact HandleLife OS',
            'url'        => $base . '/contact',
            'description'=> 'Get in touch with the HandleLife OS team for partnerships, demos, support, or general questions.',
        ],
        'aboutpage' => [
            '@context'   => 'https://schema.org',
            '@type'      => 'AboutPage',
            'name'       => 'About HandleLife OS',
            'url'        => $base . '/about',
            'description'=> 'Why we built HandleLife OS — our mission to help people handle life with dignity, clarity, and calm.',
        ],
        'webpage' => array_merge([
            '@context' => 'https://schema.org',
            '@type'    => 'WebPage',
        ], $data),
        'blogpost'  => array_merge(['@context' => 'https://schema.org', '@type' => 'BlogPosting'], $data),
        'article'   => array_merge(['@context' => 'https://schema.org', '@type' => 'Article'], $data),
        default     => null,
    };
@endphp

@if($schema)
{{-- JSON_HEX_TAG/APOS/QUOT/AMP prevents `</script>` and quote breakouts when
     user-controlled fields (e.g. blog post titles) flow into the schema. --}}
<script type="application/ld+json">
{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) !!}
</script>
@endif
