<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    {{-- ── HERO ──────────────────────────────────────────────────────── --}}
    <section class="relative bg-slate-950 text-white overflow-hidden min-h-[100svh] flex items-center pt-[76px]">

        {{-- Background glows --}}
        <div class="absolute top-0 right-0 w-[700px] h-[700px] bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>

        <div class="section-container w-full py-16 lg:py-24">
            <div class="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

                {{-- Left: Copy --}}
                <div class="animate-hero-in relative z-10">

                    <div class="badge bg-teal-500/10 border-teal-500/20 text-teal-400 mb-8">
                        <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse-slow" aria-hidden="true"></span>
                        Introducing HandleLife OS v1.0
                    </div>

                    <h1 class="text-5xl sm:text-6xl md:text-7xl font-black font-heading leading-[1.02] tracking-tight mb-6">
                        AI that helps you<br>
                        <span class="text-gradient-light">handle everyday</span><br>
                        life.
                    </h1>

                    <p class="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
                        Less stress. Better decisions. More control over the things that actually matter.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-3 mb-12">
                        <x-button href="/waitlist" size="xl" variant="teal" ariaLabel="Get early access to HandleLife OS">
                            Get early access
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                            </svg>
                        </x-button>
                        <x-button href="/features" size="xl" variant="ghost" class="text-slate-300 hover:text-white hover:bg-white/8" ariaLabel="See how HandleLife OS works">
                            See how it works
                        </x-button>
                    </div>

                    {{-- Rotating use-case ticker --}}
                    <x-use-case-carousel />
                </div>

                {{-- Right: UI Mockup --}}
                <div class="hidden lg:block animate-hero-in-delay relative">

                    {{-- Glow behind card --}}
                    <div class="absolute -inset-6 bg-teal-500/10 rounded-[3rem] blur-3xl" aria-hidden="true"></div>

                    <div class="relative bg-slate-900/80 border border-white/8 rounded-3xl p-6 shadow-premium-lg ring-inset-white">

                        {{-- App header --}}
                        <div class="flex items-center justify-between mb-5 pb-4 border-b border-white/8">
                            <div class="flex items-center gap-2.5">
                                <div class="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                                    <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                </div>
                                <span class="text-white text-sm font-semibold">Today's Focus</span>
                            </div>
                            <span class="text-slate-500 text-xs" aria-label="Current day">Thursday</span>
                        </div>

                        {{-- Task list --}}
                        <div class="space-y-2.5 mb-4">
                            <div class="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                                <div class="w-5 h-5 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                    <svg class="w-3 h-3 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                </div>
                                <span class="text-white/50 text-sm line-through">Review phone plan</span>
                                <span class="ml-auto text-teal-400 text-xs font-semibold">Saved $34</span>
                            </div>

                            <div class="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-teal-500/15">
                                <div class="w-5 h-5 rounded-lg border border-white/20 flex-shrink-0" aria-hidden="true"></div>
                                <span class="text-white text-sm font-medium">Pay electricity bill</span>
                                <span class="ml-auto text-xs text-slate-400">Due today</span>
                            </div>

                            <div class="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                                <div class="w-5 h-5 rounded-lg border border-white/20 flex-shrink-0" aria-hidden="true"></div>
                                <span class="text-white text-sm font-medium">Book dentist appointment</span>
                                <span class="ml-auto text-xs text-slate-500">Friday</span>
                            </div>
                        </div>

                        {{-- Shield alert --}}
                        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
                            <div class="w-8 h-8 bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-300" aria-hidden="true">
                                <x-icon name="shield" :size="16" :stroke="1.75" />
                            </div>
                            <div class="min-w-0">
                                <div class="text-white text-xs font-semibold">Scam detected &amp; blocked</div>
                                <div class="text-slate-400 text-xs truncate">Phishing link in SMS — flagged safe</div>
                            </div>
                            <span class="ml-auto text-emerald-400 text-xs font-bold flex-shrink-0">Safe</span>
                        </div>

                        {{-- Money insight --}}
                        <div class="bg-white/4 rounded-2xl px-4 py-3 border border-white/6">
                            <div class="flex items-center justify-between mb-2.5">
                                <span class="text-slate-400 text-xs font-medium">Monthly clarity</span>
                                <span class="text-emerald-400 text-sm font-bold">+$127 saved</span>
                            </div>
                            <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full w-[68%] transition-all duration-1000"></div>
                            </div>
                        </div>

                        {{-- Bottom label --}}
                        <div class="mt-4 flex items-center justify-between">
                            <span class="text-slate-600 text-xs">3 of 5 tasks done</span>
                            <div class="flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full" aria-hidden="true"></span>
                                <span class="text-slate-500 text-xs">All systems clear</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Scroll indicator --}}
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden md:block" aria-hidden="true">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7-7-7"/>
            </svg>
        </div>
    </section>

    {{-- ── TRUST STRIP ───────────────────────────────────────────────── --}}
    <div class="bg-white border-y border-slate-100 py-5 overflow-hidden" aria-label="Trust indicators">
        <div class="section-container">
            <div class="flex flex-wrap justify-center md:justify-between items-center gap-x-10 gap-y-4">
                @foreach([
                    'Privacy First',
                    'Zero-Knowledge Architecture',
                    'Available Worldwide',
                    'Non-Judgmental AI',
                    'AES-256 Encrypted',
                    '20 Languages',
                ] as $trust)
                    <div class="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity duration-300">
                        <span class="w-1 h-1 bg-teal-500 rounded-full" aria-hidden="true"></span>
                        <span class="text-xs font-semibold uppercase tracking-widest text-slate-600">{{ $trust }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    {{-- ── PROBLEM ───────────────────────────────────────────────────── --}}
    <x-section bg="bg-slate-50" padding="py-24 md:py-32">
        <div class="max-w-3xl mx-auto text-center mb-16">
            <p class="eyebrow mb-4">Why HandleLife exists</p>
            <h2 class="section-heading text-slate-950 mb-6">Life gets messy.<br>That's not your fault.</h2>
            <p class="section-subheading max-w-xl mx-auto">
                Too much to decide. Too much to remember. Too much to manage — alone.
            </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <x-feature-card theme="light" iconName="sparkles"
                title="Decision fatigue"
                description="From the moment you wake up, your mind is already running — deciding, remembering, managing — before the day even begins." />
            <x-feature-card theme="light" iconName="cloud"
                title="Invisible workload"
                description="The mental load of keeping everything together is real — and rarely shared equally." />
            <x-feature-card theme="light" iconName="credit-card"
                title="Money stress"
                description="Most people don't know exactly where their money goes until it's too late." />
            <x-feature-card theme="light" iconName="shield"
                title="Digital threats"
                description="Scams, phishing, and predatory contracts target people at their most vulnerable moments." />
        </div>
    </x-section>

    {{-- ── SOLUTION (BENTO) ─────────────────────────────────────────── --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="text-center mb-16">
            <p class="eyebrow mb-4">One intelligent OS</p>
            <h2 class="section-heading text-slate-950 mb-6">Everything you need<br>to handle real life.</h2>
            <p class="section-subheading max-w-lg mx-auto">
                Not another app. A foundational layer for how you live, plan, protect, and decide.
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-5">
            {{-- Large card --}}
            <div class="md:col-span-2 bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden group shadow-premium-lg ring-inset-white">
                <div class="absolute inset-0 bg-gradient-to-br from-teal-500/15 to-transparent pointer-events-none" aria-hidden="true"></div>
                <p class="eyebrow text-teal-400 mb-4">Daily OS</p>
                <h3 class="text-2xl md:text-3xl font-bold font-heading mb-3 relative z-10">Plan your day.<br>Actually follow through.</h3>
                <p class="text-slate-400 text-sm leading-relaxed max-w-md relative z-10">Smart sequencing that learns your life and shows you the 3 things that matter most today — nothing more.</p>
                <div class="mt-8 relative z-10 flex gap-3">
                    <div class="flex-1 bg-white/6 border border-white/8 rounded-2xl p-4">
                        <div class="text-xs text-slate-400 mb-2">Today's priority</div>
                        <div class="text-white text-sm font-semibold">Pay electricity bill</div>
                        <div class="mt-2 text-xs text-teal-400">Due today · 2 min</div>
                    </div>
                    <div class="flex-1 bg-white/4 border border-white/6 rounded-2xl p-4 opacity-60">
                        <div class="text-xs text-slate-500 mb-2">Next up</div>
                        <div class="text-white/70 text-sm">Book dentist</div>
                    </div>
                </div>
            </div>

            {{-- Shield OS --}}
            <div class="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 group hover:shadow-card-hover transition-all duration-300">
                <p class="eyebrow text-emerald-700 mb-4">Shield OS</p>
                <h3 class="text-xl font-bold font-heading text-slate-950 mb-3">Stay protected.<br>Every single day.</h3>
                <p class="text-slate-500 text-sm leading-relaxed">Scam detection, contract analysis, and real-time alerts — all private, all zero-knowledge.</p>
                <div class="mt-6 flex items-center justify-between">
                    <div class="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-200 rounded-xl">
                        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full" aria-hidden="true"></span>
                        <span class="text-xs font-semibold text-emerald-700">Shield active</span>
                    </div>
                    <a href="/security" class="text-xs font-semibold text-emerald-700 hover:text-emerald-600 transition-colors">How it works →</a>
                </div>
            </div>

            {{-- Money OS --}}
            <div class="bg-slate-50 border border-slate-100 rounded-3xl p-8 group hover:shadow-card-hover transition-all duration-300">
                <p class="eyebrow text-slate-500 mb-4">Financial OS</p>
                <h3 class="text-xl font-bold font-heading text-slate-950 mb-3">Understand your money.</h3>
                <p class="text-slate-500 text-sm leading-relaxed">Subscriptions you forgot, budgets you overspend, and waste you never noticed — all surfaced calmly.</p>
                <div class="mt-6">
                    <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-slate-500">Monthly savings</span>
                        <span class="text-emerald-600 font-semibold">+$127</span>
                    </div>
                    <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full w-[68%]"></div>
                    </div>
                </div>
            </div>

            {{-- Family OS --}}
            <div class="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 group hover:shadow-card-hover transition-all duration-300 shadow-card">
                <p class="eyebrow mb-4">Family OS</p>
                <h3 class="text-xl font-bold font-heading text-slate-950 mb-3">End the mental load.<br>Start living.</h3>
                <p class="text-slate-500 text-sm leading-relaxed max-w-md">Shared household coordination, elder care, and family sync — so one person isn't carrying everything alone.</p>
                <a href="/families" class="inline-flex items-center gap-1.5 mt-6 text-teal-600 text-sm font-semibold hover:text-teal-500 transition-colors">
                    Learn about Family OS
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
            </div>
        </div>
    </x-section>

    {{-- ── WHO IT'S FOR ─────────────────────────────────────────────── --}}
    <x-section bg="bg-slate-950" padding="py-24 md:py-32">
        <div class="text-center mb-16">
            <p class="eyebrow text-teal-400 mb-4">Real people, real life</p>
            <h2 class="section-heading text-white mb-6">Life doesn't fit a mold.</h2>
            <p class="section-subheading text-slate-400 max-w-lg mx-auto">
                HandleLife OS adapts to whoever you are and whatever your day actually looks like.
            </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {{-- The Exhausted Parent --}}
            <div class="bg-white/5 border border-white/8 rounded-3xl p-7 hover:bg-white/8 hover:border-teal-500/25 transition-all duration-300 group">
                <div class="w-12 h-12 bg-teal-500/15 rounded-2xl flex items-center justify-center mb-5 text-teal-300 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
                    <x-icon name="users-family" :size="22" :stroke="1.5" />
                </div>
                <h3 class="text-lg font-bold text-white mb-2">The Exhausted Parent</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-5">Works full-time, raises kids, cares for an ageing parent. Every week is a negotiation with time and energy.</p>
                <div class="flex flex-wrap gap-2">
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Family OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Daily OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Financial OS</span>
                </div>
            </div>

            {{-- The Freelancer --}}
            <div class="bg-white/5 border border-white/8 rounded-3xl p-7 hover:bg-white/8 hover:border-teal-500/25 transition-all duration-300 group">
                <div class="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center mb-5 text-emerald-300 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
                    <x-icon name="briefcase" :size="22" :stroke="1.5" />
                </div>
                <h3 class="text-lg font-bold text-white mb-2">The Freelancer</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-5">Multiple clients, no HR, no safety net. Income that spikes and dips — and admin that never stops piling up.</p>
                <div class="flex flex-wrap gap-2">
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Financial OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Daily OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Shield OS</span>
                </div>
            </div>

            {{-- The Digital Nomad --}}
            <div class="bg-white/5 border border-white/8 rounded-3xl p-7 hover:bg-white/8 hover:border-teal-500/25 transition-all duration-300 group">
                <div class="w-12 h-12 bg-violet-500/15 rounded-2xl flex items-center justify-center mb-5 text-violet-300 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
                    <x-icon name="globe" :size="22" :stroke="1.5" />
                </div>
                <h3 class="text-lg font-bold text-white mb-2">The Digital Nomad</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-5">Laptop, four countries, zero fixed office. Currencies, tax residencies, and time zones shift every few months.</p>
                <div class="flex flex-wrap gap-2">
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Financial OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">20 Languages</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Daily OS</span>
                </div>
            </div>

            {{-- The Neurodivergent Professional --}}
            <div class="bg-white/5 border border-white/8 rounded-3xl p-7 hover:bg-white/8 hover:border-teal-500/25 transition-all duration-300 group">
                <div class="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center mb-5 text-amber-300 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
                    <x-icon name="sparkles" :size="22" :stroke="1.5" />
                </div>
                <h3 class="text-lg font-bold text-white mb-2">The Neurodivergent Professional</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-5">Brilliant at deep work. Challenged by admin, transitions, and anything that requires sustained executive function.</p>
                <div class="flex flex-wrap gap-2">
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Daily OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Focus Mode</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">AI Coach</span>
                </div>
            </div>

            {{-- The Independently Ageing Adult --}}
            <div class="bg-white/5 border border-white/8 rounded-3xl p-7 hover:bg-white/8 hover:border-teal-500/25 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                <div class="w-12 h-12 bg-rose-500/15 rounded-2xl flex items-center justify-center mb-5 text-rose-300 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
                    <x-icon name="user-elder" :size="22" :stroke="1.5" />
                </div>
                <h3 class="text-lg font-bold text-white mb-2">The Independently Ageing Adult</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-5">Capable and independent — and increasingly targeted by scammers who know exactly how to exploit trust and urgency.</p>
                <div class="flex flex-wrap gap-2">
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Shield OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Family OS</span>
                    <span class="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold rounded-lg">Smart Alerts</span>
                </div>
            </div>

        </div>
    </x-section>

    {{-- ── SOCIAL PROOF ─────────────────────────────────────────────── --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-20 md:py-28">
        <div class="max-w-4xl mx-auto" x-data="testimonials">
            <div aria-live="polite" aria-atomic="true">
                <template x-for="(q, i) in quotes" :key="i">
                    <div x-show="active === i"
                         x-transition:enter="transition ease-out duration-700"
                         x-transition:enter-start="opacity-0 translate-y-4"
                         x-transition:enter-end="opacity-100 translate-y-0"
                         x-transition:leave="transition ease-in duration-400"
                         x-transition:leave-start="opacity-100 translate-y-0"
                         x-transition:leave-end="opacity-0 -translate-y-4"
                         class="text-center">
                        <blockquote class="text-2xl md:text-3xl font-bold font-heading text-slate-950 leading-snug mb-8 text-balance" x-text="'&ldquo;' + q.text + '&rdquo;'"></blockquote>
                        <div class="flex items-center justify-center gap-3">
                            <div class="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600" aria-hidden="true" x-text="q.initial"></div>
                            <div class="text-left">
                                <div class="text-sm font-semibold text-slate-900" x-text="q.name"></div>
                                <div class="text-xs text-slate-500">Early Access member · <span x-text="q.location"></span></div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <div class="flex justify-center gap-1.5 mt-8" role="group" :aria-label="'Testimonials — ' + (active + 1) + ' of ' + quotes.length">
                <template x-for="(q, i) in quotes" :key="'dot-'+i">
                    <button @click="setActive(i)"
                            :class="active === i ? 'bg-teal-500 w-4' : 'bg-slate-300 w-1.5'"
                            class="h-1.5 rounded-full transition-all duration-300"
                            :aria-label="'Show testimonial ' + (i + 1) + ' from ' + q.name"
                            :aria-pressed="active === i"></button>
                </template>
            </div>
        </div>
    </x-section>

    {{-- ── FINAL CTA ─────────────────────────────────────────────────── --}}
    <section class="bg-slate-950 text-white py-28 md:py-36 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/15 via-transparent to-transparent pointer-events-none" aria-hidden="true"></div>
        <div class="section-container text-center relative z-10">
            <p class="eyebrow text-teal-400 mb-6">Join 50,000+ on the waitlist</p>
            <h2 class="text-4xl md:text-6xl font-black font-heading mb-6 leading-[1.02] tracking-tight">
                Life is complicated.<br>Handle it better.
            </h2>
            <p class="text-lg text-slate-400 font-medium mb-10 max-w-md mx-auto">
                Weekly invites. No spam. Cancel anytime. Your data stays yours — always.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <x-button href="/waitlist" size="xl" variant="teal" ariaLabel="Join the HandleLife OS waitlist">
                    Get early access — it's free
                </x-button>
                <x-button href="/features" size="xl" variant="ghost" class="text-slate-300 hover:text-white hover:bg-white/8">
                    Explore features
                </x-button>
            </div>
            <p class="mt-6 text-xs text-slate-600">
                <a href="/security" class="hover:text-slate-400 transition-colors">Privacy-first</a> ·
                <a href="/security" class="hover:text-slate-400 transition-colors">Zero-knowledge</a> ·
                No credit card required ·
                <a href="/pricing" class="hover:text-slate-400 transition-colors">See pricing</a>
            </p>
        </div>
    </section>

</x-app-layout>
