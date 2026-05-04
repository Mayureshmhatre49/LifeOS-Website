<footer class="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900" role="contentinfo">
    <div class="section-container">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">

            <!-- Brand -->
            <div class="col-span-2">
                <a href="/" class="inline-flex items-center gap-3 mb-6 group" aria-label="HandleLife OS home">
                    <div class="w-9 h-9 bg-white rounded-xl flex items-center justify-center group-hover:bg-teal-500 transition-colors duration-300">
                        <span class="text-slate-950 font-black text-base italic leading-none notranslate">H</span>
                    </div>
                    <div class="flex flex-col leading-none notranslate">
                        <span class="text-white font-black text-sm uppercase tracking-widest">HandleLife</span>
                        <span class="text-teal-400 font-bold text-[9px] uppercase tracking-[0.25em] mt-0.5">OS</span>
                    </div>
                </a>
                <p class="text-sm leading-relaxed text-slate-500 font-medium max-w-xs mb-6">
                    AI built for real people — helping you handle everyday life with clarity, confidence, and less stress.
                </p>
                <span class="trust-pill">
                    <span class="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" aria-hidden="true"></span>
                    Privacy-first architecture
                </span>
            </div>

            <!-- The OS -->
            <div>
                <h3 class="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">The OS</h3>
                <ul class="space-y-3 text-sm font-medium" role="list">
                    <li><a href="/features"  class="hover:text-white transition-colors duration-150">Capabilities</a></li>
                    <li><a href="/families"  class="hover:text-white transition-colors duration-150">Families</a></li>
                    <li><a href="/security"  class="hover:text-white transition-colors duration-150">Protection</a></li>
                    <li><a href="/pricing"   class="hover:text-white transition-colors duration-150">Pricing</a></li>
                </ul>
            </div>

            <!-- Connect -->
            <div>
                <h3 class="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">Connect</h3>
                <ul class="space-y-3 text-sm font-medium" role="list">
                    <li><a href="/enterprise" class="hover:text-white transition-colors duration-150">Partnerships</a></li>
                    <li><a href="/contact"    class="hover:text-white transition-colors duration-150">Contact</a></li>
                    <li><a href="/waitlist"   class="hover:text-white transition-colors duration-150">Early Access</a></li>
                </ul>
            </div>

            <!-- Company -->
            <div>
                <h3 class="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">Company</h3>
                <ul class="space-y-3 text-sm font-medium" role="list">
                    <li><a href="/about" class="hover:text-white transition-colors duration-150">Our Mission</a></li>
                    <li><a href="/blog"  class="hover:text-white transition-colors duration-150">Resources</a></li>
                </ul>
            </div>

            <!-- Legal -->
            <div>
                <h3 class="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">Legal</h3>
                <ul class="space-y-3 text-sm font-medium" role="list">
                    <li><a href="{{ route('privacy') }}" class="hover:text-white transition-colors duration-150">Privacy Policy</a></li>
                    <li><a href="{{ route('terms') }}"   class="hover:text-white transition-colors duration-150">Terms of Service</a></li>
                </ul>
            </div>
        </div>

        <!-- Bottom bar -->
        <div class="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">

            <div class="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-medium text-slate-600">
                <span class="notranslate">© {{ date('Y') }} HandleLife OS. All rights reserved.</span>

                <!-- Footer language switcher -->
                <div x-data="langSwitcher" class="relative notranslate" @click.outside="close()">
                    <button
                        @click="toggle()"
                        :aria-expanded="open.toString()"
                        aria-label="Select language"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 text-slate-500 hover:text-slate-300 transition-colors duration-150">
                        <!-- Globe icon -->
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                        </svg>
                        <span x-text="current.flag" class="text-sm" aria-hidden="true"></span>
                        <span x-text="current.native" class="text-[11px] font-semibold uppercase tracking-wider max-w-[5rem] truncate"></span>
                        <svg class="w-3 h-3 transition-transform duration-200 flex-shrink-0"
                             :class="open ? 'rotate-180' : ''"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>

                    <!-- Dropdown (opens upward) -->
                    <div
                        x-show="open"
                        x-cloak
                        x-transition:enter="transition ease-out duration-200"
                        x-transition:enter-start="opacity-0 scale-95 translate-y-1"
                        x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-150"
                        x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                        x-transition:leave-end="opacity-0 scale-95 translate-y-1"
                        class="lang-dropdown absolute bottom-full mb-2 left-0 w-52 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden overflow-y-auto z-50 py-1.5 shadow-2xl"
                        style="max-height: 300px"
                        role="listbox"
                        aria-label="Choose language">

                        <template x-for="lang in languages" :key="lang.code">
                            <button
                                @click="select(lang)"
                                role="option"
                                :aria-selected="current.code === lang.code"
                                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150"
                                :class="current.code === lang.code
                                    ? 'bg-teal-900/40 text-teal-300 font-semibold'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'">
                                <span x-text="lang.flag" class="text-base flex-shrink-0" aria-hidden="true"></span>
                                <span x-text="lang.native" class="text-left flex-1"></span>
                                <svg x-show="current.code === lang.code"
                                     class="w-3.5 h-3.5 flex-shrink-0 text-teal-400"
                                     fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </template>
                    </div>
                </div>
            </div>

            <p class="text-xs font-medium text-slate-700 italic">Built for a clearer world.</p>
        </div>
    </div>
</footer>
