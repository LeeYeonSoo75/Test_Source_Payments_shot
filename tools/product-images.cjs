/*
 * 상품 이미지(SVG) 파일 생성 + 구조화 데이터(JSON-LD) image 반영
 * - js/art.js 의 productArt()로 img/products/<상품 id>.svg 를 만든다.
 * - index.html / pants.html / socks.html 의 Product 항목에 image URL을 넣는다.
 * 상품 데이터(js/products.js)나 art.js를 바꾸면 다시 실행: node tools/product-images.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://testsourcepayments.vercel.app';
const PAGES = ['index.html', 'pants.html', 'socks.html'];
const BG = '#f2f2f2'; /* 상품 썸네일 배경(--gray-100)과 같은 색 */

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/products.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/art.js'), 'utf8'), ctx);
const { PRODUCTS, productArt } = ctx.window;

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const imageUrl = (p) => SITE + '/img/products/' + p.id + '.svg';

const outDir = path.join(ROOT, 'img/products');
fs.mkdirSync(outDir, { recursive: true });
for (const p of PRODUCTS) {
  const svg = productArt(p)
    .replace('<svg viewBox="0 0 200 240" aria-hidden="true" focusable="false">',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="1000" height="1200" role="img">' +
      '<title>' + escapeXml(p.brand + ' ' + p.name) + '</title>' +
      '<rect width="200" height="240" fill="' + BG + '"/>');
  fs.writeFileSync(path.join(outDir, p.id + '.svg'), svg + '\n');
}
console.log('SVG ' + PRODUCTS.length + '개 생성');

const byName = new Map(PRODUCTS.map((p) => [p.name, p]));
const LD = /( *)<script type="application\/ld\+json">\r?\n([\s\S]*?)\r?\n *<\/script>/g;

for (const file of PAGES) {
  const full = path.join(ROOT, file);
  const html = fs.readFileSync(full, 'utf8');
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  let count = 0;
  const next = html.replace(LD, (block, indent, json) => {
    const data = JSON.parse(json);
    const list = (data['@graph'] || []).find((g) => g['@type'] === 'ItemList');
    if (!list) return block;
    for (const li of list.itemListElement) {
      const p = byName.get(li.item.name);
      if (!p) throw new Error(file + ': 상품 데이터에 없는 이름 ' + li.item.name);
      /* image를 name 바로 뒤에 둔다 */
      const { '@type': type, name, image, ...rest } = li.item;
      li.item = { '@type': type, name: name, image: imageUrl(p), ...rest };
      count++;
    }
    const body = JSON.stringify(data, null, 2).replace(/</g, '\\u003c').replace(/^/gm, indent);
    return indent + '<script type="application/ld+json">' + eol + body.replace(/\n/g, eol) + eol + indent + '</script>';
  });
  fs.writeFileSync(full, next);
  console.log(file + ': Product ' + count + '개에 image 반영');
}
