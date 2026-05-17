<x-app-layout title="Page not found" description="The page you are looking for could not be found. Return to HandleLife OS — AI for everyday life.">
    <x-slot name="title">Page not found</x-slot>

    @push('schema')
        <x-schema type="webpage" :data="[
            'name'        => '404 — Page not found',
            'description' => 'The page you are looking for could not be found.',
        ]" />
    @endpush

    <section class="min-h-[100svh] bg-white flex items-center justify-center pt-32 pb-20 px-6">
        <div class="max-w-xl mx-auto text-center">
            <p class="eyebrow mb-5 text-teal-600">404</p>
            <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-6 leading-[1.02]">
                We couldn't find that page.
            </h1>
            <p class="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                The page may have moved, been renamed, or never existed. Let's get you back on track.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/" class="inline-flex items-center justify-center px-6 py-4 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-2xl transition-colors">
                    Back to home
                </a>
                <a href="/contact" class="inline-flex items-center justify-center px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-2xl transition-colors">
                    Contact support
                </a>
            </div>
        </div>
    </section>
</x-app-layout>
