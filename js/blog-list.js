/* ==========================================================================
   RethinkingWeb Blog — listing page logic
   Requires wp-config.js to be loaded first.
   ========================================================================== */

(function () {
  const list = document.getElementById('rw-blog-list');
  const loadMoreEl = document.getElementById('rw-blog-loadmore');
  let currentPage = 1;
  let totalPages = 1;
  let isFirstLoad = true;

  function renderSkeleton() {
    list.innerHTML = Array.from({ length: 3 })
      .map(() => '<div class="rw-blog-skeleton"></div>')
      .join('');
  }

  function renderError() {
    list.innerHTML = '<div class="rw-blog-state">Couldn\'t load posts right now. Please refresh or try again shortly.</div>';
  }

  function renderEmpty() {
    list.innerHTML = '<div class="rw-blog-state">No posts published yet — check back soon.</div>';
  }

  function cardHtml(post) {
    const image = wpFeaturedImage(post, '/images/blog-placeholder.jpg');
    const category = wpCategoryName(post);
    const excerpt = wpPlainExcerpt(post.excerpt.rendered);
    const date = wpFormatDate(post.date);
    return `
      <a class="rw-blog-card" href="/blog/${encodeURIComponent(post.slug)}">
        <img class="rw-blog-card-image" src="${image}" alt="${post.title.rendered}" loading="lazy" />
        <div class="rw-blog-card-body">
          <div class="rw-blog-card-meta">
            ${category ? `<span class="rw-cat">${category}</span><span>&middot;</span>` : ''}
            <span>${date}</span>
          </div>
          <h3>${post.title.rendered}</h3>
          <p>${excerpt}</p>
          <span class="rw-blog-card-readmore">Read more &rarr;</span>
        </div>
      </a>
    `;
  }

  function renderPosts(posts, append) {
    const html = posts.map(cardHtml).join('');
    if (append) {
      list.insertAdjacentHTML('beforeend', html);
    } else {
      list.innerHTML = html;
    }
  }

  function renderLoadMoreButton() {
    if (currentPage >= totalPages) {
      loadMoreEl.innerHTML = '';
      return;
    }
    loadMoreEl.innerHTML = `<button id="rw-load-more">Load More</button>`;
    const btn = document.getElementById('rw-load-more');
    if (btn) btn.addEventListener('click', loadNextPage);
  }

  async function loadNextPage() {
    const btn = document.getElementById('rw-load-more');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Loading…';
    }
    currentPage += 1;
    try {
      const { posts, totalPages: tp } = await wpFetchPosts(currentPage);
      totalPages = tp;
      renderPosts(posts, true);
      renderLoadMoreButton();
    } catch (err) {
      console.error(err);
      currentPage -= 1;
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Load More';
      }
    }
  }

  async function loadFirstPage() {
    renderSkeleton();
    try {
      const { posts, totalPages: tp } = await wpFetchPosts(1);
      totalPages = tp;
      if (!posts.length) {
        renderEmpty();
      } else {
        renderPosts(posts, false);
      }
      renderLoadMoreButton();
    } catch (err) {
      console.error(err);
      renderError();
    }
  }

  loadFirstPage();
})();