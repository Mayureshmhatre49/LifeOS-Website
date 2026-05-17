<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    @push('schema')
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home',         'url' => '/'],
            ['name' => 'Partnerships', 'url' => '/enterprise'],
        ]" />
        <x-schema type="webpage" :data="[
            'name'        => 'Enterprise & Partnerships — HandleLife OS',
            'description' => 'Bring HandleLife OS to your employees, customers, or members. Enterprise-grade security, SSO, dedicated support, and global rollout in 100+ countries.',
            'url'         => url('/enterprise'),
        ]" />
    @endpush

    {{-- Hero --}}
    <x-section bg="bg-white" padding="pt-32 pb-16">
        <div class="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
            <div>
                <x-breadcrumbs :items="[['name' => 'Partnerships', 'url' => route('enterprise')]]" />
                <p class="eyebrow mt-6 mb-5">Global Ecosystem</p>
                <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-6 leading-[1.02]">
                    Clarity,<br>
                    <span class="text-slate-400">at scale.</span>
                </h1>
                <p class="text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-lg">
                    Partner with HandleLife OS to provide next-generation life coordination to your employees, customers, or members — anywhere in the world.
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                    <x-button href="/contact" variant="teal" size="lg" ariaLabel="Connect with our strategy team">Connect with strategy</x-button>
                    <x-button href="#sectors" variant="outline" size="lg">Explore solutions</x-button>
                </div>
            </div>

            {{-- Abstract visual --}}
            <div class="bg-slate-50 rounded-3xl p-12 aspect-video border border-slate-100 shadow-card flex items-center justify-center relative overflow-hidden group" aria-hidden="true">
                <div class="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent"></div>
                <div class="relative z-10 flex gap-5 w-full h-32 opacity-50 group-hover:opacity-90 transition-opacity duration-700">
                    <div class="flex-1 bg-teal-500 rounded-2xl transition-transform duration-700 translate-y-6 group-hover:translate-y-2"></div>
                    <div class="flex-1 bg-emerald-500 rounded-2xl transition-transform duration-700 -translate-y-4 group-hover:-translate-y-6"></div>
                    <div class="flex-1 bg-slate-900 rounded-2xl transition-transform duration-700 translate-y-2 group-hover:translate-y-0"></div>
                </div>
            </div>
        </div>
    </x-section>

    {{-- Sectors --}}
    <x-section id="sectors" bg="bg-slate-950 text-white" padding="py-24 md:py-32">
        <div class="max-w-3xl mb-16">
            <p class="eyebrow text-teal-400 mb-5">Depth of impact</p>
            <h2 class="section-heading mb-6">Support across scales.</h2>
            <p class="text-xl text-slate-400 font-medium leading-relaxed">
                Helping your network handle everyday life with clarity and dignity.
            </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            @php
                $sectors = [
                    ['icon' => 'building',     'title' => 'Workplace',    'desc' => 'Reduce administrative burnout by helping employees manage their invisible mental load.', 'tag' => 'Restored focus'],
                    ['icon' => 'bank',         'title' => 'Finance',      'desc' => 'Embed smarter money intelligence to help customers navigate major life decisions.',       'tag' => 'Digital loyalty'],
                    ['icon' => 'stethoscope', 'title' => 'Health',        'desc' => 'Proactive protection and coordination lead to safer outcomes and lower claims.',          'tag' => 'Risk reduction'],
                    ['icon' => 'school',       'title' => 'Education',    'desc' => 'Direct coordination between school schedules and parents\' HandleLife hubs.',             'tag' => 'Family sync'],
                    ['icon' => 'user-elder',   'title' => 'Eldercare',    'desc' => 'Helping families manage complex care for aging loved ones with precision and dignity.',   'tag' => 'Quality of life'],
                    ['icon' => 'globe',        'title' => 'Social impact','desc' => 'Scaling life coordination for social dignity and global citizen wellness.',               'tag' => 'Dignity at scale'],
                ];
            @endphp

            @foreach($sectors as $s)
                <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-7 group hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 ease-out">
                    <div class="icon-tile-dark icon-tile-md mb-5 group-hover:scale-105 group-hover:rotate-[-2deg]">
                        <x-icon :name="$s['icon']" :size="22" :stroke="1.6" />
                    </div>
                    <h3 class="font-bold text-white mb-3 text-base">{{ $s['title'] }}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed font-medium mb-5">{{ $s['desc'] }}</p>
                    <span class="text-teal-400 text-xs font-semibold uppercase tracking-wider">{{ $s['tag'] }}</span>
                </div>
            @endforeach
        </div>
    </x-section>

    {{-- Partner CTA --}}
    <x-section bg="bg-white" padding="py-24 md:py-32">
        <div class="max-w-3xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl py-20 px-10 text-center shadow-card">
            <p class="eyebrow mb-6">Start a conversation</p>
            <h2 class="text-4xl md:text-5xl font-black font-heading text-slate-950 mb-6 leading-tight">A world built better.</h2>
            <p class="text-lg text-slate-500 font-medium mb-10 max-w-md mx-auto">Join us in category-defining life coordination at scale.</p>
            <x-button href="/contact" size="xl" variant="teal" ariaLabel="Speak with our strategy team">Speak with strategy</x-button>
        </div>
    </x-section>

</x-app-layout>
