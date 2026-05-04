@props([
    'variant'   => 'solid',   // solid | teal | ghost | outline | white
    'size'      => 'md',      // sm | md | lg | xl
    'href'      => null,
    'type'      => 'button',
    'ariaLabel' => null,
    'external'  => false,
])

@php
    $base = 'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    $variants = [
        'solid'   => 'bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-950 shadow-sm hover:shadow-md',
        'teal'    => 'bg-teal-600 text-white hover:bg-teal-500 focus-visible:ring-teal-600 shadow-sm hover:shadow-teal',
        'ghost'   => 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',
        'outline' => 'bg-transparent border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-300',
        'white'   => 'bg-white text-slate-950 hover:bg-slate-100 focus-visible:ring-white shadow-sm hover:shadow-md',
    ];

    $sizes = [
        'sm' => 'px-4 py-2 text-xs rounded-xl gap-1.5',
        'md' => 'px-5 py-2.5 text-sm rounded-xl gap-2',
        'lg' => 'px-6 py-3 text-sm rounded-2xl gap-2',
        'xl' => 'px-8 py-4 text-sm rounded-2xl gap-2.5',
    ];

    $cls = "$base {$variants[$variant]} {$sizes[$size]}";
@endphp

@if($href)
    <a
        href="{{ $href }}"
        @if($ariaLabel) aria-label="{{ $ariaLabel }}" @endif
        @if($external) target="_blank" rel="noopener noreferrer" @endif
        {{ $attributes->merge(['class' => $cls]) }}
    >{{ $slot }}</a>
@else
    <button
        type="{{ $type }}"
        @if($ariaLabel) aria-label="{{ $ariaLabel }}" @endif
        {{ $attributes->merge(['class' => $cls]) }}
    >{{ $slot }}</button>
@endif
