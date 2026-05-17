<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    @push('schema')
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home',     'url' => '/'],
            ['name' => 'Waitlist', 'url' => '/waitlist'],
        ]" />
        <x-schema type="webpage" :data="[
            'name'        => 'Join the Early Access Waitlist — HandleLife OS',
            'description' => 'Be among the first 50,000+ to try HandleLife OS. Free early access, no credit card. Built for individuals, families, students, caregivers, and everyone in between.',
            'url'         => url('/waitlist'),
        ]" />
    @endpush

    {{-- Hero --}}
    <section class="relative bg-slate-950 text-white overflow-hidden min-h-[100svh] flex items-center pt-[76px]">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[80px] pointer-events-none" aria-hidden="true"></div>

        <div class="section-container w-full py-20">
            <div class="max-w-xl mx-auto text-center">
                <div class="badge bg-teal-500/10 border-teal-500/20 text-teal-400 mb-8 mx-auto">
                    <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse-slow" aria-hidden="true"></span>
                    50,000+ on the waitlist
                </div>

                <h1 class="text-4xl md:text-6xl font-black font-heading tracking-tight mb-5 leading-[1.05]">
                    Handle life with<br>
                    <span class="text-gradient-light">more clarity.</span>
                </h1>

                <p class="text-base md:text-lg text-slate-400 font-medium mb-10 leading-relaxed">
                    Join a community of people ready to end the mental load. Invites go out weekly as we build this together.
                </p>

                {{-- Waitlist form --}}
                <form action="{{ route('waitlist.store') }}" method="POST" novalidate>
                    @csrf
                    {{-- Honeypot: hidden from humans, bots autofill it --}}
                    <div style="display:none" aria-hidden="true">
                        <input type="text" name="_hp_website" value="" tabindex="-1" autocomplete="off">
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <div class="flex-1">
                            <label for="waitlist-email" class="sr-only">Email address</label>
                            <input
                                id="waitlist-email"
                                type="email"
                                name="email"
                                required
                                autocomplete="email"
                                placeholder="your@email.com"
                                class="input-dark w-full"
                                aria-describedby="waitlist-privacy">
                        </div>
                        <button type="submit"
                                class="flex-shrink-0 px-6 py-4 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-2xl transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-95">
                            Join waitlist
                        </button>
                    </div>

                    @if($errors->any())
                        <p class="mt-3 text-red-400 text-sm" role="alert">{{ $errors->first() }}</p>
                    @endif

                    @if(session('success'))
                        <p class="mt-3 text-emerald-400 text-sm font-medium" role="status">
                            ✓ {{ session('success') }}
                        </p>
                    @endif

                    <p id="waitlist-privacy" class="mt-4 text-xs text-slate-600 font-medium">
                        Secure · Private · No spam · Cancel any time
                    </p>
                </form>
            </div>
        </div>
    </section>

    {{-- Who it's for --}}
    <x-section bg="bg-white" padding="py-24 md:py-28">
        <div class="text-center mb-14">
            <p class="eyebrow mb-4">Who it's built for</p>
            <h2 class="section-heading text-slate-950 mb-5">Built for every person.<br>Everywhere.</h2>
            <p class="section-subheading max-w-xl mx-auto">Life is complex for everyone — regardless of where you live, what you do, or how your household looks. HandleLife OS meets you where you are.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <x-feature-card theme="muted" iconName="home"
                title="Families"
                description="From nuclear homes to multi-generational households — coordinate life together without the chaos." />
            <x-feature-card theme="muted" iconName="briefcase"
                title="Working people"
                description="Employee, entrepreneur, or freelancer — stop letting personal logistics fall through the cracks." />
            <x-feature-card theme="muted" iconName="graduation-cap"
                title="Students"
                description="Balance studies, finances, and growing responsibilities with a calm system built for your stage of life." />
            <x-feature-card theme="muted" iconName="globe"
                title="Individuals"
                description="Living solo doesn't mean handling everything alone. Your personal OS keeps life in order, wherever you are." />
            <x-feature-card theme="muted" iconName="user-elder"
                title="Older adults"
                description="Stay on top of health, finances, and daily routines with a calm, clear assistant that works at your pace." />
            <x-feature-card theme="muted" iconName="heart"
                title="Caregivers"
                description="Track the needs of those you love — from young children to aging parents — all in one clear place." />
            <x-feature-card theme="muted" iconName="lock"
                title="Privacy-first"
                description="For everyone who believes their personal data belongs to them — not to corporations or advertisers." />
            <x-feature-card theme="muted" iconName="sprout"
                title="New beginnings"
                description="New city, new country, or new chapter of life — your OS adapts to wherever you are in the world." />
        </div>
    </x-section>

    {{-- Trust signals --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-16 md:py-20">
        <div class="grid md:grid-cols-3 gap-8 text-center">
            <div>
                <div class="text-3xl font-black font-heading text-slate-950 mb-2">50k+</div>
                <div class="text-sm font-medium text-slate-500">People on the waitlist</div>
            </div>
            <div>
                <div class="text-3xl font-black font-heading text-slate-950 mb-2">Zero</div>
                <div class="text-sm font-medium text-slate-500">Data sold to advertisers. Ever.</div>
            </div>
            <div>
                <div class="text-3xl font-black font-heading text-slate-950 mb-2">AES-256</div>
                <div class="text-sm font-medium text-slate-500">Encryption standard on all data</div>
            </div>
        </div>
    </x-section>

</x-app-layout>
