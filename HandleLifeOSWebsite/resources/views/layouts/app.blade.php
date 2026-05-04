<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <meta name="theme-color" content="#0f172a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- i18n: hreflang alternate links for international SEO -->
    <link rel="alternate" hreflang="x-default" href="{{ url('/') }}">
    <link rel="alternate" hreflang="en"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="es"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="fr"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="de"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="pt"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="it"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="nl"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="ru"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="zh"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="ja"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="ko"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="hi"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="ar"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="tr"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="pl"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="sv"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="id"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="vi"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="uk"    href="{{ url('/') }}">
    <link rel="alternate" hreflang="ms"    href="{{ url('/') }}">

    <x-seo :title="$title ?? null" :description="$description ?? null" />

    <!-- Fonts (with font-display swap for performance) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet"></noscript>

    <!-- langSwitcher must be defined before Alpine.js initialises -->
    <script>
        document.addEventListener('alpine:init', () => {
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
                        return languages.find(function(l){ return l.code === c; }) || languages[0];
                    }
                    return languages[0];
                }

                return {
                    open: false,
                    languages: languages,
                    current: getActive(),
                    init: function() {
                        if (this.current.dir === 'rtl') {
                            document.documentElement.setAttribute('dir', 'rtl');
                            document.documentElement.setAttribute('lang', this.current.code);
                        }
                    },
                    toggle() { this.open = !this.open },
                    select: function(lang) {
                        if (lang.code === this.current.code) { this.open = false; return; }
                        this.open = false;
                        var h = location.hostname;
                        var gone = '; path=/; expires=' + new Date(0).toUTCString();
                        if (lang.code === 'en') {
                            document.cookie = 'googtrans=' + gone;
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
        });

        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'ar,zh-CN,nl,en,fr,de,hi,it,ja,ko,ms,pl,pt,ru,es,sv,tr,uk,vi,id',
                autoDisplay: false
            }, 'google_translate_element');
        }

        document.addEventListener('alpine:init', () => {
            Alpine.data('accordion', (initialState = false) => ({
                open: initialState,
                toggle() { this.open = !this.open }
            }));

            Alpine.data('stickyCTA', () => ({
                show: false,
                init() {
                    window.addEventListener('scroll', () => {
                        this.show = window.scrollY > 500
                    }, { passive: true })
                }
            }));
        })
    </script>

    <!-- Styles & Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Alpine.js Plugins -->
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>
    
    <!-- Alpine.js (after langSwitcher definition, deferred) -->
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.x.x/dist/cdn.min.js"></script>

    <!-- Google Translate widget (hidden — we use our own UI trigger) -->
    <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>

    <style>
        [x-cloak] { display: none !important; }

        /* Glassmorphism */
        .glass      { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .dark-glass { background: rgba(2,6,23,0.8);      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

        /* ── Suppress Google Translate default toolbar ── */
        .goog-te-banner-frame,
        .goog-te-gadget,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none !important; }
        .skiptranslate              { display: none !important; }
        body                        { top: 0 !important; }

        /* Language dropdown scrollbar */
        .lang-dropdown::-webkit-scrollbar       { width: 4px; }
        .lang-dropdown::-webkit-scrollbar-track { background: transparent; }
        .lang-dropdown::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }
    </style>
</head>
<body class="font-sans text-slate-900 bg-slate-50 antialiased selection:bg-teal-500/30">

    <!-- Hidden Google Translate element — our custom UI controls it via cookie -->
    <div id="google_translate_element" style="display:none" aria-hidden="true"></div>

    <div class="min-h-screen flex flex-col">
        <x-navbar />

        <main class="flex-grow" role="main">
            {{ $slot }}
        </main>

        <x-footer />
    </div>

    <!-- Sticky Mobile CTA (appears after 500 px scroll) -->
    <div
        x-data="stickyCTA"
        x-show="show"
        x-cloak
        x-transition:enter="transition ease-out duration-500"
        x-transition:enter-start="opacity-0 translate-y-10"
        x-transition:enter-end="opacity-100 translate-y-0"
        x-transition:leave="transition ease-in duration-300"
        x-transition:leave-start="opacity-100 translate-y-0"
        x-transition:leave-end="opacity-0 translate-y-10"
        class="fixed bottom-8 left-0 right-0 z-50 px-6 md:hidden pointer-events-none"
        aria-hidden="true">
        <div class="max-w-md mx-auto pointer-events-auto">
            <a href="/waitlist"
               class="flex items-center justify-between bg-slate-950 text-white p-2 pl-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 group active:scale-95 transition-transform duration-200">
                <span class="text-xs font-black uppercase tracking-widest notranslate">Join Waitlist</span>
                <div class="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </div>
            </a>
        </div>
    </div>

</body>
</html>
