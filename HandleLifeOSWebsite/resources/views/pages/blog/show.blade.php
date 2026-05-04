<x-app-layout :title="$post->title"
              :description="$post->meta_description ?? $post->excerpt"
              :image="$post->featured_image">
    @push('schema')
        <x-schema type="blogpost" :data="[
            'headline'      => $post->title,
            'description'   => $post->excerpt,
            'image'         => $post->featured_image,
            'datePublished' => $post->published_at->toIso8601String(),
            'dateModified'  => optional($post->updated_at)->toIso8601String() ?? $post->published_at->toIso8601String(),
            'author'        => [
                '@type' => 'Person',
                'name'  => $post->author_name,
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name'  => 'HandleLife OS',
                'logo'  => [
                    '@type' => 'ImageObject',
                    'url'   => asset('images/logo.png'),
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id'   => route('blog.show', $post->slug),
            ],
        ]" />
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home', 'url' => '/'],
            ['name' => 'Blog', 'url' => '/blog'],
            ['name' => $post->title, 'url' => '/blog/' . $post->slug],
        ]" />
    @endpush

    <!-- Post Header -->
    <x-section bg="bg-white" padding="pt-40 pb-20">
        <div class="max-w-4xl mx-auto">
            <x-breadcrumbs :items="[
                ['name' => 'Blog', 'url' => route('blog.index')],
                ['name' => $post->title, 'url' => route('blog.show', $post->slug)]
            ]" />
            
            <div class="flex items-center space-x-4 mb-8">
                <a href="/blog?category={{ $post->category->slug }}" class="bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{{ $post->category->name }}</a>
                <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">{{ $post->published_at->format('M d, Y') }}</span>
                <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">•</span>
                <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">{{ $post->reading_time ?? '5 min' }} read</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black font-heading tracking-tight text-slate-950 mb-8 leading-tight">
                {{ $post->title }}
            </h1>
            <p class="text-xl text-slate-500 font-medium leading-relaxed">
                {{ $post->excerpt }}
            </p>

            <div class="flex items-center space-x-4 mt-12 pt-8 border-t border-slate-100">
                <div class="w-12 h-12 rounded-full bg-slate-200"></div>
                <div>
                    <div class="font-bold text-slate-950 text-sm italic">By {{ $post->author_name }}</div>
                    <div class="text-[10px] uppercase tracking-widest text-slate-400 font-black">Life Strategy Team</div>
                </div>
            </div>
        </div>
    </x-section>

    <!-- Post Content -->
    <x-section bg="bg-white" padding="pb-32">
        <div class="max-w-4xl mx-auto">
            @if($post->featured_image)
                <div class="mb-20 rounded-[3rem] overflow-hidden shadow-2xl">
                    <img src="{{ $post->featured_image }}" alt="{{ $post->title }}" class="w-full h-auto" loading="eager" decoding="async" fetchpriority="high" width="1200" height="630">
                </div>
            @endif

            <article class="prose prose-slate prose-lg max-w-none 
                prose-headings:font-heading prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-950
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-strong:text-slate-900 prose-strong:font-black
                prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                selection:bg-teal-500/20">
                {{-- Content is HTML-sanitised before render: strips <script>, on* handlers,
                     javascript: URIs, dangerous CSS. Even if an authoring path is ever
                     compromised, stored XSS surface stays minimal. --}}
                {!! \App\Support\HtmlSanitizer::clean($post->content) !!}
            </article>

            <!-- Bottom Share/CTA -->
            <div class="mt-24 p-12 bg-slate-950 rounded-[3rem] text-center text-white relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent"></div>
                <div class="relative z-10">
                    <h3 class="text-3xl font-black font-heading mb-6">Found this helpful?</h3>
                    <p class="text-slate-400 mb-10 max-w-lg mx-auto">HandleLife OS helps you implement these strategies automatically. Join the waitlist to get started.</p>
                    <x-button href="/waitlist" variant="teal" size="lg">Join 50,000+ others</x-button>
                </div>
            </div>
        </div>
    </x-section>
</x-app-layout>
