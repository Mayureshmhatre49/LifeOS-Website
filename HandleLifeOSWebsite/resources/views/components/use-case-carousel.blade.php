<div x-data="{ 
        active: 0, 
        items: [
            { text: 'Compare phone plans instantly', icon: '📱' },
            { text: 'Check scam messages in seconds', icon: '🛡️' },
            { text: 'Organize family tasks with ease', icon: '👨‍👩‍👧‍👦' },
            { text: 'Reduce monthly waste, effortlessly', icon: '📉' },
            { text: 'Plan your day in just 30 seconds', icon: '📅' },
            { text: 'Manage bills and due dates, wherever you live', icon: '📋' },
            { text: 'Navigate life in a new place', icon: '🌍' }
        ],
        next() { this.active = (this.active + 1) % this.items.length }
    }" 
    x-init="setInterval(() => next(), 5000)"
    class="relative h-20 w-full max-w-xl overflow-hidden flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-10 shadow-[inner_0_2px_4px_rgba(255,255,255,0.05)] group">
    
    <div class="flex items-center space-x-6 w-full relative">
        <template x-for="(item, index) in items" :key="index">
            <div 
                x-show="active === index"
                x-transition:enter="transition ease-out duration-700 delay-300"
                x-transition:enter-start="opacity-0 translate-y-8"
                x-transition:enter-end="opacity-100 translate-y-0"
                x-transition:leave="transition ease-in duration-500"
                x-transition:leave-start="opacity-100 translate-y-0"
                x-transition:leave-end="opacity-0 -translate-y-8"
                class="absolute inset-0 flex items-center space-x-6 h-full"
            >
                <div class="flex-shrink-0 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-premium border border-white/10" x-text="item.icon"></div>
                <div class="text-lg md:text-xl font-bold font-heading text-white tracking-tight" x-text="item.text"></div>
            </div>
        </template>
    </div>

    <!-- Indicator Dots (Premium Touch) -->
    <div class="absolute right-8 flex flex-col space-y-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
        <template x-for="(item, index) in items" :key="'dot-'+index">
            <div 
                :class="active === index ? 'bg-teal-400 h-3' : 'bg-white/40 h-1'"
                class="w-1 rounded-full transition-all duration-500"
            ></div>
        </template>
    </div>
</div>
