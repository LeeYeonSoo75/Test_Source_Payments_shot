/*
 * 결제 실패 페이지 (토스페이먼츠 failUrl)
 * 쿼리 파라미터: code, message, orderId (구매자가 취소한 경우 orderId 없음)
 */
(function () {
  'use strict';

  const OT = window.OT;
  const params = new URLSearchParams(location.search);
  const code = params.get('code') || 'UNKNOWN_ERROR';
  const message = params.get('message') || '알 수 없는 오류가 발생했어요.';
  const orderId = params.get('orderId');
  const canceled = code === 'PAY_PROCESS_CANCELED';

  document.querySelector('[data-result-icon]').innerHTML = OT.icons.alert;
  document.querySelector('[data-result-title]').textContent = canceled ? '결제를 취소했어요' : '결제에 실패했어요';
  document.querySelector('[data-result-desc]').textContent = canceled ? '주문서로 돌아가 다시 결제할 수 있어요.' : message;

  const rows = [['에러 코드', code]];
  if (orderId) rows.push(['주문번호', orderId]);
  if (!canceled) rows.push(['사유', message]);
  document.querySelector('[data-receipt]').innerHTML = rows.map(([k, v]) =>
    '<div><dt>' + k + '</dt><dd>' + OT.escapeHtml(v) + '</dd></div>'
  ).join('');

  OT.storage.remove(OT.KEYS.pending);

  /* 주문서 정보가 없으면 다시 결제하기 대신 쇼핑으로 */
  if (!OT.storage.get(OT.KEYS.checkout, null)) {
    const retry = document.querySelector('[data-retry]');
    retry.textContent = '쇼핑 계속하기';
    retry.href = 'index.html';
  }
})();
