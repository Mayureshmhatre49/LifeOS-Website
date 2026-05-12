<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    @push('schema')
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home',  'url' => '/'],
            ['name' => 'Terms', 'url' => '/terms'],
        ]" />
    @endpush

    {{-- Hero --}}
    <x-section bg="bg-white" padding="pt-32 pb-20">
        <x-breadcrumbs :items="[['name' => 'Terms of Service', 'url' => route('terms')]]" />
        <div class="max-w-3xl mt-6">
            <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-8 leading-[1.02]">
                Terms of<br>
                <span class="text-slate-400">service.</span>
            </h1>
            <p class="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                Last Updated: April 25, 2026. HandleLife OS is a tool for personal empowerment. These terms ensure a safe and fair experience for everyone.
            </p>
        </div>
    </x-section>

    {{-- Content --}}
    <x-section bg="bg-slate-50 border-y border-slate-100" padding="py-24">
        <div class="max-w-4xl">
            <div class="prose prose-slate prose-lg prose-premium max-w-none">
                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">1. Acceptance of Terms</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        By using HandleLife OS, you agree to these terms. If you are using the platform on behalf of a family or organization, you represent that you have the authority to bind that entity to these terms.
                    </p>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">2. Use of the Service</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-4">
                        HandleLife OS is an AI-powered life operating system. It is designed to assist with organization and decision-making. 
                    </p>
                    <div class="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-6">
                        <p class="text-sm text-amber-900 font-bold mb-2 uppercase tracking-wide">Important Notice</p>
                        <p class="text-sm text-amber-800 leading-relaxed">
                            HandleLife AI provides suggestions and support, not professional legal, financial, or medical advice. Always use your own judgment.
                        </p>
                    </div>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">3. User Responsibilities</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-4">
                        To maintain a high-quality environment, you agree not to:
                    </p>
                    <ul class="space-y-3 text-slate-600 font-medium">
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Use the service for any illegal purposes.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Attempt to reverse engineer or bypass security systems.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Input data that violates the rights of others.</span>
                        </li>
                    </ul>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">4. Subscriptions and Payments</h2>
                    <p class="text-slate-600 font-medium leading-relaxed mb-4">
                        Access to certain features requires a paid subscription.
                    </p>
                    <ul class="space-y-3 text-slate-600 font-medium">
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Subscriptions renew automatically unless cancelled.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>You can cancel at any time via your dashboard.</span>
                        </li>
                    </ul>
                </div>

                <div class="mb-16">
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">5. Global Governing Law</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        These terms are governed by the laws of India. However, we recognize that our users are global, and we strive to resolve any disputes fairly and transparently through international arbitration standards where applicable.
                    </p>
                </div>

                <div>
                    <h2 class="text-3xl font-black font-heading text-slate-950 mb-6 uppercase tracking-tight">6. Changes to Terms</h2>
                    <p class="text-slate-600 font-medium leading-relaxed">
                        We may update these terms as our product evolves. We will notify you of any significant changes via email or through the app.
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
                    <h2 class="text-3xl md:text-5xl font-black font-heading text-white mb-6">Need clarification?</h2>
                    <p class="text-slate-400 font-medium mb-10 max-w-lg mx-auto">We value clarity over legalese. Reach out if something isn't clear.</p>
                    <x-button href="/contact" variant="teal" size="xl">Ask a question</x-button>
                </div>
            </div>
        </div>
    </section>

</x-app-layout>
