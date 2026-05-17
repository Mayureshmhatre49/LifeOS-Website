import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    server: {
        host: '127.0.0.1',
    },
    build: {
        target: 'es2019',           // modern browsers only — drops legacy transforms/polyfills
        reportCompressedSize: false, // skip gzip stats during build for faster CI
        rollupOptions: {
            output: {
                // Keep all vendor code in the main bundle — Alpine is small enough
                // that a separate chunk adds a round-trip with no size benefit
                manualChunks: undefined,
            },
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
});
