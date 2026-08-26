/* ==========================================================================
   RethinkingWeb Blog — WordPress REST API config + shared helpers
   Backend: codevelop.us (WordPress), category ID 37 ("Rethinkingweb")
   ========================================================================== */

const WP_API_BASE = 'https://codevelop.us/wp-json/wp/v2';
const WP_BLOG_CATEGORY_ID = 37; // same category filter used in the Next.js version
const WP_POSTS_PER_PAGE = 9;

/**
 * Fetch a page of posts from the given category, with featured image +
 * category data embedded so we don't need extra round trips.
 */
async function wpFetchPosts(page = 1) {
  const url = `${WP_API_BASE}/posts?categories=${WP_BLOG_CATEGORY_ID}&per_page=${WP_POSTS_PER_PAGE}&page=${page}&_embed`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`WP API error ${res.status}`);
  }
  const posts = await res.json();
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
  const total = parseInt(res.headers.get('X-WP-Total') || String(posts.length), 10);
  return { posts, totalPages, total };
}

/** Fetch a single post by its slug (used on the post detail page). */
async function wpFetchPostBySlug(slug) {
  // categories=37 must be included explicitly — the WP-side snippet excludes
  // category 37 from the REST API unless it's requested by name, and a plain
  // slug lookup doesn't pass a categories param by default.
  const url = `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&categories=${WP_BLOG_CATEGORY_ID}&_embed`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`WP API error ${res.status}`);
  }
  const posts = await res.json();
  return posts[0] || null;
}

/** Strip HTML tags from an excerpt and trim to a max length. */
function wpPlainExcerpt(html, maxLen = 130) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text;
}

/** Pull the featured image URL out of an _embedded post, with a fallback. */
function wpFeaturedImage(post, fallback = '') {
  const media = post._embedded && post._embedded['wp:featuredmedia'];
  return (media && media[0] && media[0].source_url) || fallback;
}

/** Pull the first category name out of an _embedded post. */
function wpCategoryName(post) {
  const terms = post._embedded && post._embedded['wp:term'];
  const categories = terms && terms[0];
  return (categories && categories[0] && categories[0].name) || '';
}

function wpFormatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}