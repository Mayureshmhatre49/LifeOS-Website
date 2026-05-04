<x-app-layout>
    <x-slot name="title">{{ $title }}</x-slot>

    {{-- Hero --}}
    <x-section bg="bg-white" padding="pt-32 pb-16">
        <div class="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
            <div>
                <x-breadcrumbs :items="[['name' => 'Families', 'url' => route('families')]]" />
                <p class="eyebrow mt-6 mb-5">Family Systems</p>
                <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-6 leading-[1.02]">
                    End the mental load.<br>
                    <span class="text-slate-400">Start living.</span>
                </h1>
                <p class="text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-lg">
                    Invisible burdens and household chaos shouldn't be your normal. HandleLife OS acts as your family's intelligent coordinator.
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                    <x-button href="/waitlist" variant="teal" size="lg" ariaLabel="Start your Family Hub">Start Family Hub</x-button>
                    <x-button href="/pricing"  variant="outline" size="lg" ariaLabel="View Family Hub pricing">View plan</x-button>
                </div>
            </div>

            {{-- Visual --}}
            <div class="relative group">
                <div class="absolute -inset-6 bg-teal-500/8 rounded-[3rem] blur-3xl" aria-hidden="true"></div>
                <div class="relative bg-slate-100 rounded-3xl overflow-hidden shadow-premium-lg aspect-square">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                    <div class="absolute bottom-8 left-6 right-6 glass-dark border border-white/10 rounded-2xl p-5 shadow-xl">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow" aria-hidden="true"></span>
                            <span class="text-white text-xs font-semibold uppercase tracking-wider">Home Sync Active</span>
                        </div>
                        <div class="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
                            <div class="h-full bg-emerald-500 rounded-full w-[70%]"></div>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-white/80 text-xs font-medium">Your Home · 4 tasks left today</p>
                            <span class="text-teal-400 text-xs font-semibold">View →</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </x-section>

    {{-- Emotional tone --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-24 md:py-32">
        <div class="max-w-3xl mx-auto text-center mb-20">
            <p class="eyebrow mb-5">Shared life</p>
            <h2 class="section-heading text-slate-950 mb-8">Life is shared.<br>The stress shouldn't be.</h2>
            <blockquote class="text-xl text-slate-500 font-medium italic leading-relaxed">
                "I'm not just tired from work. I'm tired from being the one who has to remember everything."
            </blockquote>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            @foreach([
                ['icon' => '☁️', 'title' => 'Invisible burden',  'text' => 'School dates, grocery needs, medical appointments, maintenance — the mental load that usually falls on one person\'s shoulders.'],
                ['icon' => '🌀', 'title' => 'Household chaos',   'text' => 'Birthdays, bill payments, school events that slip through the cracks of a busy life, causing unnecessary pressure on the whole home.'],
                ['icon' => '🌿', 'title' => 'Finding sync',      'text' => 'Reclaiming your time isn\'t about doing more tasks — it\'s about more clarity. HandleLife helps your whole household breathe easier, together.'],
            ] as $item)
                <div class="group text-center">
                    <div class="text-4xl mb-5 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:-translate-y-1 transform" aria-hidden="true">{{ $item['icon'] }}</div>
                    <h3 class="font-bold text-slate-950 mb-3 uppercase tracking-wide text-sm">{{ $item['title'] }}</h3>
                    <p class="text-slate-500 text-sm leading-relaxed font-medium">{{ $item['text'] }}</p>
                </div>
            @endforeach
        </div>
    </x-section>

    {{-- Deep capabilities --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div>
                <p class="eyebrow mb-5">The Family OS</p>
                <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 mb-10 leading-tight">Harmony, by design.</h2>
                <div class="space-y-8">
                    @foreach([
                        ['icon' => '🏠', 'title' => 'Household logic',    'text' => 'OS identifies recurring needs and assigns them fairly across the household, reducing constant verbal reminders.'],
                        ['icon' => '👵', 'title' => 'Elder support',       'text' => 'A dedicated dashboard for managing wellbeing of parents — from medical tracking to care visit coordination.'],
                        ['icon' => '🛒', 'title' => 'Supply intelligence', 'text' => 'Automatically tracks inventory and builds optimized shopping lists based on consumption patterns.'],
                    ] as $f)
                        <div class="flex items-start gap-5 group">
                            <div class="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200" aria-hidden="true">{{ $f['icon'] }}</div>
                            <div>
                                <h3 class="font-bold text-slate-950 mb-2 text-base">{{ $f['title'] }}</h3>
                                <p class="text-slate-500 text-sm leading-relaxed font-medium">{{ $f['text'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Testimonial card --}}
            <div class="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-premium-lg ring-inset-white flex flex-col justify-between gap-8">
                <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent pointer-events-none" aria-hidden="true"></div>
                <div class="relative z-10">
                    <span class="badge-teal mb-6 inline-flex">Case study</span>
                    <blockquote class="text-xl md:text-2xl font-medium font-heading leading-snug text-white/90">
                        "Before HandleLife, we had at least three micro-arguments a day about chores. Now the OS just tells us our Tasks of the Day. The relief is real."
                    </blockquote>
                </div>
                <div class="relative z-10 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl" aria-hidden="true">🏠</div>
                    <div>
                        <div class="font-bold text-white text-sm">A family of four</div>
                        <div class="text-teal-400 text-xs font-semibold mt-0.5">Plus Family Account</div>
                    </div>
                </div>
            </div>
        </div>
    </x-section>

    {{-- CTA --}}
    <x-section bg="bg-teal-50 border-y border-teal-100" padding="py-24 md:py-28">
        <div class="text-center">
            <h2 class="text-4xl md:text-5xl font-black font-heading text-slate-950 mb-6 tracking-tight">Bring it all together.</h2>
            <p class="text-lg text-slate-500 font-medium mb-10 max-w-md mx-auto">Start your Family Hub today and give your household the clarity it deserves.</p>
            <x-button href="/waitlist" size="xl" variant="teal" ariaLabel="Start your Family Hub">Get started for free</x-button>
        </div>
    </x-section>

</x-app-layout>
