@php
    $current = request()->path();
    $navLinks = [
        ['href' => '/features',   'label' => 'Capabilities'],
        ['href' => '/families',   'label' => 'Families'],
        ['href' => '/pricing',    'label' => 'Plans'],
        ['href' => '/security',   'label' => 'Protection'],
        ['href' => '/roadmap',    'label' => 'Roadmap'],
        ['href' => '/enterprise', 'label' => 'Partnerships'],
    ];
@endphp


<nav
    x-data="navbar"
    :class="navClasses"
    class="fixed top-0 inset-x-0 z-50 transition-transform duration-300 bg-white border-b border-slate-200 shadow-sm"
    role="navigation"
    aria-label="Main navigation">

    <div class="section-container">
        <div class="flex items-center justify-between h-[68px] md:h-[76px]">

            <!-- Logo -->
            <a href="/" class="flex items-center gap-3 group flex-shrink-0" aria-label="HandleLife OS — home">
                <div class="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center group-hover:bg-teal-600 transition-colors duration-300">
                    <span class="text-white font-black text-base italic leading-none notranslate" aria-hidden="true">H</span>
                </div>
                <div class="flex flex-col leading-none notranslate">
                    <span class="text-slate-950 font-black text-sm uppercase tracking-widest">HandleLife</span>
                    <span class="text-teal-600 font-bold text-[9px] uppercase tracking-[0.25em] mt-0.5">OS</span>
                </div>
            </a>

            <!-- Desktop nav links -->
            <div class="hidden md:flex items-center gap-8" role="menubar">
                @foreach($navLinks as $link)
                    @php $active = ('/' . ltrim($link['href'], '/')) === ('/' . $current); @endphp
                    <a href="{{ $link['href'] }}"
                       role="menuitem"
                       class="relative text-xs font-semibold uppercase tracking-widest transition-colors duration-200 py-1
                              {{ $active ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900' }}">
                        {{ $link['label'] }}
                        @if($active)
                            <span class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></span>
                        @endif
                    </a>
                @endforeach
            </div>

            <!-- Desktop: Language Selector + CTA -->
            <div class="hidden md:flex items-center gap-2">

                <!-- Language picker -->
                <div x-data="langSwitcher" class="relative" @click.outside="close()">
                    <button
                        @click="toggle()"
                        :aria-expanded="open.toString()"
                        aria-label="Select language"
                        class="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200 notranslate">
                        <span x-text="current.flag" class="text-base leading-none" aria-hidden="true"></span>
                        <span x-text="current.code.split('-')[0].toUpperCase()" class="tabular-nums"></span>
                        <svg class="w-3 h-3 transition-transform duration-200 flex-shrink-0"
                             :class="open ? 'rotate-180' : ''"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>

                    <!-- Dropdown -->
                    <div
                        x-show="open"
                        x-cloak
                        x-transition:enter="transition ease-out duration-200"
                        x-transition:enter-start="opacity-0 scale-95 -translate-y-1"
                        x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-150"
                        x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                        x-transition:leave-end="opacity-0 scale-95 -translate-y-1"
                        class="lang-dropdown absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden overflow-y-auto z-50 py-1.5"
                        style="max-height: 340px"
                        role="listbox"
                        aria-label="Choose language">

                        <template x-for="lang in languages" :key="lang.code">
                            <button
                                @click="select(lang)"
                                role="option"
                                :aria-selected="current.code === lang.code"
                                class="notranslate w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150"
                                :class="current.code === lang.code
                                    ? 'bg-teal-50 text-teal-700 font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50 font-medium'">
                                <span x-text="lang.flag" class="text-base flex-shrink-0" aria-hidden="true"></span>
                                <span x-text="lang.native" class="text-left flex-1"></span>
                                <svg x-show="current.code === lang.code"
                                     class="w-3.5 h-3.5 flex-shrink-0 text-teal-500"
                                     fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </template>
                    </div>
                </div>

                <!-- CTA -->
                <x-button href="/waitlist" variant="teal" size="md" ariaLabel="Join the HandleLife OS waitlist">
                    Get early access
                </x-button>
            </div>

            <!-- Mobile hamburger -->
            <button
                @click="toggle()"
                :aria-expanded="open.toString()"
                aria-label="Toggle navigation menu"
                class="md:hidden relative w-8 h-8 flex items-center justify-center text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg">
                <span class="sr-only">Menu</span>
                <span class="absolute block w-5 h-0.5 bg-current transition-all duration-300"
                      :class="open ? 'rotate-45' : '-translate-y-1.5'"></span>
                <span class="absolute block w-5 h-0.5 bg-current transition-all duration-300"
                      :class="open ? 'opacity-0 scale-x-0' : ''"></span>
                <span class="absolute block w-5 h-0.5 bg-current transition-all duration-300"
                      :class="open ? '-rotate-45' : 'translate-y-1.5'"></span>
            </button>
        </div>
    </div>

    <!-- Mobile menu -->
    <div
        x-show="open"
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0 -translate-y-2"
        x-transition:enter-end="opacity-100 translate-y-0"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 translate-y-0"
        x-transition:leave-end="opacity-0 -translate-y-2"
        class="md:hidden bg-white border-b border-slate-100 shadow-lg"
        x-cloak>
        <div class="section-container py-6 space-y-1">
            @foreach($navLinks as $link)
                @php $active = ('/' . ltrim($link['href'], '/')) === ('/' . $current); @endphp
                <a href="{{ $link['href'] }}"
                   @click="close()"
                   class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150
                          {{ $active ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50' }}">
                    @if($active)
                        <span class="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0"></span>
                    @else
                        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"></span>
                    @endif
                    {{ $link['label'] }}
                </a>
            @endforeach
            <a href="/about" @click="close()"
               class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-150">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"></span>
                Our Mission
            </a>

            <!-- Mobile language picker -->
            <div x-data="langSwitcher" class="pt-3 pb-1">
                <p class="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 notranslate">Language</p>
                <div class="lang-dropdown overflow-x-auto flex gap-2 px-4 pb-1 snap-x snap-mandatory" style="scrollbar-width: none">
                    <template x-for="lang in languages" :key="lang.code">
                        <button
                            @click="select(lang)"
                            class="notranslate flex-shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 border"
                            :class="current.code === lang.code
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : 'text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
                            <span x-text="lang.flag" aria-hidden="true"></span>
                            <span x-text="lang.native"></span>
                        </button>
                    </template>
                </div>
            </div>

            <div class="pt-3 pb-2 flex flex-col gap-3">
                <x-button href="/waitlist" variant="teal" size="lg" class="w-full text-center justify-center" ariaLabel="Join the waitlist">
                    Get early access
                </x-button>
                <x-button href="/contact" variant="outline" size="lg" class="w-full text-center justify-center" ariaLabel="Contact us">
                    Talk to us
                </x-button>
            </div>
        </div>
    </div>
</nav>
