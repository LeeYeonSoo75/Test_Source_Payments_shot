/*
 * AI 사이트맵(llms-full.txt) 생성
 * - llms.txt가 사이트 안내라면, llms-full.txt는 AI 검색·답변 엔진이 한 번에 읽을 수 있는 전체 상품 카탈로그다.
 * - js/products.js와 카테고리 페이지의 FAQ(JSON-LD)에서 만든다.
 * 상품 데이터나 FAQ를 바꾸면 다시 실행: node tools/llms-full.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://testsourcepayments.vercel.app';
const PAGES = { top: { file: 'index.html', url: SITE + '/' }, pants: { file: 'pants.html', url: SITE + '/pants.html' }, socks: { file: 'socks.html', url: SITE + '/socks.html' } };

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/products.js'), 'utf8'), ctx);
const { PRODUCTS, CATEGORY_META } = ctx.window;

const won = (n) => n.toLocaleString('ko-KR') + '원';
const rate = (p) => Math.round(((p.price - p.sale) / p.price) * 100);

function faqOf(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const faq = (JSON.parse(m[1])['@graph'] || []).find((g) => g['@type'] === 'FAQPage');
    if (faq) return faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);
  }
  return [];
}

const out = [
  '# OTSTORE 전체 상품 카탈로그',
  '',
  '> 토스페이먼츠 결제위젯 연동을 보여주는 의류 쇼핑몰 퍼블리싱 데모 OTSTORE의 전체 상품과 자주 묻는 질문입니다. ' +
    '가격은 원화(KRW) 판매가 기준이며, 결제는 테스트 키로 동작해 실제로 청구되지 않습니다.',
  '',
  '- 사이트 안내: ' + SITE + '/llms.txt',
  '- 사이트맵: ' + SITE + '/sitemap.xml',
  '- 상품 수: ' + PRODUCTS.length + '개',
  '- 배송비: 3,000원, 상품 금액 50,000원 이상이면 무료배송',
  '',
];

const seenFaq = new Set();
const commonFaq = [];
for (const [cat, page] of Object.entries(PAGES)) {
  const meta = CATEGORY_META[cat];
  const items = PRODUCTS.filter((p) => p.cat === cat);
  out.push('## ' + meta.label + ' (' + items.length + '개)', '');
  out.push('- 페이지: ' + page.url);
  out.push('- 세부 카테고리: ' + meta.subs.join(', '));
  out.push('- 사이즈: ' + items[0].sizes.join(', '));
  out.push('');
  out.push('| 상품명 | 브랜드 | 세부 카테고리 | 판매가 | 정가 | 할인율 | 이미지 |');
  out.push('|---|---|---|---|---|---|---|');
  for (const p of items) {
    out.push('| ' + [p.name, p.brand, p.sub, won(p.sale), won(p.price), rate(p) + '%', SITE + '/img/products/' + p.id + '.svg'].join(' | ') + ' |');
  }
  out.push('');
  for (const [q, a] of faqOf(page.file).filter(([q]) => !seenFaq.has(q))) {
    seenFaq.add(q);
    /* 사이즈 질문은 카테고리별, 나머지는 공통 FAQ로 모은다 */
    if (q.includes('사이즈')) out.push('### ' + q, '', a, '');
    else commonFaq.push([q, a]);
  }
}

out.push('## 자주 묻는 질문', '');
for (const [q, a] of commonFaq) out.push('### ' + q, '', a, '');

fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), out.join('\n'));
console.log('llms-full.txt 생성: 상품 ' + PRODUCTS.length + '개, FAQ ' + seenFaq.size + '개');
