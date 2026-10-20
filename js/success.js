/*
 * 결제 성공 페이지 (토스페이먼츠 successUrl)
 * 쿼리 파라미터: paymentKey, orderId, amount, paymentType
 */
(async function () {
  'use strict';

  /*
   * 결제 승인 서버 엔드포인트
   * 비워두면 승인 요청 없이 주문 완료 화면만 보여줍니다(퍼블리싱 모드).
   * 서버는 { paymentKey, orderId, amount } 를 받아 아래 API를 호출하면 됩니다.
   *   POST https://api.tosspayments.com/v1/payments/confirm
   *   Authorization: Basic base64(시크릿키 + ':')
   * 시크릿 키는 절대 프론트엔드 코드에 넣지 마세요.
   */
  const CONFIRM_ENDPOINT = '';

  const OT = window.OT;
  const params = new URLSearchParams(location.search);
  const paymentKey = params.get('paymentKey');
  const orderId = params.get('orderId');
  const amount = Number(params.get('amount'));
  const paymentType = params.get('paymentType');

  const $ = (sel) => document.querySelector(sel);

  function fail(title, message) {
    $('[data-result-icon]').className = 'result__icon result__icon--fail';
    $('[data-result-icon]').innerHTML = OT.icons.alert;
    $('[data-result-title]').textContent = title;
    $('[data-result-desc]').textContent = message;
    $('[data-result-actions]').innerHTML =
      '<a class="btn btn--line" href="index.html#cart">장바구니로</a>' +
      '<a class="btn btn--dark" href="checkout.html">다시 결제하기</a>';
    $('[data-result-actions]').hidden = false;
  }

  function complete(record, confirmed) {
    const lines = OT.toLines(record.items);
    $('[data-result-icon]').className = 'result__icon';
    $('[data-result-icon]').innerHTML = OT.icons.check;
    $('[data-result-title]').textContent = '주문이 완료되었어요';
    $('[data-result-desc]').textContent = '주문해 주셔서 감사합니다. 상품을 빠르게 준비해 드릴게요.';

    const rows = [
      ['주문번호', record.orderId],
      ['주문 상품', record.orderName],
      ['받는 분', record.customer ? record.customer.name : '-'],
      ['결제 방식', paymentType === 'BRANDPAY' ? '브랜드페이' : '일반결제'],
      ['결제 금액', OT.won(record.amount), 'receipt__total']
    ];
    if (!confirmed) rows.push(['paymentKey', record.paymentKey, 'receipt__mono']);
    $('[data-receipt]').innerHTML = rows.map(([k, v, cls]) =>
      '<div' + (cls ? ' class="' + cls + '"' : '') + '><dt>' + k + '</dt><dd>' + OT.escapeHtml(v) + '</dd></div>'
    ).join('');
    $('[data-receipt]').hidden = false;

    $('[data-result-items]').innerHTML = lines.map((l) =>
      '<li>' +
        '<div class="order-item__thumb">' + window.productArt(l.product) + '</div>' +
        '<div>' +
          '<p class="order-item__brand">' + OT.escapeHtml(l.product.brand) + '</p>' +
          '<p class="order-item__name">' + OT.escapeHtml(l.product.name) + '</p>' +
          '<p class="order-item__opt">사이즈 ' + OT.escapeHtml(l.size) + ' · ' + l.qty + '개</p>' +
        '</div>' +
        '<p class="order-item__price">' + OT.won(l.total) + '</p>' +
      '</li>'
    ).join('');

    $('[data-dev-note]').hidden = confirmed;
    $('[data-result-actions]').hidden = false;
  }

  if (!paymentKey || !orderId || !amount) {
    return fail('결제 정보를 찾을 수 없어요', '잘못된 접근이거나 결제가 완료되지 않았어요.');
  }

  /* 새로고침 등으로 다시 들어온 경우: 이미 처리된 주문을 그대로 보여줍니다 */
  const last = OT.storage.get(OT.KEYS.lastOrder, null);
  if (last && last.orderId === orderId) return complete(last, last.confirmed);

  /* 결제 요청 전에 저장한 주문 정보와 금액 비교 (실서비스에서는 서버에서 검증) */
  const pending = OT.storage.get(OT.KEYS.pending, null);
  if (!pending || pending.orderId !== orderId) {
    return fail('주문 정보를 찾을 수 없어요', '주문서에서 다시 결제를 진행해 주세요.');
  }
  if (pending.amount !== amount) {
    return fail('결제 금액이 일치하지 않아요', '주문 금액과 결제 금액이 달라 결제를 진행하지 않았어요.');
  }

  let confirmed = false;
  if (CONFIRM_ENDPOINT) {
    try {
      const res = await fetch(CONFIRM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey: paymentKey, orderId: orderId, amount: amount })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const q = new URLSearchParams({ code: data.code || 'CONFIRM_FAILED', message: data.message || '결제 승인에 실패했어요.', orderId: orderId });
        location.replace('fail.html?' + q.toString());
        return;
      }
      confirmed = true;
    } catch (e) {
      return fail('결제 승인에 실패했어요', '네트워크 상태를 확인한 뒤 고객센터로 문의해 주세요.');
    }
  }

  const record = Object.assign({}, pending, { paymentKey: paymentKey, confirmed: confirmed });
  OT.storage.set(OT.KEYS.lastOrder, record);
  OT.storage.remove(OT.KEYS.pending);
  OT.storage.remove(OT.KEYS.checkout);
  if (pending.mode === 'cart') OT.Cart.removeItems(pending.items);

  complete(record, confirmed);
})();
