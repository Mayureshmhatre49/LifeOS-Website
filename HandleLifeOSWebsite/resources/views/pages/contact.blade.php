<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    @push('schema')
        <x-schema type="contactpage" />
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home',    'url' => '/'],
            ['name' => 'Contact', 'url' => '/contact'],
        ]" />
    @endpush

    {{-- Success / error flash --}}
    @if(session('success'))
        <div class="fixed top-24 inset-x-0 z-50 flex justify-center px-4" x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 5000)"
             x-transition:leave="transition ease-in duration-300" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 -translate-y-2" role="status">
            <div class="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-premium text-sm font-semibold flex items-center gap-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                {{ session('success') }}
            </div>
        </div>
    @endif

    {{-- Header --}}
    <x-section bg="bg-white" padding="pt-32 pb-12">
        <x-breadcrumbs :items="[['name' => 'Contact', 'url' => route('contact')]]" />
        <div class="max-w-xl mt-6">
            <h1 class="text-5xl md:text-6xl font-black font-heading tracking-tight text-slate-950 mb-5 leading-[1.02]">Let's connect.</h1>
            <p class="text-lg text-slate-500 font-medium leading-relaxed">
                Whether you need help with partnerships, a demo, or just have a question — we're here to listen.
            </p>
        </div>
    </x-section>

    {{-- Form + Sidebar --}}
    <x-section bg="bg-white" padding="pb-24 md:pb-32">
        <div class="grid lg:grid-cols-2 gap-14 xl:gap-20 items-start">

            {{-- Form --}}
            <div class="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-card">

                @if($errors->any())
                    <div class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl" role="alert">
                        <p class="text-red-700 text-sm font-semibold mb-2">Please fix the following:</p>
                        <ul class="text-red-600 text-sm space-y-1 list-disc list-inside">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('lead.store') }}" method="POST" novalidate>
                    @csrf
                    {{-- Honeypot: hidden from humans, bots autofill it --}}
                    <div style="display:none" aria-hidden="true">
                        <input type="text" name="_hp_website" value="" tabindex="-1" autocomplete="off">
                    </div>
                    <div class="space-y-5">
                        <div class="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label for="name" class="label">Full name <span class="text-red-400" aria-hidden="true">*</span></label>
                                <input type="text" id="name" name="name" required autocomplete="name"
                                       placeholder="Your full name"
                                       value="{{ old('name') }}"
                                       class="input {{ $errors->has('name') ? 'border-red-300 focus:ring-red-500' : '' }}"
                                       aria-required="true"
                                       aria-invalid="{{ $errors->has('name') ? 'true' : 'false' }}">
                            </div>
                            <div>
                                <label for="email" class="label">Work email <span class="text-red-400" aria-hidden="true">*</span></label>
                                <input type="email" id="email" name="email" required autocomplete="email"
                                       placeholder="jane@company.com"
                                       value="{{ old('email') }}"
                                       class="input {{ $errors->has('email') ? 'border-red-300 focus:ring-red-500' : '' }}"
                                       aria-required="true"
                                       aria-invalid="{{ $errors->has('email') ? 'true' : 'false' }}">
                            </div>
                        </div>

                        <div>
                            <label for="company_name" class="label">Company name <span class="text-slate-300 font-normal normal-case tracking-normal">(optional)</span></label>
                            <input type="text" id="company_name" name="company_name" autocomplete="organization"
                                   placeholder="Acme Corp"
                                   value="{{ old('company_name') }}"
                                   class="input">
                        </div>

                        <div>
                            <label for="inquiry_type" class="label">Inquiry type</label>
                            <select id="inquiry_type" name="inquiry_type" class="input" aria-required="true">
                                <option value="general"     {{ old('inquiry_type') === 'general'     ? 'selected' : '' }}>General inquiry</option>
                                <option value="demo"        {{ old('inquiry_type') === 'demo'        ? 'selected' : '' }}>Book a demo</option>
                                <option value="sales"       {{ old('inquiry_type') === 'sales'       ? 'selected' : '' }}>Sales & pricing</option>
                                <option value="partnership" {{ old('inquiry_type') === 'partnership' ? 'selected' : '' }}>Partnership opportunity</option>
                            </select>
                        </div>

                        <div>
                            <label for="message" class="label">How can we help? <span class="text-red-400" aria-hidden="true">*</span></label>
                            <textarea id="message" name="message" rows="5" required
                                      placeholder="Tell us what's on your mind..."
                                      class="input resize-none {{ $errors->has('message') ? 'border-red-300 focus:ring-red-500' : '' }}"
                                      aria-required="true"
                                      aria-invalid="{{ $errors->has('message') ? 'true' : 'false' }}">{{ old('message') }}</textarea>
                        </div>

                        <x-button type="submit" size="lg" variant="teal" class="w-full justify-center" ariaLabel="Send your message">
                            Send message
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </x-button>

                        <p class="text-xs text-slate-400 text-center font-medium">We respond within 1 business day.</p>
                    </div>
                </form>
            </div>

            {{-- Sidebar --}}
            <div class="space-y-10 lg:pt-2">
                <div>
                    <h2 class="eyebrow mb-6">Global support</h2>
                    <div class="space-y-5">
                        @foreach([
                            ['region' => 'North America',      'location' => 'San Francisco, CA'],
                            ['region' => 'Europe',             'location' => 'London, UK'],
                            ['region' => 'South Asia',         'location' => 'Bangalore, IN'],
                            ['region' => 'Middle East & Africa', 'location' => 'Dubai, UAE'],
                            ['region' => 'East Asia & Pacific', 'location' => 'Singapore, SG'],
                        ] as $office)
                            <div class="flex items-start gap-4">
                                <div class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
                                <div>
                                    <div class="font-semibold text-slate-950 text-sm">{{ $office['region'] }}</div>
                                    <div class="text-slate-500 text-sm">{{ $office['location'] }}</div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div class="bg-slate-950 rounded-3xl p-8 text-white ring-inset-white">
                    <h3 class="font-bold text-lg font-heading mb-3">Investor or press?</h3>
                    <p class="text-slate-400 text-sm leading-relaxed mb-6">
                        For investor relations or media inquiries, please reach out directly to our global communications team.
                    </p>
                    <a href="mailto:comms@handlelife.os"
                       class="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-semibold"
                       aria-label="Email our communications team">
                        Email comms team
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </a>
                </div>

                <div class="p-6 bg-teal-50 border border-teal-100 rounded-2xl">
                    <p class="text-teal-800 text-sm font-semibold mb-1">Privacy assured</p>
                    <p class="text-teal-700 text-xs leading-relaxed">We only use your message to respond to you. Your data is never shared with third parties.</p>
                </div>
            </div>
        </div>
    </x-section>

</x-app-layout>
