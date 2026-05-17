@props([
    'padding'    => 'py-20 md:py-28',
    'bg'         => '',
    'id'         => null,
    'container'  => true,
])

<section
    @if($id) id="{{ $id }}" @endif
    {{ $attributes->merge(['class' => trim("$padding $bg")]) }}>
    @if($container)
        <div class="section-container">
            {{ $slot }}
        </div>
    @else
        {{ $slot }}
    @endif
</section>
