<x-app-layout>
    <x-slot name="title">{{ $title }}</x-slot>

    {{-- Hero --}}
    <section class="bg-slate-950 text-white pt-[76px] pb-24 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-teal-500/5 pointer-events-none" aria-hidden="true"></div>
        <div class="section-container pt-16 relative z-10">
            <x-breadcrumbs :items="[['name' => 'Protection', 'url' => route('security')]]" />
            <div class="max-w-3xl mt-6">
                <div class="badge bg-emerald-500/10 border-emerald-500/20 text-emerald-400 mb-6">
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow" aria-hidden="true"></span>
                    Privacy built in
                </div>
                <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight leading-[1.02] mb-6">
                    Built to help,<br>
                    <span class="text-slate-600">not to watch.</span>
                </h1>
                <p class="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                    HandleLife OS operates on a zero-knowledge architecture. We don't just protect your data — we design our systems so we never have to see it in the first place.
                </p>
            </div>
        </div>
    </section>

    {{-- Data philosophy --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div>
                <p class="eyebrow mb-5">Our data philosophy</p>
                <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 mb-10 leading-tight">
                    Designed for people,<br>not profiles.
                </h2>
                <div class="space-y-8">
                    @foreach([
                        ['icon' => '📜', 'title' => 'Ownership', 'text' => 'Your life history, routines, and records belong to you — not to us. Technology should protect you, never profit from you.'],
                        ['icon' => '🚫', 'title' => 'Neutrality',   'text' => 'We will never sell your data, habits, or patterns to advertisers. Your daily existence is not a product.'],
                        ['icon' => '🔑', 'title' => 'Portability',  'text' => 'Export your entire record or delete your account instantly. No dark patterns. No barriers to leaving.'],
                    ] as $item)
                        <div class="flex items-start gap-5 group">
                            <div class="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200" aria-hidden="true">{{ $item['icon'] }}</div>
                            <div>
                                <h3 class="text-base font-bold text-slate-950 mb-2">{{ $item['title'] }}</h3>
                                <p class="text-slate-500 text-sm leading-relaxed font-medium">{{ $item['text'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-3xl p-10 shadow-card relative overflow-hidden" aria-hidden="true">
                <div class="space-y-4">
                    <div class="flex items-center gap-2 mb-6">
                        <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse-slow"></span>
                        <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Shield Active</span>
                    </div>
                    <div class="h-3 w-1/2 bg-slate-200 rounded-full"></div>
                    <div class="h-3 w-3/4 bg-slate-200 rounded-full"></div>
                    <div class="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-card my-6">
                        <div class="text-5xl mb-4">🔒</div>
                        <div class="font-bold text-slate-950 text-sm uppercase tracking-wide">End-to-end encrypted</div>
                        <div class="text-slate-400 text-xs mt-1 font-medium">AES-256 · Zero-knowledge</div>
                    </div>
                    <div class="h-3 w-2/3 bg-slate-200 rounded-full"></div>
                    <div class="h-3 w-[90%] bg-slate-200 rounded-full"></div>
                </div>
            </div>
        </div>
    </x-section>

    {{-- Standards --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-20 md:py-24">
        <div class="text-center mb-14">
            <p class="eyebrow mb-4">Industry standards</p>
            <h2 class="text-3xl md:text-4xl font-black font-heading text-slate-950">Global security standards.</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            @foreach([
                ['icon' => '🏗️', 'title' => 'SOC 2 Type II',   'sub' => 'Certified readiness'],
                ['icon' => '🌍', 'title' => 'GDPR & CCPA',      'sub' => 'Full compliance'],
                ['icon' => '🔐', 'title' => 'AES-256 Bit',      'sub' => 'Encrypted endpoints'],
            ] as $s)
                <div class="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-300 group">
                    <div class="text-3xl mb-5 grayscale group-hover:grayscale-0 transition-all duration-300" aria-hidden="true">{{ $s['icon'] }}</div>
                    <div class="font-bold text-slate-950 text-sm uppercase tracking-wider">{{ $s['title'] }}</div>
                    <div class="text-slate-400 text-xs mt-2 font-medium">{{ $s['sub'] }}</div>
                </div>
            @endforeach
        </div>
    </x-section>

    {{-- CTA --}}
    <x-section bg="bg-emerald-600 text-white" padding="py-24 md:py-28">
        <div class="text-center">
            <h2 class="text-4xl md:text-5xl font-black font-heading mb-5 leading-tight">Trust is a choice.<br>Choose every day.</h2>
            <p class="text-xl font-medium text-emerald-100 mb-10 max-w-md mx-auto">"Protection isn't a feature. It's our philosophy."</p>
            <x-button href="/waitlist" size="xl" variant="solid" ariaLabel="Join early access">Join early access</x-button>
        </div>
    </x-section>

</x-app-layout>
