@props([
    'name',
    'size'   => 24,
    'stroke' => 1.5,
    'class'  => '',
])

@php
    /**
     * HandleLife OS — Premium Icon System
     *
     * Design rules:
     *  • 24×24 viewBox, designed on a 1px optical grid
     *  • stroke-linecap: round, stroke-linejoin: round
     *  • currentColor — inherits text color
     *  • 1.5px stroke baseline (override via :stroke)
     *  • Open paths only — no fills, no gradients (depth comes from container)
     */

    $icons = [
        // ── Navigation / structural ──────────────────────────────────────
        'home'           => '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
        'briefcase'      => '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12h18"/>',
        'graduation-cap' => '<path d="M2 9.5 12 5l10 4.5L12 14 2 9.5Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9.5V14"/>',
        'globe'          => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18"/>',
        'user-elder'     => '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/><path d="M9 7c1-1 2-1.5 3-1.5"/>',
        'heart'          => '<path d="M12 20.5c-3-2-9-6.2-9-11A4.5 4.5 0 0 1 7.5 5c1.7 0 3.3.8 4.5 2.2A6 6 0 0 1 16.5 5 4.5 4.5 0 0 1 21 9.5c0 4.8-6 9-9 11Z"/>',
        'shield'         => '<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
        'sprout'         => '<path d="M12 21V12"/><path d="M12 12C8.5 12 6 9.5 6 6c3.5 0 6 2.5 6 6Z"/><path d="M12 14c3.5 0 6-2.5 6-6-3.5 0-6 2.5-6 6Z"/>',
        'leaf'           => '<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 12-9 0 8-4 12-9 12-2 0-4-1-4-3"/><path d="M2 21c2-4.5 5-7 8-9"/>',
        'calendar'       => '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
        'credit-card'    => '<rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M2 11h20"/><path d="M6 16h4"/>',
        'trend-down'     => '<path d="M3 6h18"/><path d="m21 6-7.5 9-4-4L3 18"/><path d="M21 6v6"/><path d="M21 6h-6"/>',
        'chart-bar'      => '<path d="M3 21V5"/><path d="M3 21h18"/><rect x="7" y="13" width="3" height="6" rx="0.5"/><rect x="12" y="9" width="3" height="10" rx="0.5"/><rect x="17" y="5" width="3" height="14" rx="0.5"/>',
        'cloud'          => '<path d="M7 18a5 5 0 0 1-1-9.9A6 6 0 0 1 17.5 9 4.5 4.5 0 0 1 17 18H7Z"/>',
        'orbit'          => '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(45 12 12)"/>',
        'shopping-cart'  => '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.5 12h12l2-8H6.5"/>',
        'phone'          => '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 19h2"/>',
        'users-family'   => '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M14 19a5 5 0 0 1 7 0"/>',
        'building'       => '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/>',
        'bank'           => '<path d="M3 9 12 4l9 5"/><path d="M5 9v9"/><path d="M9 9v9"/><path d="M15 9v9"/><path d="M19 9v9"/><path d="M3 21h18"/>',
        'stethoscope'    => '<path d="M5 4v6a4 4 0 0 0 8 0V4"/><path d="M7 4h-2M11 4h2"/><path d="M9 14v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4v-2"/><circle cx="17" cy="13" r="2"/>',
        'school'         => '<path d="M3 11 12 6l9 5"/><path d="M5 13v5l7 3 7-3v-5"/><path d="M3 11l9 5 9-5"/>',
        'sparkles'       => '<path d="M12 4v3M12 17v3M4 12h3M17 12h3"/><path d="m6.5 6.5 2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/>',
        'lock'           => '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        'check'          => '<path d="m4 12 5 5L20 6"/>',
        'check-circle'   => '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-5"/>',
        'arrow-right'    => '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
        'arrow-up-right' => '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
        'plus'           => '<path d="M12 5v14"/><path d="M5 12h14"/>',
        'sun'            => '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
        'bolt'           => '<path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/>',
        'message'        => '<path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z"/>',
        'compass'        => '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.4 5-5 2.4 2.4-5 5-2.4Z"/>',
        'star'           => '<path d="m12 3 2.6 6 6.4.5-4.8 4.4 1.4 6.4L12 17l-5.6 3.3 1.4-6.4L3 9.5 9.4 9 12 3Z"/>',
        'wallet'         => '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><path d="M16 14h2"/><path d="M3 6V5a2 2 0 0 1 2-2h11"/>',
        'eye'            => '<path d="M2 12c2.5-4.5 6-7 10-7s7.5 2.5 10 7c-2.5 4.5-6 7-10 7s-7.5-2.5-10-7Z"/><circle cx="12" cy="12" r="2.5"/>',
    ];

    $svg = $icons[$name] ?? '';
@endphp

@if($svg)
<svg xmlns="http://www.w3.org/2000/svg"
     width="{{ $size }}"
     height="{{ $size }}"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="{{ $stroke }}"
     stroke-linecap="round"
     stroke-linejoin="round"
     aria-hidden="true"
     focusable="false"
     class="{{ $class }}">
    {!! $svg !!}
</svg>
@endif
