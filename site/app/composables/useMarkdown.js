import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
});

/**
 * Post-process rendered HTML:
 *  - Add target="_blank" rel="noopener noreferrer" to external links
 *  - Convert <!-- SECTION: ... --> comments into styled divider elements
 */
function postProcess(html) {
    // External links → new tab
    html = html.replace(
        /<a\s+href="(https?:\/\/[^"]*)"/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer"',
    );

    // Section divider comments → styled div
    html = html.replace(
        /<!-- SECTION: (.+?) -->/g,
        '<div class="legal-section-divider" aria-hidden="true">$1</div>',
    );

    return html;
}

/**
 * Parse a Markdown file with optional YAML frontmatter and render to HTML.
 *
 * @param {string} raw - raw Markdown string (imported via ?raw)
 * @param {object} [opts]
 * @param {string} [opts.date] - replaces every {{DATE}} token in the body
 * @returns {{ html: string, frontmatter: Record<string, string> }}
 */
export function useMarkdown(raw, { date } = {}) {
    let frontmatter = {};
    let body = raw;

    // Extract YAML frontmatter delimited by ---
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (fmMatch) {
        const rawFm = fmMatch[1];
        for (const line of rawFm.split("\n")) {
            const idx = line.indexOf(":");
            if (idx > 0) {
                const key = line.slice(0, idx).trim();
                const val = line.slice(idx + 1).trim();
                if (key) frontmatter[key] = val;
            }
        }
        body = raw.slice(fmMatch[0].length);
    }

    if (date) {
        body = body.replaceAll("{{DATE}}", date);
    }

    const html = postProcess(md.render(body));

    return { html, frontmatter };
}
