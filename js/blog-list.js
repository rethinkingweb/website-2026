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
if (prevBtn) prevBtn.addEventListener('click', () => loadPage(currentPage - 1, true));
if (nextBtn) nextBtn.addEventListener('click', () => loadPage(currentPage + 1, true));
  }

async function loadPage(page, shouldScroll = false) {
  currentPage = page;
  renderSkeleton();
  if (shouldScroll) {
    window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
  }
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
/* ══════════════════════════════
     2. MOBILE NAV
  ══════════════════════════════ */
  const burger    = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileClose');
  const overlay   = document.getElementById('navOverlay');

  if (burger && mobileNav) {
    const openNav = () => {
      mobileNav.classList.add('open');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
    };
    const closeNav = () => {
      mobileNav.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    };

    burger.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay)  overlay.addEventListener('click', closeNav);

    // Close on plain anchor links only (not accordion buttons)
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  }

  /* ══════════════════════════════
     3. MOBILE ACCORDION
  ══════════════════════════════ */
  document.querySelectorAll('.mob-accordion__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const accordion = btn.closest('.mob-accordion');
      const panel     = accordion.querySelector('.mob-accordion__panel');
      const isOpen    = accordion.classList.contains('open');

      // Close all first
      document.querySelectorAll('.mob-accordion').forEach(a => {
        a.classList.remove('open');
        a.querySelector('.mob-accordion__btn').setAttribute('aria-expanded', 'false');
        const p = a.querySelector('.mob-accordion__panel');
        if (p) p.style.maxHeight = null;
      });

      // Toggle clicked one
      if (!isOpen) {
        accordion.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });