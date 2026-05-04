@props([
    'variant'   => 'solid',   // solid | teal | ghost | outline | white
    'size'      => 'md',      // sm | md | lg | xl
    'href'      => null,
    'type'      => 'button',
    'ariaLabel' => null,
    'external'  => false,
])

@php
    /**
     * Premium button system — consistent rhythm, subtle elevation,
     * physical feedback on press.
     */
    $base = 'group relative inline-flex items-center justify-center font-semibold tracking-tight whitespace-nowrap '
          . 'transition-[transform,box-shadow,background-color,color] duration-200 ease-out '
          . 'active:scale-[0.97] active:transition-none '
          . 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 '
          . 'disabled:opacity-50 disabled:pointer-events-none select-none will-change-transform';

    $variants = [
        'solid'   => 'bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-950 '
                   . 'shadow-[0_1px_2px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.10)] '
                   . 'hover:shadow-[0_2px_4px_rgba(15,23,42,0.10),0_12px_28px_rgba(15,23,42,0.18)] hover:-translate-y-px',

        'teal'    => 'bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-400 hover:to-teal-500 '
                   . 'focus-visible:ring-teal-500 focus-visible:ring-offset-white '
                   . 'shadow-[0_1px_2px_rgba(13,148,136,0.20),0_8px_24px_rgba(13,148,136,0.22)] '
                   . 'hover:shadow-[0_2px_4px_rgba(13,148,136,0.20),0_16px_36px_rgba(13,148,136,0.32)] hover:-translate-y-px '
                   . 'before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none',

        'ghost'   => 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',

        'outline' => 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 '
                   . 'focus-visible:ring-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.04)] '
                   . 'hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-px',

        'white'   => 'bg-white text-slate-950 hover:bg-slate-50 focus-visible:ring-white focus-visible:ring-offset-slate-900 '
                   . 'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)] '
                   . 'hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.18)] hover:-translate-y-px',
    ];

    $sizes = [
        'sm' => 'px-4 py-2 text-xs rounded-xl gap-1.5 leading-none',
        'md' => 'px-5 py-2.5 text-sm rounded-xl gap-2 leading-none',
        'lg' => 'px-6 py-3.5 text-sm rounded-2xl gap-2 leading-none',
        'xl' => 'px-8 py-4 text-[15px] rounded-2xl gap-2.5 leading-none',
    ];

    $cls = "$base {$variants[$variant]} {$sizes[$size]}";
@endphp

@if($href)
    <a
        href="{{ $href }}"
        @if($ariaLabel) aria-label="{{ $ariaLabel }}" @endif
        @if($external) target="_blank" rel="noopener noreferrer" @endif
        {{ $attributes->merge(['class' => $cls]) }}
    ><span class="relative flex items-center gap-[inherit]">{{ $slot }}</span></a>
@else
    <button
        type="{{ $type }}"
        @if($ariaLabel) aria-label="{{ $ariaLabel }}" @endif
        {{ $attributes->merge(['class' => $cls]) }}
    ><span class="relative flex items-center gap-[inherit]">{{ $slot }}</span></button>
@endif
