<x-app-layout title="Session expired" description="Your session has expired. Please go back and try again." robots="noindex, nofollow">

    <section class="min-h-[100svh] bg-white flex items-center justify-center pt-32 pb-20 px-6">
        <div class="max-w-xl mx-auto text-center">
            <p class="eyebrow mb-5 text-amber-500">Session expired</p>
            <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-6 leading-[1.02]">
                Your session timed out.
            </h1>
            <p class="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                For your security, sessions expire after a period of inactivity. Please go back and try submitting again.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button onclick="history.back()"
                        class="inline-flex items-center justify-center px-6 py-4 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-2xl transition-colors cursor-pointer">
                    Go back
                </button>
                <a href="/" class="inline-flex items-center justify-center px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-2xl transition-colors">
                    Back to home
                </a>
            </div>
        </div>
    </section>

</x-app-layout>
