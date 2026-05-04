<?php

namespace App\Http\Middleware;

use App\Models\SecurityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockMaliciousRequests
{
    // Known scanner / exploit-tool user-agent fragments
    private array $blockedUserAgents = [
        'sqlmap', 'nikto', 'nmap', 'masscan', 'nessus', 'openvas',
        'burpsuite', 'burp suite', 'acunetix', 'appscan', 'webinspect',
        'dirbuster', 'dirb', 'gobuster', 'wfuzz', 'ffuf', 'feroxbuster',
        'hydra', 'medusa', 'metasploit', 'msfconsole', 'havij', 'pangolin',
        'zap', 'w3af', 'skipfish', 'arachni', 'vega', 'whatweb',
        'shodan', 'censys', 'zgrab', 'masscan', 'nuclei', 'httpx',
        'python-requests/2', 'go-http-client', 'libwww-perl',
        'curl/7.1', 'curl/7.2', 'curl/7.3', 'curl/7.4',
        'jakarta commons-httpclient', 'lwp-request',
        'peach', 'appscan', 'webfuzz', 'paros', 'webscrab',
    ];

    // SQL injection patterns
    private array $sqlPatterns = [
        '/(\bUNION\b.*\bSELECT\b|\bSELECT\b.*\bFROM\b)/i',
        '/(\bINSERT\b.*\bINTO\b|\bUPDATE\b.*\bSET\b|\bDELETE\b.*\bFROM\b)/i',
        '/(\bDROP\b.*\b(TABLE|DATABASE|SCHEMA)\b|\bTRUNCATE\b.*\bTABLE\b)/i',
        '/(\bALTER\b.*\bTABLE\b|\bCREATE\b.*\bTABLE\b)/i',
        '/(\bEXEC\b|\bEXECUTE\b)\s*\(/i',
        '/(\bXP_\w+|\bSP_\w+)\s*\(/i',
        '/\b(OR|AND)\s+[\'\"\d]+\s*=\s*[\'\"\d]+/i',    // OR 1=1 / AND 'a'='a'
        '/--\s*$|;\s*--/m',                               // SQL comments
        '/\/\*[\s\S]*?\*\//',                              // Block comments
        '/\bWAITFOR\s+DELAY\b|\bSLEEP\s*\(/i',           // Time-based blind
        '/\bINFORMATION_SCHEMA\b|\bSYS\.(TABLES|COLUMNS)\b/i',
        '/\bCHAR\s*\(\d+\)\s*(\|\||\+)\s*CHAR\s*\(\d+\)/i', // CHAR concat
        '/0x[0-9a-fA-F]{4,}/i',                            // Hex encoding for SQL
        '/\bCAST\s*\(.*\bAS\b.*\bVARCHAR\b/i',
        '/\bCONVERT\s*\(.*\bUSING\b/i',
    ];

    // XSS patterns
    private array $xssPatterns = [
        '/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/i',
        '/<\s*script[\s\S]*?(src|type|language)\s*=/i',
        '/javascript\s*:/i',
        '/vbscript\s*:/i',
        '/data\s*:\s*text\s*\/\s*(html|javascript)/i',
        '/on(load|error|click|mouse\w+|key\w+|focus|blur|change|submit|reset|select|abort|drag\w*|drop|scroll|resize|unload|beforeunload|hashchange|input|invalid|search|toggle|wheel|contextmenu|copy|cut|paste|pointer\w*|animation\w*|transition\w*)\s*=/i',
        '/<\s*(iframe|frame|object|embed|applet|meta|link|base)\s/i',
        '/expression\s*\(/i',                     // IE CSS expression
        '/&#(x[0-9a-fA-F]+|[0-9]+);/i',          // HTML entity encoding for XSS
        '/%[0-9a-fA-F]{2}/i',                     // URL encoding (caught contextually)
        '/\\\u[0-9a-fA-F]{4}/i',                  // Unicode escape
        '/document\s*\.\s*(cookie|location|write|writeln|body|head)/i',
        '/window\s*\.\s*(location|open|eval|setTimeout|setInterval)/i',
        '/eval\s*\(/i',
        '/Function\s*\(/i',
    ];

    // Path traversal and file inclusion patterns
    private array $pathTraversalPatterns = [
        '/\.\.[\/\\\\]/i',          // ../  ..\
        '/\.\.[%2][fF5c]/i',        // URL-encoded traversal
        '/%c0%ae/i',                 // Unicode dot (Tomcat bypass)
        '/%252e/i',                  // Double-encoded .
        '/etc\/passwd/i',
        '/etc\/shadow/i',
        '/proc\/self\/environ/i',
        '/php:\/\//i',
        '/file:\/\//i',
        '/data:\/\//i',
        '/zip:\/\//i',
        '/phar:\/\//i',
        '/expect:\/\//i',
        '/input:\/\//i',
        '/glob:\/\//i',
    ];

    // Command injection patterns
    private array $commandPatterns = [
        '/[;&|`$]\s*(ls|cat|id|whoami|uname|pwd|echo|wget|curl|nc|bash|sh|cmd|powershell)/i',
        '/`[^`]*`/',                 // Backtick command execution
        '/\$\([^)]+\)/i',           // $(command)
        '/\b(exec|system|passthru|popen|proc_open|shell_exec|eval)\s*\(/i', // PHP functions
        '/\bos\.(system|popen|execv?|spawn)/i',   // Python os module
        '/subprocess\.(call|run|check_output)/i',  // Python subprocess
        '/%0[aAdD]/i',              // CRLF injection
        '/\r\n|\r|\n/m',            // Raw newlines in parameter values (checked contextually)
    ];

    // Null byte injection
    private string $nullBytePattern = '/\x00|%00/i';

    public function handle(Request $request, Closure $next): Response
    {
        if (!config('security.waf_enabled', true)) {
            return $next($request);
        }

        // 1. Block known scanner/exploit user agents
        if ($blocked = $this->detectMaliciousUserAgent($request)) {
            return $this->block($request, 'blocked_user_agent', $blocked, 403);
        }

        // 2. Block requests with no user agent on POST endpoints (bots usually lack one)
        if ($request->isMethod('POST') && empty($request->userAgent())) {
            return $this->block($request, 'empty_user_agent_post', 'POST with no User-Agent', 403);
        }

        // 3. Block null bytes anywhere in the request
        if ($this->containsNullByte($request)) {
            return $this->block($request, 'null_byte_injection', 'Null byte detected', 400);
        }

        // 4. Scan all parameter values for attack patterns
        foreach ($request->all() as $key => $value) {
            if (is_string($value)) {
                $reason = $this->scanValue($key, $value);
                if ($reason) {
                    return $this->block($request, $reason['type'], "{$key}: {$reason['match']}", 400);
                }
            }
        }

        // 5. Scan URI path
        $uri = urldecode($request->getRequestUri());
        foreach ($this->pathTraversalPatterns as $pattern) {
            if (preg_match($pattern, $uri)) {
                return $this->block($request, 'path_traversal', $uri, 400);
            }
        }

        // 6. Reject abnormally large Content-Length headers (>2MB)
        $contentLength = (int) $request->header('Content-Length', 0);
        if ($contentLength > 2 * 1024 * 1024) {
            return $this->block($request, 'oversized_payload', "Content-Length: {$contentLength}", 413);
        }

        // 7. Block SSRF via Host header manipulation
        $host = $request->header('Host', '');
        if ($this->isSSRFHost($host)) {
            return $this->block($request, 'ssrf_host_header', $host, 400);
        }

        return $next($request);
    }

    private function detectMaliciousUserAgent(Request $request): ?string
    {
        $ua = strtolower($request->userAgent() ?? '');
        foreach ($this->blockedUserAgents as $fragment) {
            if (str_contains($ua, strtolower($fragment))) {
                return $fragment;
            }
        }
        return null;
    }

    private function containsNullByte(Request $request): bool
    {
        $raw = json_encode($request->all()) . $request->getRequestUri();
        return (bool) preg_match($this->nullBytePattern, $raw);
    }

    private function scanValue(string $key, string $value): ?array
    {
        // Skip honeypot and CSRF fields
        if (in_array($key, ['_token', '_hp_website', '_method'], true)) {
            return null;
        }

        foreach ($this->sqlPatterns as $pattern) {
            if (preg_match($pattern, $value)) {
                return ['type' => 'sql_injection', 'match' => substr($value, 0, 100)];
            }
        }

        foreach ($this->xssPatterns as $pattern) {
            if (preg_match($pattern, $value)) {
                return ['type' => 'xss_attempt', 'match' => substr($value, 0, 100)];
            }
        }

        foreach ($this->pathTraversalPatterns as $pattern) {
            if (preg_match($pattern, $value)) {
                return ['type' => 'path_traversal', 'match' => substr($value, 0, 100)];
            }
        }

        foreach ($this->commandPatterns as $pattern) {
            if (preg_match($pattern, $value)) {
                return ['type' => 'command_injection', 'match' => substr($value, 0, 100)];
            }
        }

        return null;
    }

    private function isSSRFHost(string $host): bool
    {
        // Block requests targeting internal/loopback addresses via Host header manipulation
        $internalPatterns = [
            '/^localhost$/i',
            '/^127\.\d+\.\d+\.\d+$/',
            '/^10\.\d+\.\d+\.\d+$/',
            '/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/',
            '/^192\.168\.\d+\.\d+$/',
            '/^169\.254\.\d+\.\d+$/',      // Link-local
            '/^::1$/',                       // IPv6 loopback
            '/^fc[0-9a-f]{2}:/i',           // IPv6 ULA
        ];

        foreach ($internalPatterns as $pattern) {
            if (preg_match($pattern, $host)) {
                return true;
            }
        }
        return false;
    }

    private function block(Request $request, string $type, string $detail, int $status): Response
    {
        // Log the blocked request (fire-and-forget, non-blocking)
        try {
            SecurityLog::create([
                'event_type'  => $type,
                'ip_address'  => $request->ip(),
                'user_agent'  => substr($request->userAgent() ?? '', 0, 500),
                'method'      => $request->method(),
                'path'        => substr($request->path(), 0, 500),
                'detail'      => substr($detail, 0, 1000),
                'blocked'     => true,
            ]);
        } catch (\Throwable) {
            // Never let logging break the response
        }

        // Generic response — don't reveal which check failed
        abort($status, match ($status) {
            403 => 'Forbidden',
            413 => 'Request Too Large',
            default => 'Bad Request',
        });
    }
}
