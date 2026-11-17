// Documentation search.
// The index is built in the browser from the real pages: Search/DocsPageRenderer.cs renders every page
// to HTML in the current language and framework, and build() turns that HTML into searchable entries.
// One index is kept per language and framework ("en-blazor", "es-react", ...).
(function () {
    'use strict';

    var MAX_PAGES = 8;
    var MAX_HITS = 3;
    var EXCERPT_LENGTH = 120;

    // How much a match counts, by where it is found.
    var WEIGHT = {
        page: { name: 100, text: 30 },
        section: { name: 45, text: 0 },
        api: { name: 70, text: 15 },
        text: { name: 0, text: 15 },
    };

    var BLOCKS = 'p, li, dt, dd, blockquote, figcaption, tr';

    var indexes = new Map();

    function clean(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    // Case- and accent-insensitive form: "Diálogo" and "dialogo" match.
    function fold(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function isWordStart(text, at) {
        return at === 0 || !/[a-z0-9]/.test(text.charAt(at - 1));
    }

    function entry(page, kind, section, name, text, keywords) {
        return {
            page: page,
            kind: kind,
            section: section,
            name: name,
            text: text,
            nameKey: fold(name),
            textKey: fold(text),
            keywordsKey: fold(keywords || ''),
        };
    }

    function extract(source, pageIndex) {
        var doc = new DOMParser().parseFromString(source.html, 'text/html');
        var root = doc.querySelector('.docs-page');
        if (!root) return null;

        // Code and live demos are not searched: they repeat the prose and add noise.
        root.querySelectorAll('.docs-code, pre, .docs-demo-preview, .docs-demo-source, svg, script, style, template')
            .forEach(function (node) { node.remove(); });

        var page = {
            href: source.href,
            title: clean(root.querySelector('h1') && root.querySelector('h1').textContent),
            category: clean(root.querySelector('.docs-eyebrow') && root.querySelector('.docs-eyebrow').textContent),
            lead: clean(root.querySelector('.docs-lead') && root.querySelector('.docs-lead').textContent),
            sections: {},
        };

        var entries = [entry(pageIndex, 'page', null, page.title, page.lead, page.category)];
        var section = null;

        root.querySelectorAll('h2, h3, ' + BLOCKS).forEach(function (el) {
            if (el.closest('.docs-page-header')) return;

            if (el.tagName === 'H2' || el.tagName === 'H3') {
                section = clean(el.textContent);
                if (section) entries.push(entry(pageIndex, 'section', section, section, ''));
                return;
            }

            // A nested block is already part of its parent's text.
            if (el.parentElement && el.parentElement.closest(BLOCKS)) return;

            if (el.tagName === 'TR') {
                if (el.closest('thead') || !el.querySelector('td')) return;
                var cells = Array.prototype.map.call(el.cells, function (cell) { return clean(cell.textContent); });
                if (el.closest('.docs-api-table')) {
                    // Name, type, default, description.
                    entries.push(entry(pageIndex, 'api', section, cells[0], cells[3] || '', cells[1]));
                } else {
                    entries.push(entry(pageIndex, 'text', section, '', cells.join(' · ')));
                }
                return;
            }

            var text = clean(el.textContent);
            if (!text) return;
            entries.push(entry(pageIndex, 'text', section, '', text));
            // The first paragraph of a section is its excerpt when only the heading matches.
            if (section && !page.sections[section]) page.sections[section] = text;
        });

        return { page: page, entries: entries };
    }

    function build(key, sources) {
        var pages = [];
        var entries = [];
        (sources || []).forEach(function (source) {
            var result = extract(source, pages.length);
            if (!result) return;
            pages.push(result.page);
            Array.prototype.push.apply(entries, result.entries);
        });
        indexes.set(key, { pages: pages, entries: entries });
        return pages.length;
    }

    function scoreTerm(entryValue, term, pageTitleKey) {
        var weight = WEIGHT[entryValue.kind];
        var at = weight.name ? entryValue.nameKey.indexOf(term) : -1;
        if (at >= 0) {
            var exact = entryValue.nameKey === term ? 2 : 1;
            return { direct: true, score: weight.name * exact * (isWordStart(entryValue.nameKey, at) ? 1.5 : 1) };
        }
        at = weight.text ? entryValue.textKey.indexOf(term) : -1;
        if (at >= 0) return { direct: true, score: weight.text * (isWordStart(entryValue.textKey, at) ? 1.3 : 1) };
        if (entryValue.keywordsKey.indexOf(term) >= 0) return { direct: true, score: 8 };
        // "button variant": "button" may come from the page title and "variant" from the entry.
        if (pageTitleKey.indexOf(term) >= 0) return { direct: false, score: 5 };
        return null;
    }

    function score(entryValue, terms, pageTitleKey) {
        var total = 0;
        var direct = false;
        for (var i = 0; i < terms.length; i++) {
            var term = scoreTerm(entryValue, terms[i], pageTitleKey);
            if (!term) return 0;
            total += term.score;
            direct = direct || term.direct;
        }
        return direct ? total : 0;
    }

    // Splits text into { t, m } segments, m marking the matches of the terms.
    function highlight(text, terms) {
        var key = fold(text);
        // Folding keeps the length for Latin text; when it does not, match on the plain lowercase text.
        if (key.length !== text.length) key = text.toLowerCase();
        var marks = [];
        terms.forEach(function (term) {
            var at = key.indexOf(term);
            while (term && at >= 0) {
                marks.push([at, at + term.length]);
                at = key.indexOf(term, at + term.length);
            }
        });
        marks.sort(function (a, b) { return a[0] - b[0]; });

        var segments = [];
        var cursor = 0;
        marks.forEach(function (mark) {
            if (mark[1] <= cursor) return;
            var start = Math.max(mark[0], cursor);
            if (start > cursor) segments.push({ t: text.slice(cursor, start), m: false });
            segments.push({ t: text.slice(start, mark[1]), m: true });
            cursor = mark[1];
        });
        if (cursor < text.length) segments.push({ t: text.slice(cursor), m: false });
        return segments;
    }

    // A window of the text around the first match.
    function excerpt(text, terms) {
        if (text.length <= EXCERPT_LENGTH) return text;
        var key = fold(text);
        var first = -1;
        terms.forEach(function (term) {
            var at = key.indexOf(term);
            if (at >= 0 && (first < 0 || at < first)) first = at;
        });
        var start = first < 0 ? 0 : Math.max(0, first - 30);
        if (start > 0) {
            var space = text.indexOf(' ', start);
            start = space >= 0 && space < first ? space + 1 : start;
        }
        var end = Math.min(text.length, start + EXCERPT_LENGTH);
        if (end < text.length) {
            var lastSpace = text.lastIndexOf(' ', end);
            if (lastSpace > start + 40) end = lastSpace;
        }
        return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    }

    function hitFor(index, entryValue, terms) {
        var page = index.pages[entryValue.page];
        if (entryValue.kind === 'page') {
            return { section: null, heading: [], excerpt: highlight(excerpt(page.lead, terms), terms) };
        }

        var text;
        if (entryValue.kind === 'api') text = entryValue.name + ' — ' + entryValue.text;
        else if (entryValue.kind === 'section') text = page.sections[entryValue.section] || page.lead;
        else text = entryValue.text;

        return {
            section: entryValue.section,
            heading: highlight(entryValue.section || page.title, terms),
            excerpt: highlight(excerpt(text, terms), terms),
        };
    }

    function query(key, text) {
        var index = indexes.get(key);
        var terms = fold(clean(text)).split(' ').filter(Boolean);
        if (!index || !terms.length) return [];

        var byPage = new Map();
        index.entries.forEach(function (entryValue) {
            var page = index.pages[entryValue.page];
            var value = score(entryValue, terms, fold(page.title));
            if (!value) return;
            var list = byPage.get(entryValue.page);
            if (!list) byPage.set(entryValue.page, list = []);
            list.push({ entry: entryValue, score: value });
        });

        var groups = [];
        byPage.forEach(function (matches, pageIndex) {
            matches.sort(function (a, b) { return b.score - a.score; });

            // One hit per section, the best one; the page itself only when no section matches.
            var seen = new Set();
            var hits = [];
            matches.forEach(function (match) {
                if (hits.length >= MAX_HITS || match.entry.kind === 'page') return;
                var section = match.entry.section || '';
                if (seen.has(section)) return;
                seen.add(section);
                hits.push(match.entry);
            });
            if (!hits.length) hits.push(matches[0].entry);

            var rest = matches.slice(1).reduce(function (sum, match) { return sum + match.score; }, 0);
            var page = index.pages[pageIndex];
            groups.push({
                score: matches[0].score + Math.min(rest, matches[0].score) * 0.2,
                href: page.href,
                title: page.title,
                category: page.category || null,
                hits: hits.map(function (hit) { return hitFor(index, hit, terms); }),
            });
        });

        groups.sort(function (a, b) { return b.score - a.score; });
        return groups.slice(0, MAX_PAGES).map(function (group) {
            delete group.score;
            return group;
        });
    }

    function isEditable(target) {
        return target instanceof HTMLElement &&
            (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    }

    var shortcut = null;

    // Wires the dialog and the Ctrl+K / Cmd+K / "/" shortcuts. Returns true on Apple platforms.
    function attach(dialog, trigger, dotnet) {
        detach();

        var input = function () { return dialog.querySelector('input'); };
        var navigating = false;

        function onKeyDown(event) {
            // Arrow keys and Enter move through the results instead of the caret.
            if (event.target === input() && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter')) {
                event.preventDefault();
            }
        }

        function onClick(event) {
            // A click on the backdrop lands on the dialog itself.
            if (event.target === dialog) dialog.close();
        }

        function onClose() {
            if (!navigating) trigger.focus();
            navigating = false;
        }

        function onShortcut(event) {
            var commandK = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k';
            var slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditable(event.target);
            if (!commandK && !slash) return;
            event.preventDefault();
            if (!dialog.open) dotnet.invokeMethodAsync('OpenFromShortcut');
        }

        dialog.addEventListener('keydown', onKeyDown);
        dialog.addEventListener('click', onClick);
        dialog.addEventListener('close', onClose);
        document.addEventListener('keydown', onShortcut);

        shortcut = {
            dialog: dialog,
            markNavigating: function () { navigating = true; },
            remove: function () {
                dialog.removeEventListener('keydown', onKeyDown);
                dialog.removeEventListener('click', onClick);
                dialog.removeEventListener('close', onClose);
                document.removeEventListener('keydown', onShortcut);
            },
        };

        return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    }

    function detach() {
        if (shortcut) shortcut.remove();
        shortcut = null;
    }

    function open(dialog) {
        if (!dialog.open) dialog.showModal();
        var input = dialog.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
    }

    // Closes the dialog for a chosen result: focus moves to the page, not back to the trigger.
    function closeForNavigation(dialog) {
        if (shortcut && shortcut.dialog === dialog) shortcut.markNavigating();
        if (dialog.open) dialog.close();
    }

    function close(dialog) {
        if (dialog.open) dialog.close();
    }

    function scrollIntoView(id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: 'nearest' });
    }

    // After a navigation, waits for the page to render, then scrolls to the section and focuses it.
    function reveal(title, section) {
        var frames = 0;
        function find() {
            var root = document.querySelector('.docs-page');
            var h1 = root && root.querySelector('h1');
            if (!h1 || clean(h1.textContent) !== title) return null;
            var headings = root.querySelectorAll('h2, h3');
            for (var i = 0; i < headings.length; i++) {
                if (!headings[i].closest('.docs-demo-preview') && clean(headings[i].textContent) === section) return headings[i];
            }
            return null;
        }
        function step() {
            var heading = find();
            if (!heading) {
                if (++frames < 120) requestAnimationFrame(step);
                return;
            }
            // Let the router focus the page heading first, then move to the section.
            requestAnimationFrame(function () {
                if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
                heading.scrollIntoView({ block: 'start' });
            });
        }
        requestAnimationFrame(step);
    }

    window.trazosDocsSearch = {
        has: function (key) { return indexes.has(key); },
        build: build,
        query: query,
        attach: attach,
        detach: detach,
        open: open,
        close: close,
        closeForNavigation: closeForNavigation,
        scrollIntoView: scrollIntoView,
        reveal: reveal,
    };
})();
