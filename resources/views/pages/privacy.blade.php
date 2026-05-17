<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    @push('schema')
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home',           'url' => '/'],
            ['name' => 'Privacy Policy', 'url' => '/privacy'],
        ]" />
    @endpush

    {{-- Hero --}}
    <x-section bg="bg-white" padding="pt-32 pb-20">
        <x-breadcrumbs :items="[['name' => 'Privacy Policy', 'url' => route('privacy')]]" />
        <div class="max-w-3xl mt-6">
            <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-8 leading-[1.02]">
                Privacy is<br>
                <span class="text-slate-400">the default.</span>
            </h1>
            <p class="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                Last Updated: April 25, 2026. At HandleLife OS, we believe privacy is a fundamental human right. Our systems are built from the ground up to protect your dignity and data.
            </p>
        </div>
    </x-section>

    {{-- Content --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-24">
        <div class="max-w-4xl">
            <div class="prose prose-slate prose-lg prose-premium max-w-none">
                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">1. International Standards</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        HandleLife OS operates globally. We adhere to the highest international privacy standards, including GDPR (Europe), CCPA (California), and Digital Personal Data Protection Act (India). Regardless of where you are located, we apply a high-bar protection standard to everyone.
                    </p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">2. Zero-Knowledge Architecture</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-4">
                        This is our core promise. Most of your data — including your daily plans, financial records, and private notes — is encrypted with keys that only you hold.
                    </p>
                    <ul class="space-y-3 text-slate-600 font-medium">
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>We cannot read your private life data.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>We cannot sell your data to advertisers (we have no ads).</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Even in the event of a government request, we cannot provide data we cannot decrypt.</span>
                        </li>
                    </ul>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">3. Data We Collect</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-4">
                        We only collect what is strictly necessary to run the service:
                    </p>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="bg-white p-6 rounded-2xl border border-slate-200">
                            <h4 class="font-bold text-slate-950 mb-2">Account Info</h4>
                            <p class="text-sm text-slate-500">Email and basic profile info to manage your subscription and login.</p>
                        </div>
                        <div class="bg-white p-6 rounded-2xl border border-slate-200">
                            <h4 class="font-bold text-slate-950 mb-2">Usage Metadata</h4>
                            <p class="text-sm text-slate-500">Anonymous technical data to improve app performance and stability.</p>
                        </div>
                    </div>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">4. AI and Your Privacy</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        Your interactions with the HandleLife AI advisor are used to help you, not to train general models for other users. We use isolated processing environments to ensure your context remains yours.
                    </p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">5. Your Rights</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-6">
                        You have the right to:
                    </p>
                    <div class="flex flex-wrap gap-3">
                        @foreach(['Access your data', 'Export your data', 'Delete your account', 'Correct inaccuracies'] as $right)
                            <span class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700">{{ $right }}</span>
                        @endforeach
                    </div>
                </div>

                <div class="mb-16" id="cookies">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">6. Cookies &amp; Local Storage</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-6">
                        We use the minimum necessary browser storage to make the service work. We have no advertising cookies, no third-party tracking pixels, and no analytics cookies.
                    </p>
                    <div class="grid md:grid-cols-2 gap-6 mb-4">
                        <div class="bg-white p-6 rounded-2xl border border-slate-200">
                            <h4 class="font-bold text-slate-950 mb-2">Essential Session Cookie</h4>
                            <p class="text-sm text-slate-500">A CSRF security token set by Laravel to protect form submissions. Required for the site to function. Expires with your browser session.</p>
                        </div>
                        <div class="bg-white p-6 rounded-2xl border border-slate-200">
                            <h4 class="font-bold text-slate-950 mb-2">Language &amp; Preference Storage</h4>
                            <p class="text-sm text-slate-500">Your language and currency preferences are saved in localStorage — on your device only, never transmitted to our servers.</p>
                        </div>
                    </div>
                    <p class="text-slate-500 text-sm font-medium">Google Fonts is loaded from <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">fonts.googleapis.com</code> but does not set cookies (changed by Google in 2022). No other third-party cookies are set.</p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">7. Children's Privacy (COPPA)</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        HandleLife OS is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal data, please <a href="/contact" class="text-teal-700 font-bold hover:underline">contact us</a> and we will delete it promptly. Users between 13 and 18 may only use the service with parental consent.
                    </p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">8. California Residents (CCPA)</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-4">
                        If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                    </p>
                    <div class="flex flex-wrap gap-3 mb-4">
                        @foreach(['Know what data we collect', 'Request deletion', 'Opt out of data sale', 'Non-discrimination'] as $right)
                            <span class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700">{{ $right }}</span>
                        @endforeach
                    </div>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        <strong class="text-slate-900">We do not sell your personal information</strong> — to anyone, ever. To exercise any California privacy rights, contact us via our <a href="/contact" class="text-teal-700 font-bold hover:underline">contact form</a>.
                    </p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">9. Data Controller</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        The data controller responsible for your personal information is <strong class="text-slate-900">HandleLife OS (Life Strategy Technology)</strong>, headquartered in Bangalore, Karnataka, India. For all privacy inquiries, including requests to exercise your rights under GDPR, CCPA, or DPDPA, contact us via our <a href="/contact" class="text-teal-700 font-bold hover:underline">contact form</a>. We respond within one business day.
                    </p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">10. Accessibility</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        We are committed to making HandleLife OS accessible to everyone. This website is designed to conform to <strong class="text-slate-900">WCAG 2.1 Level AA</strong> standards. If you encounter any accessibility barrier, please <a href="/contact" class="text-teal-700 font-bold hover:underline">contact us</a> — we will make reasonable accommodations and respond within two business days.
                    </p>
                </div>

                <div>
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">11. Contact Privacy Team</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        Questions about your data? Reach out via our <a href="/contact" class="text-teal-700 font-bold hover:underline">contact form</a> and select <em>General inquiry</em> — our privacy team responds within one business day.
                    </p>
                </div>
            </div>
        </div>
    </x-section>

    {{-- Support CTA --}}
    <section class="bg-white py-24">
        <div class="section-container">
            <div class="bg-slate-950 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                <div class="relative z-10">
                    <h2 class="text-3xl md:text-5xl font-black font-heading text-white mb-6">Still have questions?</h2>
                    <p class="text-slate-400 font-medium mb-10 max-w-lg mx-auto">We're happy to discuss our architecture and how we protect your life.</p>
                    <x-button href="/contact" variant="teal" size="xl">Talk to us</x-button>
                </div>
            </div>
        </div>
    </section>

</x-app-layout>
