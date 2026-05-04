<x-app-layout>
    <x-slot name="title">{{ $title }}</x-slot>

    <main class="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-20">
        {{-- Background Accents --}}
        <div class="fixed inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-teal-900/20 rounded-full blur-[120px]"></div>
            <div class="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            {{-- Header --}}
            <div class="max-w-3xl mb-16">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono mb-6">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    LIVE PROJECT STATUS
                </div>
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                    The 10 Phases of <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">HandleLife OS</span>
                </h1>
                <p class="text-xl text-slate-400 leading-relaxed">
                    We are building the foundational layer for digital life. Track our progress as we move from a core AI assistant to a comprehensive life operating system.
                </p>
            </div>

            {{-- Progress Overview --}}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                    <div class="text-slate-400 text-sm font-medium mb-2">Overall Progress</div>
                    <div class="flex items-end gap-3 mb-4">
                        <div class="text-5xl font-bold text-white">20%</div>
                        <div class="text-teal-400 text-sm mb-2 font-mono">PHASE 2 COMPLETE</div>
                    </div>
                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div class="bg-gradient-to-r from-teal-500 to-emerald-500 h-full w-[20%] rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
                    </div>
                </div>

                <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                    <div class="text-slate-400 text-sm font-medium mb-2">Active Development</div>
                    <div class="text-2xl font-semibold text-white mb-1">Phase 3: Daily Planner</div>
                    <p class="text-slate-500 text-sm">Tasks, reminders, and routine automation engine.</p>
                    <div class="mt-4 inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                        Next Milestone: Task Logic Engine
                    </div>
                </div>

                <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-center">
                    <div class="flex -space-x-3 mb-4">
                        @for ($i = 0; $i < 5; $i++)
                            <div class="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                {{ chr(65 + $i) }}
                            </div>
                        @endfor
                        <div class="w-10 h-10 rounded-full border-2 border-slate-900 bg-teal-600 flex items-center justify-center text-xs font-bold text-white">
                            +42
                        </div>
                    </div>
                    <div class="text-white font-medium">Join the Build</div>
                    <p class="text-slate-500 text-sm">Early access users are shaping Phase 3.</p>
                </div>
            </div>

            {{-- Roadmap Grid --}}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                @php
                    $phases = [
                        [
                            'id' => 1,
                            'title' => 'Core Assistant',
                            'status' => 'Completed',
                            'desc' => 'AI chat interface, user authentication, and prompt categories.',
                            'items' => ['Next.js 16 + AI SDK v6', 'NextAuth v5 Integration', '8 Specialized Prompt Categories', 'Supabase Database Layer']
                        ],
                        [
                            'id' => 2,
                            'title' => 'Personal Memory',
                            'status' => 'Completed',
                            'desc' => 'Allowing the AI to remember user context, preferences, and history.',
                            'items' => ['Context-Aware System Prompts', 'Memory Item CRUD', 'User Preference Storage', 'Personalized Response Logic']
                        ],
                        [
                            'id' => 3,
                            'title' => 'Daily Planner',
                            'status' => 'Planned',
                            'desc' => 'Integrated task management, reminders, and smart routine suggestions.',
                            'items' => ['Smart Task Extraction', 'Calendar Integration', 'Proactive Reminders', 'Morning/Evening Briefings']
                        ],
                        [
                            'id' => 4,
                            'title' => 'Focus & Productivity',
                            'status' => 'Planned',
                            'desc' => 'Tools to help you stay in flow and manage deep work sessions.',
                            'items' => ['AI Body Doubling', 'Flow State Timers', 'Distraction Blocking', 'Productivity Analytics']
                        ],
                        [
                            'id' => 5,
                            'title' => 'Protection Layer',
                            'status' => 'Planned',
                            'desc' => 'Security features to protect your digital life from scams and fraud.',
                            'items' => ['Scam Message Detection', 'Contract/TOS Analysis', 'Privacy Audit Tools', 'Identity Protection Alerts']
                        ],
                        [
                            'id' => 6,
                            'title' => 'Money Helper',
                            'status' => 'Planned',
                            'desc' => 'Financial organization, budget tracking, and bill management.',
                            'items' => ['EMI/Subscription Tracker', 'Spending Insights', 'Bill Negotiation Assistant', 'Savings Goal Optimization']
                        ],
                        [
                            'id' => 7,
                            'title' => 'Family Mode',
                            'status' => 'Planned',
                            'desc' => 'Shared household coordination for modern families.',
                            'items' => ['Shared Grocery/Task Lists', 'Elder Care Coordination', 'Family Sync Engine', 'Delegate Logic']
                        ],
                        [
                            'id' => 8,
                            'title' => 'Voice & WhatsApp',
                            'status' => 'Planned',
                            'desc' => 'Expanding the OS to where you already communicate.',
                            'items' => ['WhatsApp Native Integration', 'Voice Command Support', 'SMS Quick Actions', 'Audio Life-Logs']
                        ],
                        [
                            'id' => 9,
                            'title' => 'Premium & Revenue',
                            'status' => 'Planned',
                            'desc' => 'Scaling the business with advanced features and priority access.',
                            'items' => ['Subscription Tiers', 'Custom Model Selection', 'Extended Memory Limits', 'Priority AI Processing']
                        ],
                        [
                            'id' => 10,
                            'title' => 'Scale & Growth',
                            'status' => 'Planned',
                            'desc' => 'Taking HandleLife OS to the world with global support.',
                            'items' => ['Regional Language Support', 'Enterprise API Access', 'Cross-Platform Native Apps', 'Open Source Core Modules']
                        ],
                    ];
                @endphp

                @foreach ($phases as $phase)
                    <div class="group relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl transition-all duration-500 hover:bg-white/[0.08] hover:border-teal-500/30">
                        <div class="flex flex-col lg:flex-row lg:items-center gap-8">
                            {{-- Phase Number --}}
                            <div class="flex-shrink-0">
                                <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl font-bold {{ $phase['status'] == 'Completed' ? 'text-teal-400 border-teal-500/50' : 'text-slate-500' }}">
                                    {{ $phase['id'] }}
                                </div>
                            </div>

                            {{-- Content --}}
                            <div class="flex-grow">
                                <div class="flex items-center gap-3 mb-2">
                                    <h3 class="text-2xl font-semibold text-white">{{ $phase['title'] }}</h3>
                                    @if ($phase['status'] == 'Completed')
                                        <span class="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest">Done</span>
                                    @else
                                        <span class="px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Upcoming</span>
                                    @endif
                                </div>
                                <p class="text-slate-400 max-w-2xl">{{ $phase['desc'] }}</p>
                            </div>

                            {{-- Features List --}}
                            <div class="lg:w-1/3">
                                <ul class="grid grid-cols-1 gap-2">
                                    @foreach ($phase['items'] as $item)
                                        <li class="flex items-center gap-2 text-sm text-slate-500">
                                            <svg class="w-3.5 h-3.5 {{ $phase['status'] == 'Completed' ? 'text-teal-500' : 'text-slate-700' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            {{ $item }}
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>

                        {{-- Connector Line (Desktop Only) --}}
                        @if (!$loop->last)
                            <div class="hidden lg:block absolute left-14 top-24 w-px h-8 bg-gradient-to-b from-teal-500/50 to-transparent"></div>
                        @endif
                    </div>
                @endforeach
            </div>

            {{-- Footer CTA --}}
            <div class="mt-20 text-center p-12 rounded-3xl bg-gradient-to-b from-teal-500/10 to-transparent border border-teal-500/20">
                <h2 class="text-3xl font-bold text-white mb-4">Want to influence the roadmap?</h2>
                <p class="text-slate-400 mb-8 max-w-xl mx-auto">
                    Our development is driven by our early access community. Join the waitlist to get invited to our private feedback sessions.
                </p>
                <a href="{{ route('waitlist') }}" class="inline-flex items-center justify-center px-8 py-4 rounded-full bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                    Join the Waitlist
                </a>
            </div>
        </div>
    </main>
</x-app-layout>
