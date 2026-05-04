@props(['title' => null, 'description' => null])

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

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">

    {{-- DNS prefetch / preconnect for third-party origins --}}
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="//translate.google.com">
    <link rel="dns-prefetch" href="//translate.googleapis.com">

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

    <!-- SEO, OG, Twitter, Schema -->
    <x-seo :title="$title ?? null" :description="$description ?? null" />

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
        document.addEventListener('alpine:init', () => {
            // ── langSwitcher ────────────────────────────────────────────────
            Alpine.data('langSwitcher', () => {
                var languages = [
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
                function getActive() {
                    var m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
                    if (m && m[1] && m[1] !== 'en') {
                        var c = decodeURIComponent(m[1]);
                        return languages.find(function(l) { return l.code === c; }) || languages[0];
                    }
                    return languages[0];
                }
                return {
                    open: false,
                    languages: languages,
                    current: getActive(),
                    init() {
                        if (this.current.dir === 'rtl') {
                            document.documentElement.setAttribute('dir', 'rtl');
                            document.documentElement.setAttribute('lang', this.current.code);
                        }
                    },
                    toggle() { this.open = !this.open; },
                    close() { this.open = false; },
                    select(lang) {
                        if (lang.code === this.current.code) { this.open = false; return; }
                        this.open = false;
                        var h = location.hostname;
                        if (lang.code === 'en') {
                            document.cookie = 'googtrans=; path=/; expires=' + new Date(0).toUTCString();
                            document.cookie = 'googtrans=; path=/; domain=.' + h + '; expires=' + new Date(0).toUTCString();
                        } else {
                            var v = '/en/' + lang.code;
                            document.cookie = 'googtrans=' + v + '; path=/';
                            document.cookie = 'googtrans=' + v + '; path=/; domain=.' + h;
                        }
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
                _t: null,
                init() {
                    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
                },
                onScroll() {
                    if (!this.open && window.scrollY > 80) this.visible = false;
                    clearTimeout(this._t);
                    this._t = setTimeout(() => { this.visible = true; }, 100);
                },
                toggle() { this.open = !this.open; },
                close() { this.open = false; },
                get navClasses() {
                    return {
                        'translate-y-0':  this.visible || this.open,
                        '-translate-y-full': !this.visible && !this.open
                    };
                }
            }));
        });

        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'ar,zh-CN,nl,en,fr,de,hi,it,ja,ko,ms,pl,pt,ru,es,sv,tr,uk,vi,id',
                autoDisplay: false
            }, 'google_translate_element');
        }
    </script>

    <!-- Vite assets -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Alpine.js CSP-safe build (no eval — must load AFTER the alpine:init listener above) -->
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.x.x/dist/cdn.min.js"></script>
    <!-- Alpine Collapse plugin for smooth accordion animations -->
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>

    <!-- Google Translate widget (hidden — our UI drives it via cookie) -->
    <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>

    <style>
        /* ── Suppress Google Translate default toolbar ── */
        .goog-te-banner-frame,
        .goog-te-gadget,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none !important; }
        .skiptranslate              { display: none !important; }
        body                        { top: 0 !important; }

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

    {{-- Hidden Google Translate element — our custom UI controls it via cookie --}}
    <div id="google_translate_element" style="display:none" aria-hidden="true"></div>

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

</body>
</html>
