/*
 * 공통 스크립트: 저장소, 금액 계산, 장바구니, 장바구니 드로어, 토스트
 * 모든 페이지에서 products.js, art.js 다음에 불러옵니다.
 */
(function () {
  'use strict';

  const KEYS = {
    cart: 'otstore.cart',
    likes: 'otstore.likes',
    checkout: 'otstore.checkout',
    pending: 'otstore.pendingOrder',
    lastOrder: 'otstore.lastOrder',
    customerKey: 'otstore.customerKey'
  };

  const SHIPPING_FEE = 3000;
  const FREE_SHIPPING_MIN = 50000;
  const MAX_QTY = 20;

  const ICONS = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 6.5v7M12 17.5v.01"/></svg>',
    heart: '<svg viewBox="0 0 24 24" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.4 3.2 5 6.5 5c2 0 3.3 1.1 4 2.2.2.3.8.3 1 0C12.2 6.1 13.5 5 15.5 5c3.3 0 5.2 3.4 3.7 6.4C17 15.6 12 20 12 20z"/></svg>'
  };

  /* ---------- 저장소 (사생활 보호 모드 등에서 실패해도 동작하도록) ---------- */
  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* noop */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* noop */ }
    }
  };

  /* ---------- 포맷 ---------- */
  const won = (n) => n.toLocaleString('ko-KR') + '원';
  const rate = (p) => Math.round(((p.price - p.sale) / p.price) * 100);
  const compact = (n) => (n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '만' : n.toLocaleString('ko-KR'));
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const findProduct = (id) => window.PRODUCTS.find((p) => p.id === id);

  /* items: [{ id, size, qty }] → 상품 정보가 붙은 주문 라인 */
  function toLines(items) {
    return (items || [])
      .map((item) => {
        const product = findProduct(item.id);
        if (!product) return null;
        return { key: item.id + '_' + item.size, id: item.id, size: item.size, qty: item.qty, product: product, total: product.sale * item.qty };
      })
      .filter(Boolean);
  }

  function summarize(lines) {
    const original = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    return {
      count: lines.reduce((s, l) => s + l.qty, 0),
      original: original,
      discount: original - subtotal,
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping,
      point: Math.floor(subtotal * 0.05),
      freeShippingLeft: shipping ? FREE_SHIPPING_MIN - subtotal : 0
    };
  }

  /* ---------- 장바구니 ---------- */
  const Cart = {
    items() {
      return storage.get(KEYS.cart, []);
    },
    save(items) {
      storage.set(KEYS.cart, items);
      document.dispatchEvent(new CustomEvent('cart:change'));
    },
    add(id, size, qty) {
      const items = this.items();
      const found = items.find((i) => i.id === id && i.size === size);
      if (found) found.qty = Math.min(MAX_QTY, found.qty + qty);
      else items.push({ id: id, size: size, qty: qty });
      this.save(items);
    },
    setQty(key, qty) {
      const items = this.items();
      const found = items.find((i) => i.id + '_' + i.size === key);
      if (!found) return;
      found.qty = Math.max(1, Math.min(MAX_QTY, qty));
      this.save(items);
    },
    remove(key) {
      this.save(this.items().filter((i) => i.id + '_' + i.size !== key));
    },
    removeItems(list) {
      const keys = list.map((i) => i.id + '_' + i.size);
      this.save(this.items().filter((i) => keys.indexOf(i.id + '_' + i.size) === -1));
    },
    count() {
      return this.items().reduce((s, i) => s + i.qty, 0);
    }
  };

  /* mode: 'cart'(장바구니 구매) | 'direct'(바로 구매) */
  function startCheckout(mode, items) {
    storage.set(KEYS.checkout, { mode: mode, items: items, createdAt: Date.now() });
    location.href = 'checkout.html';
  }

  /* 토스페이먼츠 customerKey: 구매자 식별용 무작위 값 (회원제라면 회원 ID 기반의 무작위 값으로 교체) */
  function customerKey() {
    let key = storage.get(KEYS.customerKey, null);
    if (!key) {
      const bytes = new Uint8Array(12);
      (window.crypto || window.msCrypto).getRandomValues(bytes);
      key = 'OT_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      storage.set(KEYS.customerKey, key);
    }
    return key;
  }

  /* ---------- 스크롤 잠금 ---------- */
  let lockCount = 0;
  function lockScroll(on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.documentElement.classList.toggle('is-locked', lockCount > 0);
  }

  /* ---------- 토스트 ---------- */
  let toastEl = null;
  let toastTimer = null;
  function toast(message, action) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span>' + escapeHtml(message) + '</span>' +
      (action ? '<button type="button" class="toast__action">' + escapeHtml(action.label) + '</button>' : '');
    if (action) toastEl.querySelector('button').addEventListener('click', () => { hideToast(); action.onClick(); });
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 2600);
  }
  function hideToast() {
    if (toastEl) toastEl.classList.remove('is-show');
  }

  /* ---------- 장바구니 드로어 ---------- */
  let drawer = null;
  let drawerReturnFocus = null;

  function buildDrawer() {
    drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = 'cartDrawer';
    drawer.innerHTML =
      '<div class="drawer__dim" data-close-cart></div>' +
      '<section class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle" tabindex="-1">' +
        '<header class="drawer__head">' +
          '<h2 id="cartTitle">장바구니 <span class="drawer__count" data-drawer-count>0</span></h2>' +
          '<button type="button" class="icon-btn" data-close-cart aria-label="장바구니 닫기">' + ICONS.close + '</button>' +
        '</header>' +
        '<div class="drawer__body" data-drawer-body></div>' +
        '<footer class="drawer__foot" data-drawer-foot></footer>' +
      '</section>';
    document.body.appendChild(drawer);

    drawer.addEventListener('click', (e) => {
      const t = e.target.closest('button, [data-close-cart]');
      if (!t) return;
      if (t.hasAttribute('data-close-cart')) return closeCart();
      if (t.dataset.step) {
        const line = Cart.items().find((i) => i.id + '_' + i.size === t.dataset.key);
        if (line) Cart.setQty(t.dataset.key, line.qty + Number(t.dataset.step));
      }
      if (t.hasAttribute('data-remove')) Cart.remove(t.dataset.key);
      if (t.hasAttribute('data-checkout')) startCheckout('cart', Cart.items());
    });
  }

  function renderDrawer() {
    if (!drawer) return;
    const lines = toLines(Cart.items());
    const sum = summarize(lines);
    const body = drawer.querySelector('[data-drawer-body]');
    const foot = drawer.querySelector('[data-drawer-foot]');
    drawer.querySelector('[data-drawer-count]').textContent = sum.count;

    if (!lines.length) {
      body.innerHTML =
        '<div class="empty-state">' +
          '<p class="empty-state__title">장바구니에 담긴 상품이 없어요</p>' +
          '<p class="empty-state__desc">마음에 드는 상품을 담아보세요.</p>' +
          '<button type="button" class="btn btn--line" data-close-cart>쇼핑 계속하기</button>' +
        '</div>';
      foot.hidden = true;
      return;
    }

    body.innerHTML = '<ul class="cart-list">' + lines.map((l) =>
      '<li class="cart-item">' +
        '<div class="cart-item__thumb">' + window.productArt(l.product) + '</div>' +
        '<div class="cart-item__info">' +
          '<p class="cart-item__brand">' + escapeHtml(l.product.brand) + '</p>' +
          '<p class="cart-item__name">' + escapeHtml(l.product.name) + '</p>' +
          '<p class="cart-item__opt">사이즈 ' + escapeHtml(l.size) + '</p>' +
          '<div class="cart-item__row">' +
            '<div class="qty qty--sm">' +
              '<button type="button" data-step="-1" data-key="' + l.key + '" aria-label="수량 줄이기"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
              '<span class="qty__value">' + l.qty + '</span>' +
              '<button type="button" data-step="1" data-key="' + l.key + '" aria-label="수량 늘리기"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<strong class="cart-item__price">' + won(l.total) + '</strong>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="cart-item__remove icon-btn" data-remove data-key="' + l.key + '" aria-label="' + escapeHtml(l.product.name) + ' 삭제">' + ICONS.close + '</button>' +
      '</li>'
    ).join('') + '</ul>';

    foot.hidden = false;
    foot.innerHTML =
      (sum.freeShippingLeft ? '<p class="free-ship-hint">' + won(sum.freeShippingLeft) + ' 더 담으면 무료배송</p>' : '<p class="free-ship-hint">무료배송 조건을 충족했어요</p>') +
      '<dl class="sum">' +
        '<div class="sum__row"><dt>상품 금액</dt><dd>' + won(sum.original) + '</dd></div>' +
        (sum.discount ? '<div class="sum__row"><dt>할인 금액</dt><dd class="is-sale">-' + won(sum.discount) + '</dd></div>' : '') +
        '<div class="sum__row"><dt>배송비</dt><dd>' + (sum.shipping ? won(sum.shipping) : '무료') + '</dd></div>' +
        '<div class="sum__row sum__row--total"><dt>결제 예정 금액</dt><dd>' + won(sum.total) + '</dd></div>' +
      '</dl>' +
      '<button type="button" class="btn btn--dark btn--block" data-checkout>' + sum.count + '개 상품 구매하기</button>';
  }

  function openCart() {
    if (!drawer) return;
    renderDrawer();
    drawerReturnFocus = document.activeElement;
    drawer.classList.add('is-open');
    lockScroll(true);
    drawer.querySelector('.drawer__panel').focus();
  }

  function closeCart() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    lockScroll(false);
    if (drawerReturnFocus) drawerReturnFocus.focus();
  }

  function updateBadges() {
    const n = Cart.count();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = n > 99 ? '99+' : n;
      el.hidden = n === 0;
    });
  }

  /* ---------- 초기화 ---------- */
  if (document.querySelector('[data-open-cart]')) {
    buildDrawer();
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-cart]')) {
        e.preventDefault();
        openCart();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCart();
    });
    if (location.hash === '#cart') openCart();
  }

  document.addEventListener('cart:change', () => {
    updateBadges();
    renderDrawer();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === KEYS.cart) document.dispatchEvent(new CustomEvent('cart:change'));
  });
  updateBadges();

  window.OT = {
    KEYS: KEYS,
    MAX_QTY: MAX_QTY,
    icons: ICONS,
    storage: storage,
    won: won,
    rate: rate,
    compact: compact,
    escapeHtml: escapeHtml,
    findProduct: findProduct,
    toLines: toLines,
    summarize: summarize,
    Cart: Cart,
    startCheckout: startCheckout,
    customerKey: customerKey,
    lockScroll: lockScroll,
    toast: toast,
    openCart: openCart,
    closeCart: closeCart
  };
})();
