import './bootstrap';

import Alpine from '@alpinejs/csp';
import Collapse from '@alpinejs/collapse';

Alpine.plugin(Collapse);

// Expose Alpine globally so the alpine:init listener in app-layout.blade.php
// (which registers Alpine.data components) can reference it before start().
window.Alpine = Alpine;

Alpine.start();
