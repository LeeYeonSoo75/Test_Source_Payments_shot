/*
 * 상품 데이터
 * - 백엔드 연동 시 이 배열을 API 응답으로 교체하면 됩니다.
 * - shape/color/print/stripe/stitch/cargo 는 js/art.js 의 상품 이미지(SVG) 생성용 값입니다.
 *   실제 상품 이미지를 쓰면 image 필드를 추가하고 art.js 대신 <img>로 바꾸세요.
 */
window.CATEGORY_META = {
  top: { label: '상의', subs: ['반소매 티셔츠', '긴소매 티셔츠', '셔츠', '후드', '니트'] },
  pants: { label: '바지', subs: ['데님', '슬랙스', '코튼', '조거', '숏'] },
  socks: { label: '양말', subs: ['크루', '장목', '발목', '패키지'] }
};

window.SIZE_BY_CATEGORY = {
  top: ['S', 'M', 'L', 'XL'],
  pants: ['28', '30', '32', '34', '36'],
  socks: ['FREE']
};

window.PRODUCTS = [
  /* 상의 */
  { id: 't01', cat: 'top', sub: '반소매 티셔츠', brand: 'PLAINROOM', name: '오버핏 헤비코튼 반소매 티셔츠 [화이트]', price: 39000, sale: 29000, shape: 'tee', color: '#ffffff', rating: 4.8, reviews: 3812, likes: 24100, tags: ['무료배송', '단독'] },
  { id: 't02', cat: 'top', sub: '반소매 티셔츠', brand: 'SUNDAYS OFF', name: '피그먼트 로고 반소매 티셔츠 [차콜]', price: 35000, sale: 24500, shape: 'tee', color: '#3b3b3b', print: 'SUNDAYS', rating: 4.7, reviews: 1290, likes: 8800, tags: ['무료배송'] },
  { id: 't03', cat: 'top', sub: '반소매 티셔츠', brand: 'GRAYFIELD', name: '에센셜 크루넥 반소매 티셔츠 [블랙]', price: 29000, sale: 19900, shape: 'tee', color: '#141414', rating: 4.8, reviews: 5402, likes: 31200, tags: ['무료배송'] },
  { id: 't04', cat: 'top', sub: '긴소매 티셔츠', brand: 'NORDIC LAB', name: '워싱 롱슬리브 티셔츠 [멜란지 그레이]', price: 45000, sale: 36000, shape: 'long', color: '#c4c4c4', rating: 4.6, reviews: 742, likes: 5100, tags: ['무료배송'] },
  { id: 't05', cat: 'top', sub: '긴소매 티셔츠', brand: 'MOTIF', name: '보더 스트라이프 롱슬리브 [네이비]', price: 49000, sale: 39200, shape: 'long', color: '#f4f1ea', stripe: '#1f2a44', rating: 4.7, reviews: 618, likes: 6900, tags: ['단독'] },
  { id: 't06', cat: 'top', sub: '셔츠', brand: 'ARCH & LOOP', name: '옥스포드 오버 셔츠 [스카이블루]', price: 59000, sale: 47200, shape: 'shirt', color: '#a9c6e8', rating: 4.8, reviews: 2210, likes: 15400, tags: ['무료배송'] },
  { id: 't07', cat: 'top', sub: '셔츠', brand: 'PLAINROOM', name: '린넨 블렌드 레귤러 셔츠 [아이보리]', price: 69000, sale: 48300, shape: 'shirt', color: '#efe8da', rating: 4.5, reviews: 388, likes: 4200, tags: ['무료배송', '한정'] },
  { id: 't08', cat: 'top', sub: '후드', brand: 'GRAYFIELD', name: '헤비웨이트 후드 티셔츠 [그레이]', price: 79000, sale: 59000, shape: 'hoodie', color: '#7a7a7a', rating: 4.9, reviews: 1874, likes: 19800, tags: ['무료배송'] },
  { id: 't09', cat: 'top', sub: '후드', brand: 'SUNDAYS OFF', name: '아치 로고 후드 티셔츠 [네이비]', price: 89000, sale: 62300, shape: 'hoodie', color: '#23314f', print: 'SO', rating: 4.7, reviews: 905, likes: 11300, tags: ['단독'] },
  { id: 't10', cat: 'top', sub: '니트', brand: 'NORDIC LAB', name: '램스울 크루넥 니트 [오트밀]', price: 99000, sale: 69300, shape: 'knit', color: '#d9c7a7', rating: 4.8, reviews: 1033, likes: 13600, tags: ['무료배송'] },
  { id: 't11', cat: 'top', sub: '니트', brand: 'MOTIF', name: '케이블 니트 스웨터 [버건디]', price: 89000, sale: 71200, shape: 'knit', color: '#6e2430', rating: 4.6, reviews: 274, likes: 3900, tags: [] },
  { id: 't12', cat: 'top', sub: '반소매 티셔츠', brand: 'DAILY MOOD', name: '베이식 반소매 티셔츠 3팩 [라이트 그레이]', price: 45000, sale: 29900, shape: 'tee', color: '#e2e2e2', rating: 4.7, reviews: 6120, likes: 22700, tags: ['무료배송', '한정'] },

  /* 바지 */
  { id: 'p01', cat: 'pants', sub: '데님', brand: 'GRAYFIELD', name: '스트레이트 데님 팬츠 [미드 블루]', price: 69000, sale: 49000, shape: 'straight', color: '#4d6b8f', stitch: '#d9a441', rating: 4.8, reviews: 4410, likes: 28300, tags: ['무료배송', '단독'] },
  { id: 'p02', cat: 'pants', sub: '데님', brand: 'ARCH & LOOP', name: '와이드 데님 팬츠 [라이트 블루]', price: 79000, sale: 55300, shape: 'wide', color: '#8fa9c4', stitch: '#d9a441', rating: 4.7, reviews: 2380, likes: 17900, tags: ['무료배송'] },
  { id: 'p03', cat: 'pants', sub: '슬랙스', brand: 'PLAINROOM', name: '세미와이드 히든밴딩 슬랙스 [블랙]', price: 59000, sale: 41300, shape: 'wide', color: '#1a1a1a', rating: 4.9, reviews: 7820, likes: 40100, tags: ['무료배송'] },
  { id: 'p04', cat: 'pants', sub: '슬랙스', brand: 'NORDIC LAB', name: '원턱 테이퍼드 슬랙스 [그레이]', price: 65000, sale: 52000, shape: 'straight', color: '#7a7a7a', rating: 4.6, reviews: 960, likes: 7400, tags: [] },
  { id: 'p05', cat: 'pants', sub: '조거', brand: 'SUNDAYS OFF', name: '스웻 조거 팬츠 [멜란지 그레이]', price: 49000, sale: 34300, shape: 'jogger', color: '#b5b5b5', rating: 4.7, reviews: 1560, likes: 9800, tags: ['무료배송'] },
  { id: 'p06', cat: 'pants', sub: '조거', brand: 'MOTIF', name: '나일론 트랙 조거 팬츠 [블랙]', price: 59000, sale: 44200, shape: 'jogger', color: '#222222', rating: 4.5, reviews: 412, likes: 3600, tags: ['단독'] },
  { id: 'p07', cat: 'pants', sub: '코튼', brand: 'DAILY MOOD', name: '코튼 치노 팬츠 [베이지]', price: 49000, sale: 39200, shape: 'straight', color: '#cbb594', rating: 4.6, reviews: 830, likes: 6100, tags: ['무료배송'] },
  { id: 'p08', cat: 'pants', sub: '코튼', brand: 'ARCH & LOOP', name: '카고 와이드 팬츠 [올리브]', price: 79000, sale: 59000, shape: 'wide', color: '#5b5f3e', cargo: true, rating: 4.8, reviews: 1990, likes: 14500, tags: ['무료배송', '한정'] },
  { id: 'p09', cat: 'pants', sub: '숏', brand: 'GRAYFIELD', name: '데님 버뮤다 쇼츠 [블루]', price: 49000, sale: 34300, shape: 'shorts', color: '#5d7ea6', stitch: '#d9a441', rating: 4.7, reviews: 640, likes: 5200, tags: [] },
  { id: 'p10', cat: 'pants', sub: '숏', brand: 'PLAINROOM', name: '나일론 이지 쇼츠 [차콜]', price: 39000, sale: 27300, shape: 'shorts', color: '#3c3c3c', rating: 4.6, reviews: 1120, likes: 8300, tags: ['무료배송'] },

  /* 양말 */
  { id: 's01', cat: 'socks', sub: '크루', brand: 'FOOTNOTE', name: '베이식 크루 삭스 [화이트]', price: 6900, sale: 4900, shape: 'crew', color: '#f7f7f7', rating: 4.8, reviews: 9210, likes: 18200, tags: ['단독'] },
  { id: 's02', cat: 'socks', sub: '크루', brand: 'FOOTNOTE', name: '베이식 크루 삭스 [블랙]', price: 6900, sale: 4900, shape: 'crew', color: '#1b1b1b', rating: 4.8, reviews: 7440, likes: 15100, tags: [] },
  { id: 's03', cat: 'socks', sub: '크루', brand: 'SOCKLAB', name: '투라인 스포츠 삭스 [화이트/네이비]', price: 8900, sale: 6900, shape: 'crew', color: '#ffffff', stripe: '#1f2a44', rating: 4.7, reviews: 2380, likes: 9700, tags: [] },
  { id: 's04', cat: 'socks', sub: '크루', brand: 'SOCKLAB', name: '컬러 립 삭스 [포레스트]', price: 7900, sale: 5500, shape: 'crew', color: '#2f5a46', rating: 4.6, reviews: 860, likes: 4100, tags: [] },
  { id: 's05', cat: 'socks', sub: '장목', brand: 'DAILY MOOD', name: '니하이 롱 삭스 [그레이]', price: 9900, sale: 7900, shape: 'long', color: '#9a9a9a', rating: 4.5, reviews: 510, likes: 2900, tags: [] },
  { id: 's06', cat: 'socks', sub: '장목', brand: 'SOCKLAB', name: '컬리지 롱 삭스 [아이보리/버건디]', price: 11000, sale: 8800, shape: 'long', color: '#f1ece0', stripe: '#7b1f2b', rating: 4.7, reviews: 1320, likes: 6600, tags: ['단독'] },
  { id: 's07', cat: 'socks', sub: '발목', brand: 'FOOTNOTE', name: '쿠션 앵클 삭스 [블랙]', price: 6500, sale: 4500, shape: 'ankle', color: '#222222', rating: 4.6, reviews: 2970, likes: 7300, tags: [] },
  { id: 's08', cat: 'socks', sub: '발목', brand: 'MOTIF', name: '스니커즈 앵클 삭스 [베이지]', price: 6500, sale: 5200, shape: 'ankle', color: '#e2d6c2', rating: 4.5, reviews: 640, likes: 2100, tags: [] },
  { id: 's09', cat: 'socks', sub: '패키지', brand: 'PLAINROOM', name: '데일리 크루 삭스 3팩 [멜란지]', price: 19000, sale: 13300, shape: 'crew', color: '#c2c2c2', rating: 4.8, reviews: 3150, likes: 11900, tags: ['무료배송', '한정'] },
  { id: 's10', cat: 'socks', sub: '패키지', brand: 'FOOTNOTE', name: '페이크 삭스 5팩 [혼합]', price: 15900, sale: 9900, shape: 'ankle', color: '#e9e3d8', rating: 4.7, reviews: 4880, likes: 13400, tags: ['한정'] }
];

window.PRODUCTS.forEach(function (p) {
  p.sizes = p.sizes || window.SIZE_BY_CATEGORY[p.cat];
});
