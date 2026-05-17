@php
    /**
     * Premium use-case ticker — uses inline SVG icons (no emojis).
     * Names map to keys in the icon component for consistency.
     */
    $items = [
        ['text' => 'Compare phone plans instantly',                'icon' => 'phone'],
        ['text' => 'Check scam messages in seconds',               'icon' => 'shield'],
        ['text' => 'Organize family tasks with ease',              'icon' => 'users-family'],
        ['text' => 'Reduce monthly waste, effortlessly',           'icon' => 'trend-down'],
        ['text' => 'Plan your day in just 30 seconds',             'icon' => 'calendar'],
        ['text' => 'Manage bills and due dates, wherever you live','icon' => 'wallet'],
        ['text' => 'Navigate life in a new place',                 'icon' => 'compass'],
    ];
@endphp

<div x-data="useCaseCarousel({{ count($items) }})"
    class="relative h-20 w-full max-w-xl overflow-hidden flex items-center bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl px-8 group"
    style="box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.20);">

    <div class="flex items-center w-full relative">
        @foreach($items as $i => $item)
            <div
                x-show="active === {{ $i }}"
                x-transition:enter="transition ease-[cubic-bezier(0.16,1,0.3,1)] duration-700 delay-200"
                x-transition:enter-start="opacity-0 translate-y-6"
                x-transition:enter-end="opacity-100 translate-y-0"
                x-transition:leave="transition ease-in duration-400"
                x-transition:leave-start="opacity-100 translate-y-0"
                x-transition:leave-end="opacity-0 -translate-y-6"
                class="absolute inset-0 flex items-center gap-5 h-full"
                x-cloak>
                <div class="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-white/10 to-white/[0.04] rounded-2xl flex items-center justify-center text-teal-300 border border-white/10"
                     style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);">
                    <x-icon :name="$item['icon']" :size="20" :stroke="1.6" />
                </div>
                <div class="text-base md:text-lg font-semibold font-heading text-white tracking-tight leading-tight">{{ $item['text'] }}</div>
            </div>
        @endforeach
    </div>

    {{-- Pagination dots --}}
    <div class="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
        @foreach($items as $i => $item)
            <button
                @click="setActive({{ $i }})"
                aria-label="Show use case {{ $i + 1 }}"
                :class="active === {{ $i }} ? 'bg-teal-400 h-3' : 'bg-white/40 h-1 hover:bg-white/60'"
                class="w-1 rounded-full transition-all duration-400">
            </button>
        @endforeach
    </div>
</div>
