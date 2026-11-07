// Load this as a blocking script in <head>, after the theme-color meta tag. It applies
// the theme before first paint, which avoids a flash of the wrong colors, and follows
// the system until the user chooses. Optional attributes on the script tag:
// data-storage-key, data-light-color and data-dark-color.
(function () {
    var options = document.currentScript ? document.currentScript.dataset : {};
    var key = options.storageKey || 'trazos-theme';
    var colors = { light: options.lightColor || '#FAF7F2', dark: options.darkColor || '#1A1512' };
    var root = document.documentElement;
    var system = window.matchMedia('(prefers-color-scheme: dark)');

    function stored() {
        try {
            var value = localStorage.getItem(key);
            return value === 'dark' || value === 'light' ? value : null;
        } catch (e) {
            return null;
        }
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', colors[theme]);
    }

    apply(stored() || (system.matches ? 'dark' : 'light'));
    system.addEventListener('change', function (event) {
        if (!stored()) apply(event.matches ? 'dark' : 'light');
    });
})();
