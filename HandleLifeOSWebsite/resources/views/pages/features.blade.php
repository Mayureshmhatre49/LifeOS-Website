<x-app-layout>
    <x-slot name="title">{{ $title }}</x-slot>

    {{-- Hero --}}
    <section class="bg-slate-950 text-white pt-[76px] pb-24 md:pb-32 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/5 pointer-events-none" aria-hidden="true"></div>
        <div class="section-container pt-16 relative z-10">
            <x-breadcrumbs :items="[['name' => 'Capabilities', 'url' => route('features')]]" />
            <div class="max-w-3xl mt-6">
                <p class="eyebrow text-teal-400 mb-5">The System</p>
                <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight leading-[1.02] mb-7">
                    Built to handle<br>
                    the messy real world.
                </h1>
                <p class="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                    HandleLife OS isn't an app — it's an operating system designed to manage your decisions, money, and routines with calm intelligence.
                </p>
            </div>
        </div>
    </section>

    {{-- Module 1: Daily OS --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div>
                <div class="badge-teal mb-6">
                    <span class="w-1.5 h-1.5 bg-teal-500 rounded-full" aria-hidden="true"></span>
                    Daily OS
                </div>
                <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 mb-6 leading-tight">
                    Know what matters.<br>Do it first.
                </h2>
                <p class="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                    It doesn't just list tasks — it understands context. HandleLife OS anticipates your needs and highlights the most important decisions, helping you move forward with real clarity.
                </p>
                <div class="grid sm:grid-cols-2 gap-4">
                    <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-card-hover transition-all duration-300 group">
                        <div class="text-xl mb-3 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">🌿</div>
                        <h4 class="font-semibold text-slate-950 text-sm mb-2">Non-judgmental helper</h4>
                        <p class="text-xs text-slate-500 leading-relaxed">A calm interface built to reduce mental load, not add to it.</p>
                    </div>
                    <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-card-hover transition-all duration-300 group">
                        <div class="text-xl mb-3 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">📅</div>
                        <h4 class="font-semibold text-slate-950 text-sm mb-2">Smart sequencing</h4>
                        <p class="text-xs text-slate-500 leading-relaxed">Intelligent routines that evolve alongside your life goals.</p>
                    </div>
                </div>
            </div>
            <div class="bg-slate-950 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden group shadow-premium-lg ring-inset-white" aria-hidden="true">
                <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/15 to-transparent"></div>
                <div class="relative z-10 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 group-hover:scale-[1.02] transition-transform duration-500">
                    <div class="h-3 w-1/3 bg-slate-700 rounded-full mb-8"></div>
                    <div class="space-y-4">
                        <div class="h-12 w-full bg-slate-800/60 rounded-xl flex items-center px-4 gap-3">
                            <span class="w-2 h-2 bg-teal-500 rounded-full"></span>
                            <div class="h-2 w-2/3 bg-slate-700 rounded-full"></div>
                            <div class="ml-auto text-xs text-teal-400 font-semibold">Now</div>
                        </div>
                        <div class="h-12 w-full bg-slate-800/40 rounded-xl flex items-center px-4 gap-3">
                            <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                            <div class="h-2 w-1/2 bg-slate-700 rounded-full"></div>
                        </div>
                        <div class="h-12 w-[80%] bg-teal-500/8 border border-teal-500/15 rounded-xl flex items-center px-4 gap-3">
                            <span class="w-2 h-2 bg-emerald-400 rounded-full"></span>
                            <div class="h-2 w-3/4 bg-teal-700/40 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </x-section>

    {{-- Module 2: Financial OS --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-24 md:py-32">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div class="bg-white rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden border border-slate-200 shadow-card group" aria-hidden="true">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/4 to-transparent"></div>
                <div class="relative z-10 w-full bg-white border border-slate-200 shadow-premium rounded-2xl p-8 -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <div class="flex items-center justify-between mb-8">
                        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly clarity</span>
                        <span class="text-emerald-600 text-2xl font-black">4,281</span>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <div class="flex justify-between text-xs mb-1.5">
                                <span class="text-slate-500">Essentials</span><span class="text-slate-700 font-semibold">65%</span>
                            </div>
                            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 rounded-full w-[65%]"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs mb-1.5">
                                <span class="text-slate-500">Subscriptions</span><span class="text-amber-600 font-semibold">25%</span>
                            </div>
                            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-amber-400 rounded-full w-[25%]"></div>
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span class="text-xs text-emerald-600 font-semibold">3 redundant subscriptions found</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="badge-emerald mb-6">
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full" aria-hidden="true"></span>
                    Financial OS
                </div>
                <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 mb-6 leading-tight">
                    Feel truly clear<br>about your money.
                </h2>
                <p class="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                    Stop wondering where it goes. Financial OS tracks subscriptions, identifies waste, and gives gentle proactive guidance on your monthly budget.
                </p>
                <ul class="space-y-4">
                    @foreach([['💳', 'Subscription guard'], ['📉', 'Waste analysis'], ['📊', 'Budget forecasting']] as $f)
                        <li class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0" aria-hidden="true">{{ $f[0] }}</div>
                            <span class="font-semibold text-slate-900">{{ $f[1] }}</span>
                        </li>
                    @endforeach
                </ul>
            </div>
        </div>
    </x-section>

    {{-- Module 3: Shield OS --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div>
                <div class="badge-dark mb-6">
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-slow" aria-hidden="true"></span>
                    Shield OS
                </div>
                <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 mb-6 leading-tight">
                    Explore with<br>total confidence.
                </h2>
                <p class="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                    The world is full of digital traps. Shield OS helps you verify scam messages and analyze complex contracts — all in a private, zero-knowledge environment.
                </p>
                <x-button variant="teal" size="lg" href="/security" ariaLabel="Read the full security deep-dive">
                    Security deep-dive
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </x-button>
            </div>
            <div class="bg-slate-50 rounded-3xl p-8 aspect-square border border-slate-200 flex flex-col items-center justify-center gap-6 relative overflow-hidden" aria-hidden="true">
                <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl shadow-sm">🛡️</div>
                <div class="text-center">
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></span>
                        <span class="text-emerald-700 text-sm font-bold uppercase tracking-wider">Shield Active</span>
                    </div>
                    <p class="text-slate-500 text-sm max-w-xs">Your data never leaves your device unencrypted. Zero-knowledge by design.</p>
                </div>
                <div class="w-full max-w-xs bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span class="text-emerald-700 text-xs font-semibold">Last scam blocked: 2 hours ago</span>
                </div>
            </div>
        </div>
    </x-section>

    {{-- CTA --}}
    <x-section bg="bg-slate-950" padding="py-24 md:py-28" container="false">
        <div class="section-container text-center">
            <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/15 to-transparent pointer-events-none" aria-hidden="true"></div>
            <div class="relative z-10">
                <h2 class="text-4xl md:text-6xl font-black font-heading text-white mb-6 tracking-tight">Ready to handle it?</h2>
                <p class="text-lg text-slate-400 font-medium mb-10">Join the waitlist and be among the first to experience HandleLife OS.</p>
                <x-button href="/waitlist" size="xl" variant="teal" ariaLabel="Get early access to HandleLife OS">
                    Get early access — it's free
                </x-button>
            </div>
        </div>
    </x-section>

</x-app-layout>
