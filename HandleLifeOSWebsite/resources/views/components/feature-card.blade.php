@props([
    'title',
    'description',
    'icon'  => null,
    'span'  => '',
    'theme' => 'light',   // light | dark | teal | muted
])

@php
    $themes = [
        'light' => 'bg-white border border-slate-200 text-slate-900 shadow-card hover:shadow-card-hover',
        'muted' => 'bg-slate-50 border border-slate-100 text-slate-900 shadow-card hover:shadow-card-hover',
        'dark'  => 'bg-slate-900 border border-slate-800 text-white ring-inset-white',
        'teal'  => 'bg-teal-600 border border-teal-500 text-white',
    ];

    $iconBg = [
        'light' => 'bg-slate-100 border-slate-200 text-slate-700',
        'muted' => 'bg-white border-slate-200 text-slate-700',
        'dark'  => 'bg-white/10 border-white/10 text-white',
        'teal'  => 'bg-white/15 border-white/15 text-white',
    ];
@endphp

<div {{ $attributes->merge(['class' => "relative group $span p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 " . $themes[$theme]]) }}>

    @if($icon)
        <div class="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl mb-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 {{ $iconBg[$theme] }}"
             aria-hidden="true">
            {{ $icon }}
        </div>
    @endif

    <h3 class="text-lg font-bold tracking-tight mb-3 leading-snug">{{ $title }}</h3>
    <p class="text-sm leading-relaxed {{ $theme === 'light' || $theme === 'muted' ? 'text-slate-500' : 'text-white/70' }}">{{ $description }}</p>

    @if(isset($footer))
        <div class="mt-6 pt-5 border-t {{ $theme === 'light' || $theme === 'muted' ? 'border-slate-100' : 'border-white/10' }}">
            {{ $footer }}
        </div>
    @endif
</div>
