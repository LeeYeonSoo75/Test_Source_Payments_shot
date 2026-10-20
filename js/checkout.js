/*
 * 주문서 + 토스페이먼츠 결제위젯(v2) 연동
 * 흐름: 위젯 렌더링 → 결제 요청(requestPayment) → successUrl / failUrl 로 이동
 */
(async function () {
  'use strict';

  /*
   * 결제위젯 연동 클라이언트 키
   * 아래 값은 토스페이먼츠 문서용 테스트 키입니다.
   * 실제 연동 시 개발자센터 > API 키 > 결제위젯 연동 키(test_gck_... / live_gck_...)로 교체하세요.
   */
  const CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

  const OT = window.OT;
  const form = document.querySelector('[data-checkout]');
  const payBtn = document.querySelector('[data-pay]');
  const widgetLoading = document.querySelector('[data-widget-loading]');
  const widgetError = document.querySelector('[data-widget-error]');

  const order = OT.storage.get(OT.KEYS.checkout, null);
  const lines = order ? OT.toLines(order.items) : [];

  if (!lines.length) {
    form.hidden = true;
    document.querySelector('[data-checkout-empty]').hidden = false;
    return;
  }

  const sum = OT.summarize(lines);
  const payLabel = OT.won(sum.total) + ' 결제하기';

  /* ---------- 주문 상품 / 금액 ---------- */
  document.querySelector('[data-item-count]').textContent = sum.count + '개';
  document.querySelector('[data-items]').innerHTML = lines.map((l) =>
    '<li>' +
      '<div class="order-item__thumb">' + window.productArt(l.product) + '</div>' +
      '<div>' +
        '<p class="order-item__brand">' + OT.escapeHtml(l.product.brand) + '</p>' +
        '<p class="order-item__name">' + OT.escapeHtml(l.product.name) + '</p>' +
        '<p class="order-item__opt">사이즈 ' + OT.escapeHtml(l.size) + ' · ' + l.qty + '개</p>' +
      '</div>' +
      '<p class="order-item__price">' +
        (l.product.price > l.product.sale ? '<del>' + OT.won(l.product.price * l.qty) + '</del>' : '') +
        OT.won(l.total) +
      '</p>' +
    '</li>'
  ).join('');

  document.querySelector('[data-sum-original]').textContent = OT.won(sum.original);
  document.querySelector('[data-sum-discount]').textContent = sum.discount ? '-' + OT.won(sum.discount) : '0원';
  document.querySelector('[data-sum-shipping]').textContent = sum.shipping ? OT.won(sum.shipping) : '무료';
  document.querySelector('[data-sum-total]').textContent = OT.won(sum.total);
  document.querySelector('[data-sum-point]').textContent = '최대 ' + OT.won(sum.point) + ' 적립 예정';
  payBtn.textContent = payLabel;

  /* ---------- 배송 정보 ---------- */
  const fields = {
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    address: document.getElementById('address'),
    addressDetail: document.getElementById('addressDetail'),
    memo: document.getElementById('memo')
  };

  fields.phone.addEventListener('input', () => {
    const d = fields.phone.value.replace(/\D/g, '').slice(0, 11);
    fields.phone.value = d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4);
  });

  function setError(input, message) {
    const el = document.getElementById(input.id + 'Error');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    el.textContent = message || '';
    el.hidden = !message;
  }

  Object.keys(fields).forEach((k) => {
    fields[k].addEventListener('input', () => {
      if (fields[k].getAttribute('aria-invalid') === 'true') setError(fields[k], '');
    });
  });

  function validate() {
    const name = fields.name.value.trim();
    const phone = fields.phone.value.replace(/\D/g, '');
    const email = fields.email.value.trim();
    const address = fields.address.value.trim();
    const checks = [
      [fields.name, name ? '' : '받는 분 이름을 입력해 주세요.'],
      [fields.phone, /^01[016789]\d{7,8}$/.test(phone) ? '' : '휴대폰 번호를 정확히 입력해 주세요.'],
      [fields.email, !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : '이메일 형식을 확인해 주세요.'],
      [fields.address, address ? '' : '배송받을 주소를 입력해 주세요.']
    ];
    let firstInvalid = null;
    checks.forEach(([input, message]) => {
      setError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return null;
    }
    return { name: name, phone: phone, email: email, address: address + ' ' + fields.addressDetail.value.trim(), memo: fields.memo.value };
  }

  /* 주문번호: 영문 대소문자, 숫자, -, _ 로 6~64자 */
  function createOrderId() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
    return 'OT' + stamp + '-' + rand;
  }

  /* ---------- 토스페이먼츠 결제위젯 ---------- */
  let widgets = null;

  try {
    if (typeof window.TossPayments !== 'function') {
      throw new Error('토스페이먼츠 SDK를 불러오지 못했어요. 네트워크 연결을 확인한 뒤 새로고침해 주세요.');
    }
    const tossPayments = window.TossPayments(CLIENT_KEY);
    widgets = tossPayments.widgets({ customerKey: OT.customerKey() });

    await widgets.setAmount({ currency: 'KRW', value: sum.total });
    await Promise.all([
      widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
      widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' })
    ]);
    widgetLoading.hidden = true;
    payBtn.disabled = false;
  } catch (err) {
    widgets = null;
    widgetLoading.hidden = true;
    widgetError.textContent = (err && err.message) || '결제 수단을 불러오지 못했어요.';
    widgetError.hidden = false;
  }

  let paying = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!widgets || paying) return;

    const customer = validate();
    if (!customer) return;

    const orderId = createOrderId();
    const first = lines[0].product.name;
    const orderName = (lines.length > 1 ? first + ' 외 ' + (lines.length - 1) + '건' : first).slice(0, 100);

    /*
     * 결제 요청 전 주문 정보 임시 저장
     * 실서비스에서는 이 시점에 서버에 orderId·amount를 저장하고,
     * 결제 승인 전에 successUrl로 받은 amount와 일치하는지 서버에서 검증해야 합니다.
     */
    OT.storage.set(OT.KEYS.pending, {
      orderId: orderId,
      orderName: orderName,
      amount: sum.total,
      mode: order.mode,
      items: order.items,
      customer: customer,
      createdAt: Date.now()
    });

    const request = {
      orderId: orderId,
      orderName: orderName,
      successUrl: new URL('success.html', location.href).href,
      failUrl: new URL('fail.html', location.href).href,
      customerName: customer.name,
      customerMobilePhone: customer.phone
    };
    if (customer.email) request.customerEmail = customer.email;

    paying = true;
    payBtn.disabled = true;
    payBtn.textContent = '결제창을 여는 중…';

    try {
      await widgets.requestPayment(request);
    } catch (err) {
      /* 결제창을 닫거나, 약관 미동의 등으로 리다이렉트 없이 끝난 경우 */
      OT.toast((err && err.message) || '결제를 진행하지 못했어요.');
    } finally {
      paying = false;
      payBtn.disabled = false;
      payBtn.textContent = payLabel;
    }
  });
})();
