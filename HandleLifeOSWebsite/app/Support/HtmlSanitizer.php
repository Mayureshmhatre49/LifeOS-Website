<?php

namespace App\Support;

/**
 * Lightweight HTML sanitizer for trusted-but-not-perfect content sources
 * (e.g. blog posts authored via an admin UI). Allows a tight whitelist of
 * formatting tags and strips:
 *   • `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<link>`,
 *     `<meta>`, `<base>`, `<form>`, `<input>`, `<applet>` — entire element + content
 *   • All `on*` event handler attributes (`onclick`, `onload`, …)
 *   • `javascript:` / `vbscript:` / `data:text/html` URIs in href/src
 *   • `style` attributes containing `expression(`, `behavior:`, or `@import`
 *
 * For full-grade purification, swap this for ezyang/htmlpurifier.
 */
class HtmlSanitizer
{
    private const ALLOWED_TAGS = '<p><br><hr><div><span><strong><b><em><i><u><s><strike>'
        . '<h1><h2><h3><h4><h5><h6>'
        . '<ul><ol><li><dl><dt><dd>'
        . '<a><blockquote><pre><code>'
        . '<table><thead><tbody><tfoot><tr><th><td>'
        . '<img><figure><figcaption>';

    private const DANGEROUS_BLOCK_TAGS = [
        'script', 'style', 'iframe', 'object', 'embed', 'applet',
        'link', 'meta', 'base', 'form', 'input', 'textarea',
        'select', 'option', 'button', 'frame', 'frameset',
    ];

    public static function clean(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        // 1. Strip entire dangerous elements (tag + content), not just the tags.
        foreach (self::DANGEROUS_BLOCK_TAGS as $tag) {
            $html = preg_replace(
                '#<\s*' . $tag . '\b[^>]*>.*?<\s*/\s*' . $tag . '\s*>#is',
                '',
                $html
            ) ?? $html;
            // Self-closing or unclosed
            $html = preg_replace(
                '#<\s*' . $tag . '\b[^>]*/?>#is',
                '',
                $html
            ) ?? $html;
        }

        // 2. Strip dangerous URI schemes from href/src (allow http, https, mailto, tel, /, #)
        $html = preg_replace_callback(
            '#(\b(?:href|src|action|formaction|xlink:href)\s*=\s*)(["\'])(.*?)\2#is',
            static function ($m) {
                $uri = trim($m[3]);
                $lower = strtolower($uri);
                $isSafe = $lower === ''
                    || str_starts_with($lower, 'http://')
                    || str_starts_with($lower, 'https://')
                    || str_starts_with($lower, 'mailto:')
                    || str_starts_with($lower, 'tel:')
                    || str_starts_with($lower, '#')
                    || str_starts_with($lower, '/')
                    || str_starts_with($lower, './')
                    || str_starts_with($lower, '../');
                return $isSafe ? $m[0] : $m[1] . $m[2] . '#' . $m[2];
            },
            $html
        ) ?? $html;

        // 3. Strip every `on*` event handler attribute
        $html = preg_replace('#\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)#i', '', $html) ?? $html;

        // 4. Strip dangerous CSS in inline `style="..."` attrs
        $html = preg_replace_callback(
            '#\s+style\s*=\s*(["\'])(.*?)\1#is',
            static function ($m) {
                $css = $m[2];
                if (preg_match('#expression\s*\(|behavior\s*:|@import|javascript\s*:|vbscript\s*:#i', $css)) {
                    return '';
                }
                return ' style=' . $m[1] . $css . $m[1];
            },
            $html
        ) ?? $html;

        // 5. Whitelist tags (strip_tags handles paired tags; combined with steps 1-4
        //    this gives us a defence-in-depth filter).
        return strip_tags($html, self::ALLOWED_TAGS);
    }
}
