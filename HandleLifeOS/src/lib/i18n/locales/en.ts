export const en = {
  // Greetings
  'greeting.morning': 'Good Morning',
  'greeting.afternoon': 'Good Afternoon',
  'greeting.evening': 'Good Evening',
  'greeting.night': 'Good Night',
  'greeting.subtitle': "Here's your life at a glance.",

  // Navigation
  'nav.home': 'Home',
  'nav.today': 'Today',
  'nav.capture': 'Capture',
  'nav.planner': 'Planner',
  'nav.money': 'Money',
  'nav.mind': 'Mind',
  'nav.family': 'Family',
  'nav.insights': 'Insights',
  'nav.decisions': 'Decisions',
  'nav.protection': 'Protection',
  'nav.vault': 'Vault',
  'nav.growth': 'Growth',
  'nav.settings': 'Settings',
  'nav.chat': 'Chat',

  // Home / LifeFeed
  'home.priorities': "Today's Priorities",
  'home.noTasks': 'No tasks today — enjoy the calm.',
  'home.addTask': 'Add task',
  'home.quickCapture': 'What do you want to handle?',
  'home.quickCapturePlaceholder': 'Type anything — a task, expense, thought…',
  'home.aiFeed': 'AI Feed',
  'home.lifeAtGlance': 'Your Life at a Glance',

  // Today
  'today.title': 'Today',
  'today.subtitle': 'Your complete daily briefing.',
  'today.schedule': "Today's Schedule",
  'today.noSchedule': 'Nothing scheduled — a clear day.',
  'today.moneyAlerts': 'Money Alerts',
  'today.noAlerts': 'No payments due soon.',
  'today.aiBrief': 'AI Morning Brief',

  // Capture
  'capture.title': 'Quick Capture',
  'capture.subtitle': 'Speak or type anything. HandleLife OS will figure it out.',
  'capture.speak': 'Speak',
  'capture.type': 'Type',
  'capture.scan': 'Scan',
  'capture.suggested': 'Suggested',
  'capture.listening': 'Listening…',
  'capture.placeholder': 'Remind me to call mom tomorrow at 6pm…',
  'capture.handle': 'Handle this',
  'capture.recent': 'Recent Captures',

  // Mind
  'mind.title': 'Mind',
  'mind.subtitle': 'How are you feeling today?',
  'mind.moodCheckin': 'Mood Check-in',
  'mind.journal': 'Today\'s Journal',
  'mind.journalPlaceholder': 'What\'s on your mind? Anything you want to process…',
  'mind.saveEntry': 'Save entry',
  'mind.breathe': 'Breathe',
  'mind.calmTools': 'Calm Tools',
  'mind.stressTrend': 'Stress This Week',
  'mind.moodHistory': 'Mood History',

  // Mood labels
  'mood.1': 'Rough',
  'mood.2': 'Low',
  'mood.3': 'Okay',
  'mood.4': 'Good',
  'mood.5': 'Great',

  // Insights
  'insights.title': 'Insights',
  'insights.subtitle': 'Patterns your life is showing.',
  'insights.spending': 'Spending Patterns',
  'insights.productivity': 'Productivity',
  'insights.mood': 'Mood Trends',
  'insights.weekly': 'Weekly Summary',
  'insights.noData': 'Keep using HandleLife OS to unlock your life patterns.',

  // Premium
  'premium.title': 'HandleLife OS Premium',
  'premium.subtitle': 'Unlock your full life operating system.',
  'premium.free': 'Free',
  'premium.plus': 'Plus',
  'premium.pro': 'Pro',
  'premium.monthly': '/month',
  'premium.yearly': '/year',
  'premium.upgrade': 'Get Premium',
  'premium.current': 'Current plan',
  'premium.mostPopular': 'Most Popular',

  // Actions
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.done': 'Done',
  'action.view': 'View',
  'action.viewAll': 'View all',
  'action.close': 'Close',
  'action.retry': 'Try again',
  'action.loading': 'Loading…',

  // Common
  'common.today': 'Today',
  'common.tomorrow': 'Tomorrow',
  'common.thisWeek': 'This week',
  'common.overdue': 'Overdue',
  'common.completed': 'Completed',
  'common.new': 'New',
  'common.beta': 'Beta',
  'common.soon': 'Coming soon',
  'common.private': 'Private by design',
  'common.poweredBy': 'Powered by AI',
} as const

export type TranslationKey = keyof typeof en
