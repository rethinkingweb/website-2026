/* ==========================================================================
   RethinkingWeb Blog — single post page logic
   Requires wp-config.js to be loaded first. Reads slug from /blog/your-slug
   ========================================================================== */

(function () {
  const container = document.getElementById('rw-post');

  function getSlugFromUrl() {
    // Pretty URL: /blog/your-post-slug
    const pathMatch = window.location.pathname.match(/\/blog\/([^/]+)\/?$/);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);

    // Fallback: old-style ?slug=xxx query string
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
        <a class="rw-post-back" href="/blog.html">&larr; Back to all posts</a>
      </div>`;
  }

  function renderError() {
    container.innerHTML = '<div class="rw-blog-state">Couldn\'t load this post right now. Please try again shortly.</div>';
  }

  // Slugify a heading's text into a safe anchor id
  function slugify(text, index) {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    return `rw-toc-${index}${base ? '-' + base : ''}`;
  }

  // Walk the rendered post content, tag each h2/h3 with an id, and
  // collect them into a table-of-contents list.
  function buildContentWithToc(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const headings = wrapper.querySelectorAll('h2, h3');
    const items = [];
    headings.forEach((h, i) => {
      const id = slugify(h.textContent || `section-${i}`, i);
      h.id = id;
      items.push({ id, text: h.textContent, level: h.tagName.toLowerCase() });
    });
    return { html: wrapper.innerHTML, items };
  }

  function estimateReadTime(html) {
    const text = html.replace(/<[^>]+>/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  function renderPost(post) {
    const image = wpFeaturedImage(post, '');
    const category = wpCategoryName(post);
    const date = wpFormatDate(post.date);
    const readTime = estimateReadTime(post.content.rendered);
    const { html: contentHtml, items: tocItems } = buildContentWithToc(post.content.rendered);

    document.title = `${post.title.rendered} | RethinkingWeb Blog`;
    const metaDescTag = document.querySelector('meta[name="description"]');
    if (metaDescTag) {
      metaDescTag.setAttribute('content', wpPlainExcerpt(post.excerpt.rendered, 155));
    }

    const tocMarkup = tocItems.length
      ? `
        <div class="rw-toc">
          <div class="rw-toc-header"><i class="fa-regular fa-rectangle-list"></i> On This Page</div>
          <nav class="rw-toc-list">
            ${tocItems
              .map(
                (item) =>
                  `<a href="#${item.id}" class="rw-toc-link rw-toc-link--${item.level}">${item.text}</a>`
              )
              .join('')}
          </nav>
        </div>`
      : '';

    container.innerHTML = `
      <div class="rw-post-layout">
        <article class="rw-post-main">
          <nav class="rw-breadcrumb" aria-label="Breadcrumb">
            <a href="/index.html">Home</a>
            <span class="rw-breadcrumb-sep">/</span>
            <a href="/blog.html">Blog</a>
            ${category ? `<span class="rw-breadcrumb-sep">/</span><span class="rw-breadcrumb-current">${category}</span>` : ''}
          </nav>

          ${category ? `<span class="rw-post-badge">${category}</span>` : ''}
          <h1>${post.title.rendered}</h1>

          <div class="rw-post-meta-row">
            <span class="rw-post-avatar">RW</span>
            <span class="rw-post-author">RethinkingWeb Team</span>
            <span class="rw-post-meta-sep">&middot;</span>
            <span class="rw-post-meta-item"><i class="fa-regular fa-calendar"></i>${date}</span>
            <span class="rw-post-meta-sep">&middot;</span>
            <span class="rw-post-meta-item"><i class="fa-regular fa-clock"></i>${readTime} min read</span>
          </div>

          ${image ? `<img class="rw-post-image" src="${image}" alt="${post.title.rendered}" />` : ''}

          <div class="rw-post-content">${contentHtml}</div>

          <a class="rw-post-back" href="/blog.html">&larr; Back to all posts</a>
        </article>

        <aside class="rw-post-sidebar">
          <div class="rw-post-cta">
            <span class="rw-post-cta-eyebrow">Like what you're reading?</span>
            <h3>Let's build something like this for you</h3>
            <p>From integrations to full web builds, our team can help you ship it.</p>
            <a href="/contact.html" class="rw-post-cta-btn">Schedule Consultation <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          ${tocMarkup}
        </aside>
      </div>
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