<x-app-layout :title="$title" :description="$description ?? null" :keywords="$keywords ?? null" :robots="$robots ?? null">

    @push('head')
    <style>[data-price-inr]{visibility:hidden}</style>
    @endpush

    {{-- ── Per-page Structured Data (Breadcrumb + FAQ + Product) ─────────── --}}
    @push('schema')
        <x-schema type="breadcrumb" :data="[
            ['name' => 'Home',    'url' => '/'],
            ['name' => 'Pricing', 'url' => '/pricing'],
        ]" />
        <x-schema type="faq" :data="[
            ['q' => 'Is HandleLife OS really free to start?',
             'a' => 'Yes. The Free plan is free forever — no credit card required. You can upgrade to Lite, Plus, or Family anytime.'],
            ['q' => 'Can I cancel anytime?',
             'a' => 'Yes. There are no long-term contracts, no penalties, and no dark patterns. Switch plans or cancel with one click from your dashboard.'],
            ['q' => 'What currencies does HandleLife OS support?',
             'a' => 'We support 20 currencies at display — including USD, EUR, GBP, INR, AED, BRL, JPY, and more. Pricing is shown in your local currency automatically.'],
            ['q' => 'Is HandleLife OS available globally?',
             'a' => 'Yes. HandleLife OS is available worldwide and supports 20 languages. Our privacy standards meet GDPR, CCPA, PDPA, and other major data-protection frameworks globally.'],
            ['q' => 'How is my data protected?',
             'a' => 'All personal data is encrypted with AES-256 end-to-end. We use a zero-knowledge architecture — even our team cannot read your private content. Your data is never sold or used to train models.'],
            ['q' => 'Do yearly plans save money?',
             'a' => 'Yes. Yearly plans offer a 20% discount compared to monthly billing. You keep access for the full period if you decide to cancel.'],
        ]" />
        <x-schema type="product" :data="[
            'name'        => 'HandleLife OS',
            'description' => 'AI-powered personal life operating system. Reduce mental load and handle life with calm clarity.',
            'image'       => asset('images/og-main.png'),
            'brand'       => ['@type' => 'Brand', 'name' => 'HandleLife OS'],
            'offers'      => [
                '@type'       => 'AggregateOffer',
                'lowPrice'    => '0',
                'highPrice'   => '39',
                'priceCurrency' => 'USD',
                'offerCount'  => 3,
                'availability'=> 'https://schema.org/PreOrder',
            ],
        ]" />
    @endpush

    <div id="pricing-section" class="bg-white">
        
        {{-- 1. HERO PRICING HEADER --}}
        <section class="pt-32 pb-20 px-6">
            <div class="max-w-4xl mx-auto text-center">
                <nav class="flex justify-center mb-8" aria-label="Breadcrumb">
                    <ol class="flex items-center space-x-2 text-sm font-medium text-slate-500">
                        <li><a href="/" class="hover:text-teal-600 transition-colors">Home</a></li>
                        <li>
                            <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </li>
                        <li class="text-slate-900 font-semibold">Pricing</li>
                    </ol>
                </nav>
                
                <h1 class="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 font-heading">
                    Choose the plan that helps <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">life run better</span>
                </h1>
                
                <p class="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                    From personal growth to family coordination, HandleLife OS gives you clarity, structure, and intelligent support.
                </p>

                {{-- Toggle --}}
                <div class="flex flex-col items-center gap-4">
                    <div class="inline-flex items-center p-1 bg-slate-100 rounded-2xl shadow-inner border border-slate-200" id="billing-toggle">
                        <button 
                            data-cycle="monthly"
                            class="billing-btn active px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-teal-500/20 bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        >
                            Monthly
                        </button>
                        <button 
                            data-cycle="yearly"
                            class="billing-btn px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-teal-500/20 relative text-slate-500 hover:text-slate-700"
                        >
                            Yearly
                            <span class="absolute -top-3 -right-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-emerald ring-2 ring-white">SAVE 20%</span>
                        </button>
                    </div>
                    
                    <p class="text-xs font-semibold text-slate-400 flex items-center gap-3">
                        <span>Cancel anytime</span>
                        <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Secure payments</span>
                        <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Upgrade anytime</span>
                    </p>
                </div>
            </div>
        </section>

        {{-- 2. PRICING CARDS (4 CORE PLANS) --}}
        <section class="pb-24 px-6 overflow-hidden">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    
                    {{-- PLAN 1: FREE --}}
                    <div class="flex flex-col bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-500 group">
                        <div class="mb-8">
                            <h3 class="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">Start Better</h3>
                            <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-md uppercase tracking-widest mb-3">Free tier</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-4xl font-black text-slate-900" data-price-inr="0">₹0</span>
                                <span class="text-slate-400 text-sm font-medium">/forever</span>
                            </div>
                            <p class="text-slate-400 text-sm mt-2">Essential Life Dashboard</p>
                        </div>
                        
                        <div class="space-y-4 mb-10 flex-grow">
                            @foreach([
                                'Basic Life Dashboard',
                                '30 AI Credits / month',
                                'Daily planning help',
                                'Habit reminders',
                                'Limited advisor access',
                                'Single user profile'
                            ] as $feature)
                                <div class="flex items-start gap-3">
                                    <div class="mt-1 w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:border-teal-200 group-hover:bg-teal-50 transition-colors">
                                        <svg class="w-3 h-3 text-slate-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-600 leading-tight">{{ $feature }}</span>
                                </div>
                            @endforeach
                        </div>
                        
                        <a href="{{ route('waitlist') }}" class="inline-flex items-center justify-center px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-200 hover:-translate-y-1">
                            Get Started Free
                        </a>
                    </div>

                    {{-- PLAN 2: LITE --}}
                    <div class="flex flex-col bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-500 group relative">
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span class="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200 whitespace-nowrap">Most Popular for Individuals</span>
                        </div>
                        <div class="mb-8 mt-2">
                            <h3 class="text-teal-600 text-xs font-bold uppercase tracking-[0.2em] mb-1">Personal Growth</h3>
                            <span class="inline-block px-2 py-0.5 bg-teal-50 text-teal-400 text-[9px] font-bold rounded-md uppercase tracking-widest mb-3">Lite plan</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-4xl font-black text-slate-900 price-value" data-price-inr="199" data-monthly-inr="199" data-yearly-inr="1999">₹199</span>
                                <span class="text-slate-400 text-sm font-medium period-value">/month</span>
                            </div>
                            <p class="text-slate-400 text-sm mt-2">Scale your personal output</p>
                        </div>
                        
                        <div class="space-y-4 mb-10 flex-grow">
                            @foreach([
                                '300 AI Credits',
                                'Smart planning assistant',
                                'Career & finance nudges',
                                'Mood & productivity insights',
                                'Priority responses',
                                'Basic reports'
                            ] as $feature)
                                <div class="flex items-start gap-3">
                                    <div class="mt-1 w-5 h-5 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-600 leading-tight">{{ $feature }}</span>
                                </div>
                            @endforeach
                        </div>
                        
                        <a href="{{ route('waitlist') }}" class="inline-flex items-center justify-center px-6 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all duration-300 shadow-lg shadow-teal-100 hover:-translate-y-1">
                            Start Lite
                        </a>
                    </div>

                    {{-- PLAN 3: PLUS --}}
                    <div class="flex flex-col bg-slate-950 border-2 border-teal-500 rounded-[2.5rem] p-8 shadow-2xl relative group transform scale-105 z-10">
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span class="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-teal-500/30 whitespace-nowrap">Best Value</span>
                        </div>
                        <div class="mb-8 mt-2">
                            <h3 class="text-teal-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Life Manager</h3>
                            <span class="inline-block px-2 py-0.5 bg-teal-500/15 text-teal-400 text-[9px] font-bold rounded-md uppercase tracking-widest mb-3">Plus plan</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-4xl font-black text-white price-value" data-price-inr="499" data-monthly-inr="499" data-yearly-inr="4999">₹499</span>
                                <span class="text-slate-500 text-sm font-medium period-value">/month</span>
                            </div>
                            <p class="text-slate-400 text-sm mt-2">The complete AI life system</p>
                        </div>
                        
                        <div class="space-y-4 mb-10 flex-grow">
                            @foreach([
                                '1,500 AI Credits',
                                'Full Life Dashboard',
                                'Goal execution system',
                                'Finance organizer',
                                'Family planner',
                                'File uploads',
                                'Weekly AI summaries',
                                'Deep decision support'
                            ] as $feature)
                                <div class="flex items-start gap-3">
                                    <div class="mt-1 w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-300 leading-tight">{{ $feature }}</span>
                                </div>
                            @endforeach
                        </div>
                        
                        <a href="{{ route('waitlist') }}" class="inline-flex items-center justify-center px-6 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-400 transition-all duration-300 shadow-xl shadow-teal-500/20 hover:-translate-y-1">
                            Choose Plus
                        </a>
                    </div>

                    {{-- PLAN 4: FAMILY --}}
                    <div class="flex flex-col bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-500 group relative">
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span class="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200 whitespace-nowrap">For Households</span>
                        </div>
                        <div class="mb-8 mt-2">
                            <h3 class="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-1">Household OS</h3>
                            <span class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-400 text-[9px] font-bold rounded-md uppercase tracking-widest mb-3">Family plan</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-4xl font-black text-slate-900 price-value" data-price-inr="999" data-monthly-inr="999" data-yearly-inr="9999">₹999</span>
                                <span class="text-slate-400 text-sm font-medium period-value">/month</span>
                            </div>
                            <p class="text-slate-400 text-sm mt-2">Sync the entire family unit</p>
                        </div>
                        
                        <div class="space-y-4 mb-10 flex-grow">
                            @foreach([
                                'Up to 5 members',
                                'Shared tasks & calendars',
                                'Parent care reminders',
                                'Child routine planning',
                                'Expense organization',
                                'Family AI assistant',
                                'Shared wellness insights'
                            ] as $feature)
                                <div class="flex items-start gap-3">
                                    <div class="mt-1 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <span class="text-sm font-medium text-slate-600 leading-tight">{{ $feature }}</span>
                                </div>
                            @endforeach
                        </div>
                        
                        <a href="{{ route('waitlist') }}" class="inline-flex items-center justify-center px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 hover:-translate-y-1">
                            Choose Family
                        </a>
                    </div>

                </div>
            </div>
        </section>

        {{-- 3. PREMIUM SECTION --}}
        <section class="py-24 bg-slate-50">
            <div class="max-w-5xl mx-auto px-6">
                <div class="relative overflow-hidden bg-white border border-slate-200 rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col md:flex-row items-center gap-12 group">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div class="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                    
                    <div class="flex-1 text-center md:text-left z-10">
                        <h3 class="text-teal-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Need a Personal Chief of Staff?</h3>
                        <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-6 font-heading">Founder-level support for high achievers.</h2>
                        <div class="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
                            @foreach(['Unlimited Usage', 'Priority Concierge', 'Executive Planning'] as $badge)
                                <span class="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200/50">{{ $badge }}</span>
                            @endforeach
                        </div>
                        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            @foreach([
                                'Fair unlimited usage',
                                'Founder mode intelligence',
                                'Executive planning toolkit',
                                'Deep decision engine',
                                'Priority concierge support',
                                'Premium AI models (GPT-4o/Claude 3.5)'
                            ] as $feature)
                                <li class="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                    {{ $feature }}
                                </li>
                            @endforeach
                        </ul>
                    </div>
                    
                    <div class="md:w-72 w-full text-center p-8 bg-slate-950 rounded-[2.5rem] shadow-premium-lg z-10 border border-teal-500/30">
                        <p class="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">Premium Plan</p>
                        <div class="text-4xl font-black text-white mb-2" data-price-inr="1999">₹1,999</div>
                        <p class="text-slate-500 text-xs font-medium mb-8">per month, billed monthly</p>
                        <a href="{{ route('contact') }}" class="block w-full py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-400 transition-all duration-300 shadow-xl shadow-teal-500/20">
                            Talk to Us
                        </a>
                    </div>
                </div>
            </div>
        </section>

        {{-- 4. FEATURE COMPARISON TABLE --}}
        <section class="py-24 px-6">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-4 font-heading tracking-tight">Full capability comparison</h2>
                    <p class="text-slate-500 text-lg">Compare plans clearly and find your perfect fit.</p>
                </div>
                
                <div class="overflow-x-auto pb-4">
                    <table class="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th class="py-6 px-8 bg-white text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100">Feature</th>
                                <th class="py-6 px-8 bg-white text-center text-slate-900 font-bold border-b border-slate-100">Free</th>
                                <th class="py-6 px-8 bg-slate-50 text-center text-slate-900 font-bold border-b border-slate-100 rounded-t-3xl">Lite</th>
                                <th class="py-6 px-8 bg-teal-600 text-center text-white font-bold border-b border-teal-500 rounded-t-3xl">Plus</th>
                                <th class="py-6 px-8 bg-white text-center text-slate-900 font-bold border-b border-slate-100 rounded-t-3xl border-x border-t border-slate-100">Family</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            @php
                                $comparisonData = [
                                    ['AI Credits', '30 / mo', '300 / mo', '1,500 / mo', 'Shared Pool'],
                                    ['Users', '1', '1', '1', 'Up to 5'],
                                    ['Family features', '—', '—', 'Limited', 'Full Suite'],
                                    ['Reports', 'Daily summary', 'Basic insights', 'Deep weekly', 'Shared insights'],
                                    ['Priority support', '—', 'Standard+', 'Priority AI', 'Family Concierge'],
                                    ['File uploads', '—', '—', 'Unlimited', 'Shared Vault'],
                                    ['Advanced AI', 'Basic', 'Smart', 'Elite', 'Family Engine'],
                                    ['Decision support', 'Basic', 'Intermediate', 'Deep Analysis', 'Group Logic'],
                                    ['Shared dashboards', '—', '—', '—', '5 Shared Units'],
                                ];
                            @endphp
                            @foreach($comparisonData as $row)
                                <tr class="group">
                                    <td class="py-5 px-8 font-semibold text-slate-700 border-b border-slate-50 group-hover:text-teal-600 transition-colors">{{ $row[0] }}</td>
                                    <td class="py-5 px-8 text-center text-slate-500 border-b border-slate-50">{{ $row[1] }}</td>
                                    <td class="py-5 px-8 text-center text-slate-700 bg-slate-50/50 border-b border-slate-50">{{ $row[2] }}</td>
                                    <td class="py-5 px-8 text-center text-white bg-teal-600 font-medium border-b border-teal-500/50">{{ $row[3] }}</td>
                                    <td class="py-5 px-8 text-center text-slate-700 border-b border-slate-50 border-x border-slate-100">{{ $row[4] }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {{-- 5. TRUST SECTION --}}
        <section class="py-24 bg-slate-950 text-white relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 pointer-events-none">
                <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
            
            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="flex flex-col lg:flex-row items-center gap-16">
                    <div class="flex-1 text-center lg:text-left">
                        <h2 class="text-3xl md:text-5xl font-black mb-8 font-heading leading-tight">Why people choose <br><span class="text-teal-400">HandleLife OS</span></h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                            @foreach([
                                'Less mental overload' => 'Free up cognitive bandwidth for what matters.',
                                'Better decisions' => 'AI-powered support for life\'s complex choices.',
                                'Stronger routines' => 'Sustainable habits built for your unique lifestyle.',
                                'Family alignment' => 'One central system for the whole household.',
                                'More clarity every week' => 'Know exactly where you stand and where you\'re going.',
                                'Save hours monthly' => 'Automate the administrative overhead of living.'
                            ] as $title => $desc)
                                <div class="space-y-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-2 h-2 rounded-full bg-teal-400"></div>
                                        <h4 class="font-bold text-lg">{{ $title }}</h4>
                                    </div>
                                    <p class="text-slate-400 text-sm pl-5">{{ $desc }}</p>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <div class="lg:w-1/3 w-full">
                        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 text-center">
                            <div class="flex justify-center mb-6">
                                @for($i=0; $i<5; $i++)
                                    <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                @endfor
                            </div>
                            <p class="text-xl font-medium mb-8 italic">"I manage my mother's health, my children's school, and my own work. HandleLife OS is the first thing that actually understands how much I carry."</p>
                            <div class="flex items-center justify-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center font-bold text-teal-400">PS</div>
                                <div class="text-left">
                                    <div class="font-bold">Priya S.</div>
                                    <div class="text-xs text-slate-500">Early Access · Mumbai, India</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {{-- 6. FAQ SECTION --}}
        <section class="py-24 px-6 bg-white">
            <div class="max-w-3xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-4 font-heading tracking-tight">Common questions</h2>
                    <p class="text-slate-500 text-lg">Everything you need to know about our plans.</p>
                </div>
                
                <div class="space-y-4">
                    @php
                        $faqs = [
                            ['q' => 'Is HandleLife OS really free to start?', 'a' => 'Yes. The Free plan is free forever — no credit card required. You can upgrade to Lite, Plus, or Family anytime.'],
                            ['q' => 'Can I cancel anytime?', 'a' => 'Yes. There are no long-term contracts, no penalties, and no dark patterns. Switch plans or cancel with one click from your dashboard.'],
                            ['q' => 'What currencies does HandleLife OS support?', 'a' => 'We support 20 currencies at display — including USD, EUR, GBP, INR, AED, BRL, JPY, and more. Pricing is shown in your local currency automatically.'],
                            ['q' => 'Is HandleLife OS available globally?', 'a' => 'Yes. HandleLife OS is available worldwide and supports 20 languages. Our privacy standards meet GDPR, CCPA, PDPA, and other major data-protection frameworks globally.'],
                            ['q' => 'How is my data protected?', 'a' => 'All personal data is encrypted with AES-256 end-to-end. We use a zero-knowledge architecture — even our team cannot read your private content. Your data is never sold or used to train models.'],
                            ['q' => 'Do yearly plans save money?', 'a' => 'Yes. Yearly plans offer a 20% discount compared to monthly billing. You keep access for the full period if you decide to cancel.'],
                        ];
                    @endphp
                    @foreach($faqs as $faq)
                        <div class="faq-item border border-slate-100 rounded-[2rem] overflow-hidden transition-all duration-300">
                            <button class="faq-trigger w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 group">
                                <span class="trigger-text transition-colors">{{ $faq['q'] }}</span>
                                <div class="icon-wrapper w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </button>
                            <div class="faq-content hidden overflow-hidden">
                                <div class="px-6 pb-6 text-slate-600 leading-relaxed text-sm">
                                    {{ $faq['a'] }}
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>

        {{-- 7. FINAL CTA --}}
        <section class="py-32 px-6">
            <div class="max-w-6xl mx-auto">
                <div class="relative bg-teal-600 rounded-[4rem] p-12 md:p-24 overflow-hidden text-center text-white shadow-2xl shadow-teal-600/20">
                    <div class="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600 opacity-90"></div>
                    <div class="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
                        </svg>
                    </div>
                    
                    <div class="relative z-10 max-w-2xl mx-auto">
                        <h2 class="text-3xl md:text-6xl font-black mb-8 font-heading leading-tight">Life gets easier when it runs on a system.</h2>
                        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="{{ route('waitlist') }}" class="w-full sm:w-auto px-10 py-5 bg-white text-teal-600 font-black rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-xl hover:-translate-y-1">
                                Join Free
                            </a>
                            <a href="{{ route('features') }}" class="w-full sm:w-auto px-10 py-5 bg-teal-700/30 backdrop-blur-md text-white border border-white/20 font-black rounded-2xl hover:bg-teal-700/50 transition-all duration-300">
                                See how it works
                            </a>
                        </div>
                        <p class="mt-12 text-teal-100 text-sm font-medium opacity-80">Join 50,000+ people handling life with clarity.</p>
                    </div>
                </div>
            </div>
        </section>

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 1. BILLING TOGGLE — reads base INR amounts, converts to visitor currency
            var toggle = document.getElementById('billing-toggle');
            if (toggle) {
                var btns        = toggle.querySelectorAll('.billing-btn');
                var priceValues = document.querySelectorAll('.price-value');
                var periodValues = document.querySelectorAll('.period-value');

                btns.forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var cycle = this.dataset.cycle;

                        btns.forEach(function(b) {
                            b.classList.remove('active', 'bg-white', 'text-slate-900', 'shadow-sm', 'border', 'border-slate-200/50');
                            b.classList.add('text-slate-500', 'hover:text-slate-700');
                        });
                        this.classList.add('active', 'bg-white', 'text-slate-900', 'shadow-sm', 'border', 'border-slate-200/50');
                        this.classList.remove('text-slate-500', 'hover:text-slate-700');

                        // Convert base INR amount to visitor currency
                        priceValues.forEach(function(pv) {
                            var inrKey = cycle === 'monthly' ? 'monthlyInr' : 'yearlyInr';
                            var inr = parseFloat(pv.dataset[inrKey]);
                            if (!isNaN(inr)) pv.textContent = _formatPrice(inr, _getSaved());
                            // Keep data-price-inr in sync so _applyPrices() stays consistent
                            pv.setAttribute('data-price-inr', pv.dataset[inrKey]);
                        });

                        periodValues.forEach(function(pv) {
                            pv.textContent = cycle === 'monthly' ? '/month' : '/year';
                        });
                    });
                });
            }

            // 2. FAQ ACCORDION
            const faqTriggers = document.querySelectorAll('.faq-trigger');
            faqTriggers.forEach(trigger => {
                trigger.addEventListener('click', function() {
                    const item = this.parentElement;
                    const content = this.nextElementSibling;
                    const icon = this.querySelector('.icon-wrapper');
                    const text = this.querySelector('.trigger-text');
                    
                    const isOpen = !content.classList.contains('hidden');
                    
                    // Close others (optional, keeping it simple)
                    
                    if (isOpen) {
                        content.classList.add('hidden');
                        item.classList.remove('shadow-lg', 'border-teal-100');
                        icon.classList.remove('rotate-180', 'bg-teal-50', 'text-teal-600');
                        text.classList.remove('text-teal-600');
                    } else {
                        content.classList.remove('hidden');
                        item.classList.add('shadow-lg', 'border-teal-100');
                        icon.classList.add('rotate-180', 'bg-teal-50', 'text-teal-600');
                        text.classList.add('text-teal-600');
                    }
                });
            });
        });
    </script>
</x-app-layout>


