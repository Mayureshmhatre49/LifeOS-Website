<x-app-layout title="Life Resources & Insights — Blog"
              description="Insights, guides, and stories about handling life better. Read about productivity, family coordination, money management, scam protection, and more."
              keywords="HandleLife OS blog, life management articles, AI productivity insights, family coordination guide, mental load resources">
    @push('schema')
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home', 'url' => '/'],
            ['name' => 'Blog', 'url' => '/blog'],
        ]" />
    @endpush

    <!-- Header -->
    <x-section bg="bg-white" padding="pt-40 pb-20">
        <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-5xl md:text-7xl font-black font-heading tracking-tight text-slate-950 mb-8">Life, Decoded.</h1>
            <p class="text-xl text-slate-600 font-medium lowercase tracking-tight">Our latest thinking on money, protection, productivity, and family.</p>
        </div>
    </x-section>

    <!-- Blog Grid -->
    <x-section bg="bg-white" padding="pb-32">
        <!-- Categories -->
        <div class="flex flex-wrap justify-center gap-4 mb-20">
            <a href="/blog" class="px-6 py-2 rounded-full bg-slate-950 text-white text-sm font-bold">All Topics</a>
            @foreach($categories as $category)
                <a href="/blog?category={{ $category->slug }}" class="px-6 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors">{{ $category->name }}</a>
            @endforeach
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            @forelse($posts as $post)
                <article class="group">
                    <a href="{{ route('blog.show', $post->slug) }}" class="block mb-6 overflow-hidden rounded-[2rem] aspect-[16/10] bg-slate-100 relative shadow-premium">
                        @if($post->featured_image)
                            <img src="{{ $post->featured_image }}" alt="{{ $post->title }}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" width="800" height="450">
                        @else
                            <div class="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-xs opacity-50">Post Visual</div>
                        @endif
                        <div class="absolute top-4 left-4">
                            <span class="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-900 tracking-wider break-all">{{ $post->category->name }}</span>
                        </div>
                    </a>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>{{ $post->published_at->format('M d, Y') }}</span>
                            <span>•</span>
                            <span>{{ $post->reading_time ?? '5 min' }} read</span>
                        </div>
                        <h2 class="text-2xl font-black font-heading text-slate-950 group-hover:text-teal-600 transition-colors leading-tight">
                            <a href="{{ route('blog.show', $post->slug) }}">{{ $post->title }}</a>
                        </h2>
                        <p class="text-slate-500 text-sm leading-relaxed line-clamp-2">
                            {{ $post->excerpt }}
                        </p>
                    </div>
                </article>
            @empty
                <div class="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                    <div class="text-4xl mb-6 grayscale opacity-50">✍️</div>
                    <p class="text-slate-400 font-bold uppercase tracking-widest text-sm">No stories yet. Let’s make today lighter together.</p>
                </div>
            @endforelse
        </div>

        @if($posts->hasPages())
            <div class="mt-20">
                {{ $posts->links() }}
            </div>
        @endif
    </x-section>

    <!-- Final CTA -->
    <x-section bg="bg-slate-50" padding="py-32">
        <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-3xl font-black font-heading text-slate-950 mb-8">Get life insights delivered.</h2>
            <form action="{{ route('waitlist.store') }}" method="POST" class="max-w-md mx-auto relative">
                @csrf
                <input type="email" name="email" required placeholder="name@email.com" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-teal-500 transition-all outline-none">
                <button type="submit" class="absolute right-3 top-3 bottom-3 px-6 bg-slate-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-colors">Join</button>
            </form>
        </div>
    </x-section>
</x-app-layout>
