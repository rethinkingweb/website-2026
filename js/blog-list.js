/* ==========================================================================
   RethinkingWeb Blog — listing page logic
   Requires wp-config.js to be loaded first.
   ========================================================================== */

(function () {
  const grid = document.getElementById('rw-blog-grid');
  const paginationEl = document.getElementById('rw-blog-pagination');
  let currentPage = 1;
  let totalPages = 1;

  function renderSkeleton() {
    grid.innerHTML = Array.from({ length: WP_POSTS_PER_PAGE })
      .map(() => '<div class="rw-blog-skeleton"></div>')
      .join('');
  }

  function renderError() {
    grid.innerHTML = '<div class="rw-blog-state">Couldn\'t load posts right now. Please refresh or try again shortly.</div>';
  }

  function renderEmpty() {
    grid.innerHTML = '<div class="rw-blog-state">No posts published yet — check back soon.</div>';
  }

  function renderPosts(posts) {
    grid.innerHTML = posts
      .map((post) => {
        const image = wpFeaturedImage(post, '/images/blog-placeholder.jpg');
        const category = wpCategoryName(post);
        const excerpt = wpPlainExcerpt(post.excerpt.rendered);
        const date = wpFormatDate(post.date);
        return `
          <a class="rw-blog-card" href="/blog/${encodeURIComponent(post.slug)}">
            <div class="rw-blog-card-image-wrap">
              <img class="rw-blog-card-image" src="${image}" alt="${post.title.rendered}" loading="lazy" />
            </div>
            <div class="rw-blog-card-body">
              <div class="rw-blog-card-meta">
                ${category ? `<span class="rw-cat">${category}</span><span>&middot;</span>` : ''}
                <span class="rw-blog-card-date"><i class="fa-regular fa-calendar"></i>${date}</span>
              </div>
              <h3>${post.title.rendered}</h3>
              <p>${excerpt}</p>
              <span class="rw-blog-card-readmore">Read More <i class="fa-solid fa-arrow-right"></i></span>
            </div>
          </a>
        `;
      })
      .join('');
  }

  function renderPagination() {
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    paginationEl.innerHTML = `
      <button id="rw-prev-page" ${currentPage <= 1 ? 'disabled' : ''}>&larr; Previous</button>
      <span class="rw-page-status">Page ${currentPage} of ${totalPages}</span>
      <button id="rw-next-page" ${currentPage >= totalPages ? 'disabled' : ''}>Next &rarr;</button>
    `;
    const prevBtn = document.getElementById('rw-prev-page');
    const nextBtn = document.getElementById('rw-next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => loadPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => loadPage(currentPage + 1));
  }

  async function loadPage(page) {
    currentPage = page;
    renderSkeleton();
    window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
    try {
      const { posts, totalPages: tp } = await wpFetchPosts(page);
      totalPages = tp;
      if (!posts.length) {
        renderEmpty();
      } else {
        renderPosts(posts);
      }
      renderPagination();
    } catch (err) {
      console.error(err);
      renderError();
    }
  }

  loadPage(1);
})();