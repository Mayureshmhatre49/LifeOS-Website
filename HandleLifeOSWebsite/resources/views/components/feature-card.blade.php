@props([
    'title',
    'description',
    'icon'     => null,
    'iconName' => null,
    'span'     => '',
    'theme'    => 'light',
])

@php
    $themes = [
        'light' => 'bg-white border border-slate-200/70 text-slate-900 shadow-card hover:shadow-card-hover',
        'muted' => 'bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/70 text-slate-900 shadow-card hover:shadow-card-hover',
        'dark'  => 'bg-slate-900 border border-slate-800 text-white ring-inset-white',
        'teal'  => 'bg-gradient-to-br from-teal-600 to-teal-700 border border-teal-500 text-white shadow-teal',
    ];

    /* Premium icon containers — soft gradient, hairline border, subtle inner highlight */
    $iconContainer = [
        'light' => 'bg-gradient-to-br from-white to-slate-50 border border-slate-200/70 text-teal-600 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]',
        'muted' => 'bg-gradient-to-br from-white to-teal-50/40 border border-teal-100/60 text-teal-600 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]',
        'dark'  => 'bg-white/[0.06] border border-white/10 text-teal-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        'teal'  => 'bg-white/15 border border-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]',
    ];
@endphp

<div {{ $attributes->merge(['class' => "relative group $span p-7 md:p-8 rounded-3xl transition-all duration-300 ease-out hover:-translate-y-0.5 " . $themes[$theme]]) }}>

    @if($iconName)
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.04] group-hover:rotate-[-2deg] {{ $iconContainer[$theme] }}"
             aria-hidden="true">
            <x-icon :name="$iconName" :size="22" :stroke="1.75" />
        </div>
    @elseif($icon)
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.04] {{ $iconContainer[$theme] }}"
             aria-hidden="true">
            {{ $icon }}
        </div>
    @endif

    <h3 class="text-base md:text-lg font-bold tracking-tight mb-2.5 leading-snug">{{ $title }}</h3>
    <p class="text-sm leading-relaxed {{ $theme === 'light' || $theme === 'muted' ? 'text-slate-500' : 'text-white/70' }}">{{ $description }}</p>

    @if(isset($footer))
        <div class="mt-6 pt-5 border-t {{ $theme === 'light' || $theme === 'muted' ? 'border-slate-100' : 'border-white/10' }}">
            {{ $footer }}
        </div>
    @endif
</div>
