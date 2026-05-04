/**
 * Intent Router for Life OS WhatsApp Bot.
 * Detects what kind of help the user needs WITHOUT a separate AI call.
 * Supports English, Hindi, and common Hinglish patterns.
 */

export type MessageIntent =
  | 'emi'
  | 'scam'
  | 'budget'
  | 'plan'
  | 'menu'
  | 'help'
  | 'greeting'
  | 'chat'

interface IntentRule {
  intent: MessageIntent
  patterns: RegExp[]
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'greeting',
    patterns: [
      /^(hi|hello|hey|namaste|namaskar|hola|jai hind|jai mata di|hii+|helo|hai)\b/i,
      /^(good\s*(morning|evening|afternoon|night))\b/i,
      /^(shubh\s*(prabhat|sandhya|ratri))\b/i,
    ],
  },
  {
    intent: 'menu',
    patterns: [
      /^(menu|options|what can you do|help me|kya kar sakte|kya karte|features|start)\b/i,
      /^[0-9]$/, // Single digit → menu selection
    ],
  },
  {
    intent: 'emi',
    patterns: [
      /\bemi\b/i,
      /\bloan\b.*\b(calculate|nikalo|batao|calc|kitna)\b/i,
      /\b(home|car|personal|business)\s+loan\b/i,
      /\b(interest|emi|installment|kist)\b.*\b(kitna|how much|calculate)\b/i,
      /\b(lakhs?|lakh|cr|crore|lacs?)\b.*\b(%|percent|faida|byaj|rate)\b/i,
      // Pattern: "5L 8.5% 20 years"
      /\d+\s*(l|lakh|l|cr|crore)\s+\d+\.?\d*\s*%/i,
    ],
  },
  {
    intent: 'scam',
    patterns: [
      /\b(scam|fraud|fake|dhoka|thagi|swindl|cheat)\b/i,
      /\b(is this (real|legit|genuine|safe)|real hai kya|sach hai kya|safe hai kya)\b/i,
      /\b(lottery|prize|won|winner|claim|reward)\b.*\b(message|link|click)\b/i,
      /\b(kyc update|kyc expired|account (block|freeze|suspend))\b/i,
      /\b(job offer|work from home|easy money|part time|part-time)\b.*\b(earn|money|income|salary)\b/i,
      /\b(doubling|double your|guaranteed return|safe investment)\b/i,
      /scam\s+(hai|check|dekho|batao)/i,
      /check (this|ye|yeh|isko)/i,
    ],
  },
  {
    intent: 'budget',
    patterns: [
      /\b(budget|paisa|money|kharcha|expense|spend|savings|bachao|bachat)\b/i,
      /\b(afford|khareed sakte|buy|purchase)\b.*\b(kya|can i|should i)\b/i,
      /\b(subscription|netflix|amazon|ott|app)\b.*\b(worth|chahiye|lena)\b/i,
      /\b(salary|income|kitna|mahina|monthly)\b.*\b(bachat|save|manage|budget)\b/i,
    ],
  },
  {
    intent: 'plan',
    patterns: [
      /\b(plan|schedule|todo|to-do|task|reminder|yaad|remind)\b/i,
      /\b(aaj|today|kal|tomorrow|week|mahine)\b.*\b(plan|karna|kya|kaam)\b/i,
      /\b(daily|routine|habit|morning|evening|raat)\b.*\b(plan|routine|schedule)\b/i,
    ],
  },
  {
    intent: 'help',
    patterns: [
      /^(help|\?|\/help|\/start|kya|what)\b/i,
    ],
  },
]

export function detectIntent(text: string): MessageIntent {
  const trimmed = text.trim()

  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(trimmed)) {
        return rule.intent
      }
    }
  }

  return 'chat'
}

export function isMenuSelection(text: string): number | null {
  const trimmed = text.trim()
  const num = parseInt(trimmed, 10)
  if (!isNaN(num) && num >= 1 && num <= 9 && trimmed === String(num)) {
    return num
  }
  return null
}
