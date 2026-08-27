/* ==========================================================================
   RethinkingWeb Blog — single post page logic
   Requires wp-config.js to be loaded first. Expects ?slug=your-post-slug
   ========================================================================== */

(function () {
  const container = document.getElementById('rw-post');

  function getSlugFromUrl() {
    // New pretty URL: /blog/slug=your-post-slug (rewritten server-side to
    // blog-post.html, so there's no real query string to read anymore).
    const pathMatch = window.location.pathname.match(/\/blog\/slug=([^/]+)\/?$/);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);

    // Fallback: old-style ?slug=xxx query string, in case any old links
    // or bookmarks still use it.
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }

  function renderLoading() {
    container.innerHTML = '<div class="rw-blog-state">Loading post…</div>';
  }

  function renderNotFound() {
    container.innerHTML = `
      <div class="rw-blog-state">
        Post not found.<br /><br />
        <a class="rw-post-back" href="blog.html">&larr; Back to all posts</a>
      </div>`;
  }

  function renderError() {
    container.innerHTML = '<div class="rw-blog-state">Couldn\'t load this post right now. Please try again shortly.</div>';
  }

  function renderPost(post) {
    const image = wpFeaturedImage(post, '');
    const category = wpCategoryName(post);
    const date = wpFormatDate(post.date);

    document.title = `${post.title.rendered} | RethinkingWeb Blog`;
    const metaDescTag = document.querySelector('meta[name="description"]');
    if (metaDescTag) {
      metaDescTag.setAttribute('content', wpPlainExcerpt(post.excerpt.rendered, 155));
    }

    container.innerHTML = `
      <a class="rw-post-back" href="blog.html">&larr; Back to all posts</a>
      <div class="rw-post-meta">
        ${category ? `<span class="rw-cat">${category}</span> &middot; ` : ''}${date}
      </div>
      <h1>${post.title.rendered}</h1>
      ${image ? `<img class="rw-post-image" src="${image}" alt="${post.title.rendered}" />` : ''}
      <div class="rw-post-content">${post.content.rendered}</div>
    `;
  }

  async function init() {
    const slug = getSlugFromUrl();
    if (!slug) {
      renderNotFound();
      return;
    }
    renderLoading();
    try {
      const post = await wpFetchPostBySlug(slug);
      if (!post) {
        renderNotFound();
      } else {
        renderPost(post);
      }
    } catch (err) {
      console.error(err);
      renderError();
    }
  }

  init();
})();