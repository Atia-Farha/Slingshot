import DOMPurify from 'isomorphic-dompurify';
import MarkdownIt from 'markdown-it';

// SECURITY:
//   - `html: false` blocks any raw HTML inside the .md source from being emitted.
//     Without this, a stray <script> tag in legal/*.md would execute in the browser.
//   - The output is still sanitized with DOMPurify as defense-in-depth, in case a
//     future change re-enables raw HTML or the source becomes user-influenced.
//   - The {{DATE}} substitution is pre-escaped so it cannot be used to inject
//     Markdown/HTML even if a caller ever passes an untrusted string.
const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: false,
});

// Tags actually produced by MarkdownIt with our config.
const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'del', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];

const ALLOWED_ATTR = ['href', 'title', 'rel', 'target'];

/**
 * Escape a string for safe substitution into a Markdown body.
 * Prevents the {{DATE}} token from being used to inject Markdown/HTML.
 */
function escapeForMarkdown(value) {
	return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/**
 * Post-process rendered HTML:
 *  - Add target="_blank" rel="noopener noreferrer" to external links
 *  - Convert <!-- SECTION: ... --> comments into styled divider elements
 */
function postProcess(html) {
	return html.replace(/<a\s+href="(https?:\/\/[^"]*)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"').replace(/<!-- SECTION: (.+?) -->/g, '<div class="legal-section-divider" aria-hidden="true">$1</div>');
}

/**
 * Parse a Markdown file and render it to sanitized HTML.
 *
 * @param {string} raw - raw Markdown string (imported via ?raw)
 * @param {object} [opts]
 * @param {string} [opts.date] - replaces every {{DATE}} token in the body
 * @returns {{ html: string }}
 */
export function useMarkdown(raw, { date } = {}) {
	let body = raw;

	// Strip optional YAML frontmatter delimited by ---
	const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
	if (fmMatch) body = raw.slice(fmMatch[0].length);

	if (date) body = body.replaceAll('{{DATE}}', escapeForMarkdown(date));

	// 1. Render Markdown to HTML (raw HTML in the source is escaped because html:false)
	// 2. Apply project-specific post-processing (target=_blank, section dividers)
	// 3. Sanitize with DOMPurify to strip anything dangerous that slipped through
	const html = DOMPurify.sanitize(postProcess(md.render(body)), {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false,
		FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
	});

	return { html };
}
