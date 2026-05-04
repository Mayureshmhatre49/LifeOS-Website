@props(['items' => []])

<nav aria-label="Breadcrumb" class="mb-8">
    <ol role="list" class="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <li>
            <div>
                <a href="/" class="hover:text-teal-600 transition-colors">Home</a>
            </div>
        </li>

        @foreach($items as $item)
            <li class="flex items-center">
                <svg class="h-4 w-4 flex-shrink-0 text-slate-300 mx-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                @if($loop->last)
                    <span class="text-slate-900" aria-current="page">{{ $item['name'] }}</span>
                @else
                    <a href="{{ $item['url'] }}" class="hover:text-teal-600 transition-colors">{{ $item['name'] }}</a>
                @endif
            </li>
        @endforeach
    </ol>
</nav>

<!-- Breadcrumb Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{{ config('app.url') }}"
    }
    @foreach($items as $index => $item)
    ,{
      "@type": "ListItem",
      "position": {{ $index + 2 }},
      "name": "{{ $item['name'] }}",
      "item": "{{ $item['url'] }}"
    }
    @endforeach
  ]
}
</script>
