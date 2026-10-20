/*
 * 상품 목록 페이지 (상의 / 바지 / 양말)
 * <body data-category="top|pants|socks"> 값으로 카테고리를 결정합니다.
 */
(function () {
  'use strict';

  const OT = window.OT;
  const category = document.body.dataset.category;
  const meta = window.CATEGORY_META[category];
  const all = window.PRODUCTS.filter((p) => p.cat === category);
  const state = { sub: '전체', sort: 'recommend', query: '' };

  const grid = document.querySelector('[data-grid]');
  const chips = document.querySelector('[data-chips]');
  const countEl = document.querySelector('[data-count]');
  const emptyEl = document.querySelector('[data-empty]');
  const sortEl = document.querySelector('[data-sort]');
  const searchForm = document.querySelector('[data-search]');
  const searchInput = searchForm ? searchForm.querySelector('input') : null;
  const bannerArt = document.querySelector('[data-banner-art]');

  const SORTERS = {
    recommend: () => 0,
    low: (a, b) => a.sale - b.sale,
    high: (a, b) => b.sale - a.sale,
    discount: (a, b) => OT.rate(b) - OT.rate(a),
    review: (a, b) => b.reviews - a.reviews
  };

  let likes = OT.storage.get(OT.KEYS.likes, []);
  const isLiked = (id) => likes.indexOf(id) !== -1;

  function visibleProducts() {
    const q = state.query.trim().toLowerCase();
    return all
      .filter((p) => state.sub === '전체' || p.sub === state.sub)
      .filter((p) => !q || (p.brand + ' ' + p.name + ' ' + p.sub).toLowerCase().indexOf(q) !== -1)
      .slice()
      .sort(SORTERS[state.sort]);
  }

  function cardTemplate(p) {
    const liked = isLiked(p.id);
    const badge = p.tags.indexOf('단독') !== -1 ? '<span class="product__badge">단독</span>' : '';
    const tags = p.tags.filter((t) => t !== '단독').map((t) => '<span class="tag">' + t + '</span>').join('');
    return (
      '<li class="product">' +
        '<div class="product__thumb">' +
          '<button type="button" class="product__img" data-quick="' + p.id + '" tabindex="-1" aria-hidden="true">' + window.productArt(p) + '</button>' +
          badge +
          '<button type="button" class="like" data-like="' + p.id + '" aria-pressed="' + liked + '" aria-label="' + OT.escapeHtml(p.name) + ' 좋아요">' + OT.icons.heart + '</button>' +
        '</div>' +
        '<button type="button" class="product__info" data-quick="' + p.id + '">' +
          '<span class="product__brand">' + OT.escapeHtml(p.brand) + '</span>' +
          '<span class="product__name">' + OT.escapeHtml(p.name) + '</span>' +
          '<span class="product__price"><span class="product__rate">' + OT.rate(p) + '%</span>' + OT.won(p.sale) + '</span>' +
          '<span class="product__meta">' +
            '<span>♥ ' + OT.compact(p.likes + (liked ? 1 : 0)) + '</span>' +
            '<span>★ ' + p.rating.toFixed(1) + ' (' + p.reviews.toLocaleString('ko-KR') + ')</span>' +
          '</span>' +
          (tags ? '<span class="product__tags">' + tags + '</span>' : '') +
        '</button>' +
      '</li>'
    );
  }

  function renderChips() {
    chips.innerHTML = ['전체'].concat(meta.subs).map((sub) =>
      '<button type="button" class="chip" data-sub="' + sub + '" aria-pressed="' + (sub === state.sub) + '">' + sub + '</button>'
    ).join('');
  }

  function render() {
    const list = visibleProducts();
    grid.innerHTML = list.map(cardTemplate).join('');
    countEl.textContent = list.length;
    emptyEl.hidden = list.length > 0;
  }

  /* ---------- 이벤트 ---------- */
  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-sub]');
    if (!chip) return;
    state.sub = chip.dataset.sub;
    renderChips();
    render();
  });

  sortEl.addEventListener('change', () => {
    state.sort = sortEl.value;
    render();
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => e.preventDefault());
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value;
      render();
    });
  }

  grid.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('[data-like]');
    if (likeBtn) {
      const id = likeBtn.dataset.like;
      likes = isLiked(id) ? likes.filter((x) => x !== id) : likes.concat(id);
      OT.storage.set(OT.KEYS.likes, likes);
      const card = likeBtn.closest('.product');
      card.outerHTML = cardTemplate(OT.findProduct(id));
      const next = grid.querySelector('[data-like="' + id + '"]');
      if (next) next.focus();
      return;
    }
    const open = e.target.closest('[data-quick]');
    if (open) openQuick(open.dataset.quick);
  });

  /* ---------- 옵션 선택 모달 ---------- */
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML =
    '<div class="modal__dim" data-close-modal></div>' +
    '<section class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="qvName" tabindex="-1">' +
      '<button type="button" class="modal__close icon-btn" data-close-modal aria-label="닫기">' + OT.icons.close + '</button>' +
      '<div class="qv" data-qv></div>' +
    '</section>';
  document.body.appendChild(modal);

  let current = null;
  let modalReturnFocus = null;

  function quickTemplate(p) {
    const sizes = p.sizes.map((s) =>
      '<label class="size-opt"><input type="radio" name="qvSize" value="' + s + '"' + (current.size === s ? ' checked' : '') + '><span>' + s + '</span></label>'
    ).join('');
    return (
      '<div class="qv__thumb">' + window.productArt(p) + '</div>' +
      '<div class="qv__info">' +
        '<p class="qv__brand">' + OT.escapeHtml(p.brand) + '</p>' +
        '<h2 class="qv__name" id="qvName">' + OT.escapeHtml(p.name) + '</h2>' +
        '<p class="qv__meta">★ ' + p.rating.toFixed(1) + ' · 후기 ' + p.reviews.toLocaleString('ko-KR') + '개</p>' +
        '<div class="qv__price">' +
          '<del class="qv__orig">' + OT.won(p.price) + '</del>' +
          '<p><span class="qv__rate">' + OT.rate(p) + '%</span><strong class="qv__now">' + OT.won(p.sale) + '</strong></p>' +
        '</div>' +
        '<dl class="qv__spec">' +
          '<div><dt>배송</dt><dd>' + (p.tags.indexOf('무료배송') !== -1 ? '무료배송' : '5만원 이상 무료배송 (미만 3,000원)') + '</dd></div>' +
          '<div><dt>적립</dt><dd>최대 ' + OT.won(Math.floor(p.sale * 0.05)) + ' (5%)</dd></div>' +
        '</dl>' +
        '<fieldset class="qv__section">' +
          '<legend class="qv__label">사이즈</legend>' +
          '<div class="size-list">' + sizes + '</div>' +
          '<p class="qv__error" data-qv-error role="alert" hidden>사이즈를 선택해 주세요.</p>' +
        '</fieldset>' +
        '<div class="qv__section qv__qty">' +
          '<span class="qv__label">수량</span>' +
          '<div class="qty">' +
            '<button type="button" data-qv-step="-1" aria-label="수량 줄이기">−</button>' +
            '<span class="qty__value" data-qv-qty aria-live="polite">1</span>' +
            '<button type="button" data-qv-step="1" aria-label="수량 늘리기">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="qv__total"><span>총 상품 금액</span><strong data-qv-total>' + OT.won(p.sale) + '</strong></div>' +
        '<div class="qv__actions">' +
          '<button type="button" class="btn btn--line" data-qv-cart>장바구니</button>' +
          '<button type="button" class="btn btn--dark" data-qv-buy>구매하기</button>' +
        '</div>' +
      '</div>'
    );
  }

  function updateQuick() {
    modal.querySelector('[data-qv-qty]').textContent = current.qty;
    modal.querySelector('[data-qv-total]').textContent = OT.won(current.product.sale * current.qty);
    modal.querySelector('[data-qv-step="-1"]').disabled = current.qty <= 1;
    modal.querySelector('[data-qv-step="1"]').disabled = current.qty >= OT.MAX_QTY;
  }

  function openQuick(id) {
    const p = OT.findProduct(id);
    if (!p) return;
    current = { product: p, size: p.sizes.length === 1 ? p.sizes[0] : '', qty: 1 };
    modal.querySelector('[data-qv]').innerHTML = quickTemplate(p);
    updateQuick();
    modalReturnFocus = document.activeElement;
    modal.classList.add('is-open');
    OT.lockScroll(true);
    modal.querySelector('.modal__panel').focus();
  }

  function closeQuick() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    OT.lockScroll(false);
    if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
  }

  function requireSize() {
    const error = modal.querySelector('[data-qv-error]');
    error.hidden = !!current.size;
    if (!current.size) {
      const list = modal.querySelector('.size-list');
      list.classList.remove('is-shake');
      void list.offsetWidth;
      list.classList.add('is-shake');
      modal.querySelector('input[name="qvSize"]').focus();
    }
    return !!current.size;
  }

  modal.addEventListener('change', (e) => {
    if (e.target.name === 'qvSize') {
      current.size = e.target.value;
      modal.querySelector('[data-qv-error]').hidden = true;
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) return closeQuick();

    const step = e.target.closest('[data-qv-step]');
    if (step) {
      current.qty = Math.max(1, Math.min(OT.MAX_QTY, current.qty + Number(step.dataset.qvStep)));
      return updateQuick();
    }

    if (e.target.closest('[data-qv-cart]')) {
      if (!requireSize()) return;
      OT.Cart.add(current.product.id, current.size, current.qty);
      closeQuick();
      OT.toast('장바구니에 담았어요', { label: '바로가기', onClick: OT.openCart });
      return;
    }

    if (e.target.closest('[data-qv-buy]')) {
      if (!requireSize()) return;
      OT.startCheckout('direct', [{ id: current.product.id, size: current.size, qty: current.qty }]);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQuick();
  });

  /* ---------- 초기 렌더 ---------- */
  if (bannerArt) {
    bannerArt.innerHTML = all.slice(0, 3).map((p) => '<div class="banner__item">' + window.productArt(p) + '</div>').join('');
  }
  renderChips();
  render();
})();
