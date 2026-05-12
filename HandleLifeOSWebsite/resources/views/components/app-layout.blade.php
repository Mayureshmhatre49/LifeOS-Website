@props(['title' => null, 'description' => null, 'keywords' => null, 'robots' => null, 'image' => null])

<!DOCTYPE html>
<html lang="en" class="scroll-smooth" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <meta name="theme-color" content="#020617">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Favicons & PWA --}}
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="mask-icon" href="{{ asset('safari-pinned-tab.svg') }}" color="#020617">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">
    <meta name="msapplication-TileColor" content="#020617">
    <meta name="msapplication-config" content="{{ asset('browserconfig.xml') }}">
    <meta name="application-name" content="HandleLife OS">
    <meta name="apple-mobile-web-app-title" content="HandleLife OS">

    {{-- DNS prefetch / preconnect for third-party origins --}}
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="https://translate.googleapis.com">
    <link rel="preconnect" href="https://translate.googleapis.com" crossorigin>

    {{-- i18n: hreflang alternate links — point to *current* path, not homepage (Google requirement) --}}
    @php $currentPath = '/' . ltrim(request()->path() === '/' ? '' : request()->path(), '/'); @endphp
    <link rel="alternate" hreflang="x-default" href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="en"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="es"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="fr"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="de"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="pt"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="it"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="nl"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="ru"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="zh"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="ja"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="ko"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="hi"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="ar"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="tr"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="pl"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="sv"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="id"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="vi"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="uk"    href="{{ url($currentPath) }}">
    <link rel="alternate" hreflang="ms"    href="{{ url($currentPath) }}">

    {{-- SEO, OG, Twitter, JSON-LD --}}
    <x-seo :title="$title" :description="$description" :keywords="$keywords" :robots="$robots" :image="$image" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
    </noscript>

    <!-- Alpine.js component registrations (CSP-safe: no eval) -->
    <script>
        // ── Globals (shared by DOMContentLoaded + alpine:init) ────────────

        var _LS_KEY = 'hl_lang';

        function _getSaved() {
            try { return localStorage.getItem(_LS_KEY) || 'en'; } catch(e) { return 'en'; }
        }
        function _setSaved(code) {
            try {
                if (code === 'en') localStorage.removeItem(_LS_KEY);
                else localStorage.setItem(_LS_KEY, code);
            } catch(e) {}
        }

        // ── Currency layer ────────────────────────────────────────────────
        // Approximate INR → target rates for indicative pricing display.
        // Live checkout will use real-time exchange rates.
        var _CURRENCIES = {
            'en':    { code: 'USD', rate: 0.012,  locale: 'en-US'  },
            'es':    { code: 'EUR', rate: 0.011,  locale: 'es-ES'  },
            'fr':    { code: 'EUR', rate: 0.011,  locale: 'fr-FR'  },
            'de':    { code: 'EUR', rate: 0.011,  locale: 'de-DE'  },
            'pt':    { code: 'BRL', rate: 0.059,  locale: 'pt-BR'  },
            'it':    { code: 'EUR', rate: 0.011,  locale: 'it-IT'  },
            'nl':    { code: 'EUR', rate: 0.011,  locale: 'nl-NL'  },
            'ru':    { code: 'RUB', rate: 1.11,   locale: 'ru-RU'  },
            'zh-CN': { code: 'CNY', rate: 0.087,  locale: 'zh-CN'  },
            'ja':    { code: 'JPY', rate: 1.82,   locale: 'ja-JP'  },
            'ko':    { code: 'KRW', rate: 16.1,   locale: 'ko-KR'  },
            'hi':    { code: 'INR', rate: 1,      locale: 'hi-IN'  },
            'ar':    { code: 'AED', rate: 0.044,  locale: 'ar-AE'  },
            'tr':    { code: 'TRY', rate: 0.39,   locale: 'tr-TR'  },
            'pl':    { code: 'PLN', rate: 0.048,  locale: 'pl-PL'  },
            'sv':    { code: 'SEK', rate: 0.128,  locale: 'sv-SE'  },
            'id':    { code: 'IDR', rate: 197,    locale: 'id-ID'  },
            'vi':    { code: 'VND', rate: 305,    locale: 'vi-VN'  },
            'uk':    { code: 'UAH', rate: 0.495,  locale: 'uk-UA'  },
            'ms':    { code: 'MYR', rate: 0.053,  locale: 'ms-MY'  },
        };

        // Format an INR amount in the visitor's language currency
        function _formatPrice(amountInr, langCode) {
            var cur = _CURRENCIES[langCode] || _CURRENCIES['en'];
            var converted = amountInr === 0 ? 0 : Math.round(amountInr * cur.rate);
            try {
                return new Intl.NumberFormat(cur.locale, {
                    style: 'currency', currency: cur.code,
                    minimumFractionDigits: 0, maximumFractionDigits: 0,
                }).format(converted);
            } catch(e) {
                return cur.code + ' ' + converted.toLocaleString();
            }
        }

        // Replace every [data-price-inr] element's text with the converted price.
        // Called at DOMContentLoaded so there is no flash of INR on first paint.
        function _applyPrices() {
            var lang = _getSaved();
            document.querySelectorAll('[data-price-inr]').forEach(function(el) {
                var inr = parseFloat(el.getAttribute('data-price-inr'));
                if (!isNaN(inr)) el.textContent = _formatPrice(inr, lang);
                el.style.visibility = 'visible';
            });
        }
        document.addEventListener('DOMContentLoaded', _applyPrices);


        document.addEventListener('alpine:init', () => {
            // ── Built-in translation engine ──────────────────────────────────
            // Calls translate.googleapis.com directly (same endpoint the GT widget
            // uses internally). Works on localhost, no API key, no widget required.
            var _LANGS = [
                { code: 'en',    native: 'English',    flag: '🇬🇧', dir: 'ltr' },
                { code: 'es',    native: 'Español',    flag: '🇪🇸', dir: 'ltr' },
                { code: 'fr',    native: 'Français',   flag: '🇫🇷', dir: 'ltr' },
                { code: 'de',    native: 'Deutsch',    flag: '🇩🇪', dir: 'ltr' },
                { code: 'pt',    native: 'Português',  flag: '🇧🇷', dir: 'ltr' },
                { code: 'it',    native: 'Italiano',   flag: '🇮🇹', dir: 'ltr' },
                { code: 'nl',    native: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
                { code: 'ru',    native: 'Русский',    flag: '🇷🇺', dir: 'ltr' },
                { code: 'zh-CN', native: '中文',        flag: '🇨🇳', dir: 'ltr' },
                { code: 'ja',    native: '日本語',      flag: '🇯🇵', dir: 'ltr' },
                { code: 'ko',    native: '한국어',      flag: '🇰🇷', dir: 'ltr' },
                { code: 'hi',    native: 'हिन्दी',      flag: '🇮🇳', dir: 'ltr' },
                { code: 'ar',    native: 'العربية',    flag: '🇸🇦', dir: 'rtl' },
                { code: 'tr',    native: 'Türkçe',     flag: '🇹🇷', dir: 'ltr' },
                { code: 'pl',    native: 'Polski',     flag: '🇵🇱', dir: 'ltr' },
                { code: 'sv',    native: 'Svenska',    flag: '🇸🇪', dir: 'ltr' },
                { code: 'id',    native: 'Indonesia',  flag: '🇮🇩', dir: 'ltr' },
                { code: 'vi',    native: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
                { code: 'uk',    native: 'Українська', flag: '🇺🇦', dir: 'ltr' },
                { code: 'ms',    native: 'Melayu',     flag: '🇲🇾', dir: 'ltr' },
            ];

            var _SS_PFX   = 'hl_t_';     // sessionStorage prefix for per-page cache
            var _initDone = false;        // ensures only one instance triggers init translation

            // Collect translatable text nodes (skip scripts, notranslate zones, Alpine-managed text)
            function _textNodes() {
                var SKIP = new Set(['script','style','noscript','template','code','pre','textarea','input','select','option','svg']);
                var list = [];
                var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                    acceptNode: function(node) {
                        var p = node.parentElement;
                        if (!p) return NodeFilter.FILTER_REJECT;
                        if (SKIP.has(p.tagName.toLowerCase())) return NodeFilter.FILTER_REJECT;
                        // Skip nodes inside notranslate zones or Alpine-managed text
                        if (p.closest('.notranslate,[translate="no"],[x-text],[x-html]')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        var t = node.textContent.trim();
                        // Skip blank, all-digit/symbol strings
                        if (!t || t.length < 2 || /^[\d\W\s]+$/.test(t)) return NodeFilter.FILTER_SKIP;
                        return NodeFilter.FILTER_ACCEPT;
                    }
                });
                var n;
                while ((n = walker.nextNode())) list.push(n);
                return list;
            }

            // Single translate.googleapis.com fetch — unofficial endpoint, no key needed
            async function _gtFetch(text, lang) {
                var res = await fetch(
                    'https://translate.googleapis.com/translate_a/single'
                    + '?client=gtx&sl=en&tl=' + encodeURIComponent(lang)
                    + '&dt=t&q=' + encodeURIComponent(text)
                );
                if (!res.ok) throw new Error(res.status);
                var data = await res.json();
                // Response: [[["translatedChunk","original",...], ...], null, "en"]
                return data[0].map(function(c) { return c[0]; }).join('');
            }

            // Translate all page text to `lang`, with sessionStorage caching
            async function _translatePage(lang) {
                var cacheKey = _SS_PFX + lang + '_' + location.pathname;
                var map = null;
                try { var r = sessionStorage.getItem(cacheKey); if (r) map = JSON.parse(r); } catch(e) {}

                var nodes = _textNodes();

                if (!map) {
                    // Deduplicate texts
                    var unique = [], seen = Object.create(null);
                    nodes.forEach(function(n) {
                        var t = n.textContent.trim();
                        if (t && !seen[t]) { seen[t] = true; unique.push(t); }
                    });

                    // Chunk into ≤1200-char newline-joined batches to minimise API calls
                    var chunks = [], cur = [], curLen = 0;
                    unique.forEach(function(t) {
                        if (curLen + t.length + 1 > 1200) {
                            chunks.push(cur); cur = [t]; curLen = t.length;
                        } else {
                            cur.push(t); curLen += t.length + 1;
                        }
                    });
                    if (cur.length) chunks.push(cur);

                    map = Object.create(null);
                    for (var i = 0; i < chunks.length; i++) {
                        try {
                            var out = await _gtFetch(chunks[i].join('\n'), lang);
                            out.split('\n').forEach(function(translated, j) {
                                if (chunks[i][j]) map[chunks[i][j]] = translated || chunks[i][j];
                            });
                        } catch(e) {
                            chunks[i].forEach(function(t) { map[t] = t; });
                        }
                    }
                    try { sessionStorage.setItem(cacheKey, JSON.stringify(map)); } catch(e) {}
                }

                // Apply to text nodes
                nodes.forEach(function(node) {
                    var orig = node.textContent.trim();
                    if (map[orig] && map[orig] !== orig) {
                        node.textContent = node.textContent.replace(orig, map[orig]);
                    }
                });

                // Also translate form helper attributes
                document.querySelectorAll('[placeholder],[aria-label]').forEach(function(el) {
                    if (el.closest('.notranslate,[translate="no"]')) return;
                    ['placeholder', 'aria-label'].forEach(function(attr) {
                        var v = el.getAttribute(attr);
                        if (v && map[v]) el.setAttribute(attr, map[v]);
                    });
                });
            }

            // ── langSwitcher component ───────────────────────────────────────
            Alpine.data('langSwitcher', () => {
                var savedCode = _getSaved();
                return {
                    open: false,
                    loading: false,
                    languages: _LANGS,
                    current: _LANGS.find(function(l) { return l.code === savedCode; }) || _LANGS[0],
                    init() {
                        if (this.current.dir === 'rtl') {
                            document.documentElement.setAttribute('dir', 'rtl');
                            document.documentElement.setAttribute('lang', this.current.code);
                        }
                        // Only the first instance (desktop or mobile) triggers translation
                        if (this.current.code !== 'en' && !_initDone) {
                            _initDone = true;
                            var self = this;
                            self.loading = true;
                            _translatePage(this.current.code)
                                .then(function()  { self.loading = false; })
                                .catch(function() { self.loading = false; });
                        }
                    },
                    toggle() { this.open = !this.open; },
                    close()  { this.open = false; },
                    select(lang) {
                        if (lang.code === this.current.code) { this.open = false; return; }
                        this.open = false;
                        _setSaved(lang.code);
                        // Reload so we always translate from fresh English source
                        location.reload();
                    }
                };
            });

            // ── testimonials ───────────────────────────────────────────────────
            Alpine.data('testimonials', () => ({
                active: 0,
                quotes: [
                    { text: 'Before HandleLife, I had three apps and still forgot everything. Now I just open one screen and my whole day makes sense.', name: 'Amara K.', location: 'Lagos, Nigeria', initial: 'A' },
                    { text: 'I manage my mother\'s health, my children\'s school, and my own work. HandleLife OS is the first thing that actually understands how much I carry.', name: 'Priya S.', location: 'Mumbai, India', initial: 'P' },
                    { text: 'Finally, something that treats my time and privacy as sacred. This is what technology should have always felt like.', name: 'Carlos R.', location: 'S\u00e3o Paulo, Brazil', initial: 'C' },
                    { text: 'I run three freelance clients and a side hustle. HandleLife keeps my finances honest and my weeks from completely imploding.', name: 'Reggie T.', location: 'Atlanta, USA', initial: 'R' },
                    { text: 'I live across four countries \u2014 currencies, time zones, visa deadlines. HandleLife handles the admin so I can actually focus on the work.', name: 'Saskia V.', location: 'Amsterdam \u2192 Bali', initial: 'S' },
                ],
                init() {
                    setInterval(() => this.next(), 7000);
                },
                next() { this.active = (this.active + 1) % this.quotes.length; },
                setActive(i) { this.active = i; }
            }));

            // ── accordion ───────────────────────────────────────────────────
            Alpine.data('accordion', (initialState = false) => ({
                open: initialState,
                toggle() { this.open = !this.open; }
            }));

            // ── cookieNotice ─────────────────────────────────────────────────
            Alpine.data('cookieNotice', () => ({
                accepted: false,
                init() {
                    try { this.accepted = localStorage.getItem('hl_cookie') === '1'; } catch(e) {}
                },
                accept() {
                    try { localStorage.setItem('hl_cookie', '1'); } catch(e) {}
                    this.accepted = true;
                }
            }));

            // ── useCaseCarousel ─────────────────────────────────────────────
            Alpine.data('useCaseCarousel', (total) => ({
                active: 0,
                total: total,
                _t: null,
                init() {
                    this._t = setInterval(() => this.next(), 4500);
                },
                next() { this.active = (this.active + 1) % this.total; },
                setActive(i) { this.active = i; }
            }));

            // ── stickyCTA ───────────────────────────────────────────────────
            Alpine.data('stickyCTA', () => ({
                show: false,
                init() {
                    window.addEventListener('scroll', () => {
                        this.show = window.scrollY > 500;
                    }, { passive: true });
                }
            }));

            // ── navbar ──────────────────────────────────────────────────────
            Alpine.data('navbar', () => ({
                open: false,
                visible: true,
                _lastY: 0,
                _scrolled: 0,
                _raf: null,
                init() {
                    this._lastY = window.scrollY;
                    window.addEventListener('scroll', () => {
                        // Throttle via rAF so we run at most once per paint frame
                        if (this._raf) return;
                        this._raf = requestAnimationFrame(() => {
                            this._raf = null;
                            this.onScroll();
                        });
                    }, { passive: true });
                },
                onScroll() {
                    if (this.open) return;                      // never hide while mobile menu is open
                    const y    = window.scrollY;
                    const diff = y - this._lastY;              // positive = scrolling down
                    this._lastY = y;

                    if (y < 80) {
                        // Always show near the top of the page
                        this.visible = true;
                        this._scrolled = 0;
                        return;
                    }

                    if (diff > 0) {
                        // Scrolling down — accumulate distance before hiding
                        this._scrolled += diff;
                        if (this._scrolled > 80) this.visible = false;
                    } else {
                        // Scrolling up — show immediately, reset accumulator
                        this._scrolled = 0;
                        this.visible = true;
                    }
                },
                toggle() { this.open = !this.open; },
                close() { this.open = false; },
                get navClasses() {
                    return {
                        'translate-y-0':     this.visible || this.open,
                        '-translate-y-full': !this.visible && !this.open
                    };
                }
            }));
        });

    </script>

    <!-- Vite assets -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Alpine.js CSP-safe build (no eval — must load AFTER the alpine:init listener above) -->
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.x.x/dist/cdn.min.js"></script>
    <!-- Alpine Collapse plugin for smooth accordion animations -->
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>

    <style>
        /* Language dropdown thin scrollbar */
        .lang-dropdown::-webkit-scrollbar       { width: 4px; }
        .lang-dropdown::-webkit-scrollbar-track { background: transparent; }
        .lang-dropdown::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }

        /* Hero entry animations — CSS-only, no JS required */
        @keyframes heroIn {
            from { opacity: 0; transform: translateY(1rem); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .animate-hero-in {
            animation: heroIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-hero-in-delay {
            animation: heroIn 0.7s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
    </style>

    @stack('head')
</head>
<body class="font-sans text-slate-900 bg-white antialiased">

    {{-- Skip-to-content link for keyboard / screen-reader users (WCAG 2.1 AA) --}}
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-slate-950 focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold focus:text-sm">
        Skip to main content
    </a>

    <x-navbar />

    <main id="main-content" role="main" tabindex="-1">
        {{ $slot }}
    </main>

    <x-footer />

    <!-- Sticky mobile CTA — appears after 500px scroll (CSP-safe) -->
    <div
        x-data="stickyCTA"
        x-show="show"
        x-cloak
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0 translate-y-4"
        x-transition:enter-end="opacity-100 translate-y-0"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 translate-y-0"
        x-transition:leave-end="opacity-0 translate-y-4"
        class="fixed bottom-6 left-4 right-4 z-40 md:hidden pointer-events-none"
        aria-hidden="true">
        <div class="max-w-sm mx-auto pointer-events-auto">
            <a href="/waitlist"
               class="flex items-center justify-between bg-slate-950 text-white pl-5 pr-2 py-2 rounded-full shadow-premium-lg border border-white/10 active:scale-95 transition-transform duration-150"
               aria-label="Join the waitlist">
                <span class="text-xs font-bold tracking-wide notranslate">Get early access</span>
                <span class="ml-3 flex items-center justify-center w-9 h-9 bg-teal-500 rounded-full text-white flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </span>
            </a>
        </div>
    </div>

    @stack('scripts')

    {{-- ── Cookie notice (essential cookies only — no consent gate needed) ── --}}
    <div x-data="cookieNotice"
         x-show="!accepted"
         x-cloak
         x-transition:enter="transition ease-out duration-500 delay-1000"
         x-transition:enter-start="opacity-0 translate-y-4"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 translate-y-4"
         class="fixed bottom-0 inset-x-0 z-[9999] p-4 pointer-events-none"
         role="region"
         aria-label="Cookie notice">
        <div class="max-w-3xl mx-auto bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center gap-4 shadow-2xl pointer-events-auto">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-7 h-7 bg-teal-500/15 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-400" aria-hidden="true">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <p class="text-slate-300 text-sm leading-snug">
                    We use essential cookies only — no ads, no tracking, no profiling.
                    <a href="/privacy#cookies" class="text-teal-400 font-semibold hover:text-teal-300 underline-offset-2 hover:underline ml-1">Cookie policy</a>
                </p>
            </div>
            <button @click="accept()"
                    class="flex-shrink-0 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-xl transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    aria-label="Accept cookie notice">
                Got it
            </button>
        </div>
    </div>

</body>
</html>
