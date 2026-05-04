<x-app-layout>
    <x-slot name="title">{{ $title }}</x-slot>

    {{-- Hero --}}
    <x-section bg="bg-white" padding="pt-32 pb-20">
        <x-breadcrumbs :items="[['name' => 'Our Mission', 'url' => route('about')]]" />
        <div class="max-w-3xl mt-6">
            <p class="eyebrow mb-5">The Philosophy</p>
            <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-8 leading-[1.02]">
                Handle life<br>
                <span class="text-slate-400">with dignity.</span>
            </h1>
            <p class="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                We build technology that understands what it means to be human — not to replace your judgment, but to support it where life gets complicated.
            </p>
        </div>
    </x-section>

    {{-- Story --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-24 md:py-32">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div class="bg-slate-200 rounded-3xl aspect-square overflow-hidden relative group" aria-hidden="true">
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-300 to-slate-100 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium group-hover:scale-105 transition-transform duration-500">
                            <span class="text-slate-950 font-black text-xl italic">H</span>
                        </div>
                        <p class="text-slate-600 text-xs font-semibold uppercase tracking-widest">The Core</p>
                    </div>
                </div>
            </div>
            <div>
                <p class="eyebrow mb-5">Why we exist</p>
                <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 mb-8 leading-tight">Designed for people,<br>not units.</h2>
                <div class="space-y-6 text-slate-500 text-lg leading-relaxed font-medium">
                    <p>HandleLife OS started with a simple observation: <span class="text-slate-950 font-semibold">Modern life is overwhelming.</span> Despite a thousand "productivity" tools, the feeling of keeping everything together has never been harder.</p>
                    <p>The problem isn't lack of logic — it's the massive, invisible mental load of managing a modern existence. Technology should protect your time, not steal it for a metric.</p>
                    <p>Whether you're navigating life in Lagos or London, Tokyo or Toronto, Mumbai or Mexico City — the need for calm, clarity, and control is universal. HandleLife OS is built for all of it.</p>
                </div>
            </div>
        </div>
    </x-section>

    {{-- Values --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="max-w-2xl mb-16">
            <p class="eyebrow mb-5">Our backbone</p>
            <h2 class="text-3xl md:text-5xl font-black font-heading text-slate-950 leading-tight">Foundational truths.</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
            @foreach([
                ['icon' => '🤝', 'title' => 'Dignity first',   'text' => 'Technology should serve your wellbeing, not exploit your attention for profit. Our systems are built to save time — never to steal it.'],
                ['icon' => '🛡️', 'title' => 'Zero visibility', 'text' => 'Safety is not a feature; it\'s the architecture. We build with end-to-end zero-knowledge standards so your life remains your own.'],
                ['icon' => '✨', 'title' => 'Calm clarity',    'text' => 'We don\'t just organize chaos — we neutralize it. Our goal is to anticipate needs before they become stressors, providing clear paths forward.'],
            ] as $v)
                <div class="group">
                    <div class="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:-translate-y-1 transform" aria-hidden="true">{{ $v['icon'] }}</div>
                    <h3 class="text-base font-bold text-slate-950 mb-3 uppercase tracking-wide">{{ $v['title'] }}</h3>
                    <p class="text-slate-500 text-sm leading-relaxed font-medium">{{ $v['text'] }}</p>
                </div>
            @endforeach
        </div>
    </x-section>

    {{-- Mission CTA --}}
    <section class="bg-slate-950 text-white py-28 md:py-36 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/15 via-transparent to-transparent pointer-events-none" aria-hidden="true"></div>
        <div class="section-container text-center relative z-10">
            <h2 class="text-4xl md:text-6xl font-black font-heading mb-6 leading-[1.02] tracking-tight">Building a more<br>human future.</h2>
            <p class="text-lg text-slate-400 font-medium mb-10 max-w-md mx-auto">If you believe life should feel lighter — join us in making it so.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <x-button href="/waitlist" size="xl" variant="teal">Join the mission</x-button>
                <x-button href="/contact" size="xl" variant="ghost" class="text-slate-300 hover:text-white hover:bg-white/8">Get in touch</x-button>
            </div>
        </div>
    </section>

</x-app-layout>
