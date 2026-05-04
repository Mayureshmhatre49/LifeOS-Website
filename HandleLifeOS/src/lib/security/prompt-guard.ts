// Prompt injection and harmful content detection.
// Designed to catch clear adversarial attempts without false-positiving on
// legitimate questions ("how do I negotiate a raise", "explain this contract").

// ── Injection patterns ────────────────────────────────────────────────────────
// These match adversarial override / jailbreak attempts, not normal questions.
const INJECTION_PATTERNS: RegExp[] = [
  // Role / instruction override
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|constraints?|guidelines?)/i,
  /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a\s+)?(different|new|another|unrestricted|unfiltered)\s+(ai|assistant|bot|model|entity)/i,
  /forget\s+(everything|all)\s+(you\s+)?(know|were\s+told|have\s+been|previously)/i,
  /act\s+as\s+(if\s+you\s+(are|have\s+no|don'?t\s+have)\s+)?(restrictions?|rules?|guidelines?|limits?|filters?)/i,
  /your\s+(true|real|actual|hidden|original)\s+(purpose|goal|instruction|directive|objective)/i,
  /pretend\s+(you\s+)?(are|have\s+no|don'?t\s+have)\s+(restrictions?|safety|ethics?|guidelines?)/i,
  /override\s+(your\s+)?(safety|ethical|content)\s+(guidelines?|filters?|restrictions?|rules?)/i,
  /bypass\s+(your\s+)?(safety|ethical|content|security)\s+(guidelines?|filters?|restrictions?)/i,

  // System prompt extraction
  /reveal\s+(your\s+|the\s+)?(system|initial|original|base|full)\s+prompt/i,
  /what\s+(are|were|is)\s+(your\s+)?(original|initial|system|full)\s+(instructions?|prompts?|directives?)/i,
  /print\s+(your\s+|the\s+)?(system|initial|full|original|complete)\s+prompt/i,
  /repeat\s+(everything|all\s+text)\s+(above|before|previously|from\s+(the\s+)?start)/i,
  /show\s+me\s+(your\s+)?(system|initial|original|full)\s+prompt/i,
  /output\s+(your\s+)?(entire|full|complete|original)\s+(prompt|instructions?|context)/i,

  // Jailbreak patterns
  /\bDAN\b.*\b(mode|jailbreak|prompt)\b/i,
  /jailbreak\s+(this\s+)?(ai|assistant|model|chat|bot)/i,
  /do\s+anything\s+now/i,  // "DAN - Do Anything Now"
  /developer\s+mode\s+(enabled?|on|activated?)/i,
  /\[?sudo\]?\s+(mode|access|override|unlock)/i,
  /unlock\s+(your\s+)?(full\s+)?(potential|capabilities|restrictions?|limits?)/i,

  // Template / token injection
  /\{\{[^}]{0,200}\}\}/,     // Handlebars / template injection
  /<\|[^|]{0,50}\|>/,        // Special token injection (e.g. <|endoftext|>)
  /\[INST\]|\[\/INST\]/,     // Llama instruction tokens
  /###\s*(Instruction|System|Human|Assistant)/i, // Alpaca-style tokens

  // Context manipulation
  /new\s+conversation\s*[:：]/i,
  /\[new\s+(session|chat|context|conversation)\]/i,
  /---+\s*(system|user|assistant|instructions?)\s*---+/i,
]

// ── Harmful content patterns ──────────────────────────────────────────────────
// Only clear CBRN / illegal requests — not anything remotely educational.
const HARMFUL_PATTERNS: RegExp[] = [
  /\b(synthesize|manufacture|produce)\s+(meth(amphetamine)?|heroin|fentanyl|ricin|nerve\s+agent|sarin|vx\s+gas)\b/i,
  /\b(make|build|create|assemble|construct)\s+(a\s+)?(pipe\s+bomb|ied|explosive\s+device|car\s+bomb)\b/i,
  /\b(generate|write|create)\s+(functional\s+)?(malware|ransomware|keylogger|rootkit|botnet\s+code)\b/i,
  /\b(hack|compromise|breach)\s+(someone'?s?\s+)?(account|bank|email|device)\s+without\s+(their\s+)?permission\b/i,
  /\b(child|minor)\s+(sexual|explicit|nude|porn)/i,
]

// ── Public API ────────────────────────────────────────────────────────────────
export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: 'prompt_injection' | 'harmful_content'; message: string }

export function guardPrompt(input: string): GuardResult {
  const text = input.slice(0, 3000) // only scan first 3k chars

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: 'prompt_injection',
        message: 'Your message could not be processed. Please rephrase your question.',
      }
    }
  }

  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: 'harmful_content',
        message: 'Life OS cannot assist with that request.',
      }
    }
  }

  return { allowed: true }
}

// Strip known injection artifacts before sending to the model
export function sanitizeForAI(input: string): string {
  return input
    .replace(/<\|[^|]{0,50}\|>/g, '')     // Special tokens
    .replace(/\{\{[^}]{0,200}\}\}/g, '')   // Template syntax
    .replace(/\[INST\]|\[\/INST\]/g, '')   // Llama tokens
    .replace(/---+\s*(system|user|assistant)\s*---+/gi, '')
    .trim()
}
