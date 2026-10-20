/*
 * 상품 이미지(SVG) 생성기
 * 실제 상품 사진이 준비되면 OT.productArt 대신 <img src="..."> 로 교체하세요.
 */
(function () {
  'use strict';

  var OUTLINE = 'rgba(0,0,0,.14)';
  var uidSeed = 0;

  function rgb(hex) {
    var n = parseInt(hex.replace('#', ''), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }

  function mix(hex, toWhite, amount) {
    var t = toWhite ? 255 : 0;
    return '#' + rgb(hex).map(function (v) {
      return Math.round(v + (t - v) * amount).toString(16).padStart(2, '0');
    }).join('');
  }

  function isDark(hex) {
    var c = rgb(hex);
    return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000 < 110;
  }

  /* 어두운 색은 밝게, 밝은 색은 어둡게 — 디테일(시보리, 주머니 등) 표현용 */
  function tone(hex, amount) {
    return isDark(hex) ? mix(hex, true, amount) : mix(hex, false, amount);
  }

  /* ---------- 상의 ---------- */
  var TEE = 'M72 42 L50 50 L22 78 L40 104 L60 92 L60 206 L140 206 L140 92 L160 104 L178 78 L150 50 L128 42 Q100 62 72 42 Z';
  var LONG = 'M72 42 L50 50 L34 80 L22 176 L42 180 L60 104 L60 206 L140 206 L140 104 L158 180 L178 176 L166 80 L150 50 L128 42 Q100 62 72 42 Z';

  function top(p, uid) {
    var base = p.color;
    var d = tone(base, 0.14);
    var deep = tone(base, 0.28);
    var body = p.shape === 'tee' ? TEE : LONG;
    var s = '';

    if (p.shape === 'hoodie') {
      s += '<path d="M74 46 Q70 14 100 12 Q130 14 126 46 Z" fill="' + d + '" stroke="' + OUTLINE + '" stroke-width="1.2"/>';
    }
    s += '<path d="' + body + '" fill="' + base + '" stroke="' + OUTLINE + '" stroke-width="1.2" stroke-linejoin="round"/>';

    if (p.stripe) {
      s += '<defs><clipPath id="clip-' + uid + '"><path d="' + body + '"/></clipPath></defs><g clip-path="url(#clip-' + uid + ')" fill="' + p.stripe + '">';
      for (var y = 60; y < 206; y += 18) s += '<rect x="0" y="' + y + '" width="200" height="7"/>';
      s += '</g>';
    }

    if (p.shape === 'shirt') {
      s += '<path d="M100 62 L100 206" stroke="' + d + '" stroke-width="2"/>';
      [86, 114, 142, 170].forEach(function (cy) {
        s += '<circle cx="104" cy="' + cy + '" r="2.4" fill="' + deep + '"/>';
      });
      s += '<path d="M112 94 L132 94 L132 114 L112 114 Z" fill="none" stroke="' + d + '" stroke-width="1.6"/>';
      s += '<path d="M73 40 L100 62 L84 74 Z M127 40 L100 62 L116 74 Z" fill="' + mix(base, !isDark(base), 0.08) + '" stroke="' + OUTLINE + '" stroke-width="1.2" stroke-linejoin="round"/>';
    } else if (p.shape === 'hoodie') {
      s += '<path d="M80 44 Q100 72 120 44 Q100 54 80 44 Z" fill="' + deep + '"/>';
      s += '<path d="M93 58 L91 92 M107 58 L109 92" stroke="' + d + '" stroke-width="2" stroke-linecap="round"/>';
      s += '<path d="M74 150 L126 150 L134 188 L66 188 Z" fill="none" stroke="' + d + '" stroke-width="2.4" stroke-linejoin="round"/>';
      s += '<path d="M60 194 L140 194 L140 206 L60 206 Z" fill="' + d + '"/>';
    } else {
      s += '<path d="M72 42 Q100 62 128 42" fill="none" stroke="' + d + '" stroke-width="4" stroke-linecap="round"/>';
    }

    if (p.shape === 'knit') {
      s += '<path d="M60 192 L140 192 L140 206 L60 206 Z M23 166 L43 170 L42 180 L22 176 Z M157 170 L177 166 L178 176 L158 180 Z" fill="' + d + '"/>';
      s += '<path d="M82 70 Q86 78 82 86 Q78 94 82 102 Q86 110 82 118 Q78 126 82 134 Q86 142 82 150 Q78 158 82 166 Q86 174 82 184 M118 70 Q114 78 118 86 Q122 94 118 102 Q114 110 118 118 Q122 126 118 134 Q114 142 118 150 Q122 158 118 166 Q114 174 118 184" fill="none" stroke="' + d + '" stroke-width="2.2"/>';
    }

    if (p.print) {
      var ink = isDark(base) ? 'rgba(255,255,255,.88)' : 'rgba(0,0,0,.8)';
      s += '<text x="100" y="' + (p.shape === 'hoodie' ? 122 : 104) + '" text-anchor="middle" font-family="Pretendard, sans-serif" font-weight="800" font-size="' + (p.print.length > 3 ? 15 : 24) + '" letter-spacing="1" fill="' + ink + '">' + p.print + '</text>';
    }
    return s;
  }

  /* ---------- 바지 ---------- */
  var PANTS = {
    straight: { d: 'M62 28 L138 28 L144 218 L108 218 L100 92 L92 218 L56 218 Z', l: 62, r: 138, t: 28 },
    wide: { d: 'M60 28 L140 28 L162 218 L106 218 L100 96 L94 218 L38 218 Z', l: 60, r: 140, t: 28 },
    jogger: { d: 'M62 28 L138 28 L146 120 L136 206 L108 206 L100 92 L92 206 L64 206 L54 120 Z', l: 62, r: 138, t: 28 },
    shorts: { d: 'M60 70 L140 70 L152 168 L106 174 L100 116 L94 174 L48 168 Z', l: 60, r: 140, t: 70 }
  };

  function pants(p) {
    var g = PANTS[p.shape];
    var d = tone(p.color, 0.14);
    var deep = tone(p.color, 0.28);
    var line = p.stitch || tone(p.color, 0.22);
    var dash = p.stitch ? ' stroke-dasharray="3 2"' : '';
    var t = g.t;
    var s = '';

    s += '<path d="' + g.d + '" fill="' + p.color + '" stroke="' + OUTLINE + '" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<path d="M' + g.l + ' ' + t + ' L' + g.r + ' ' + t + ' L' + g.r + ' ' + (t + 13) + ' L' + g.l + ' ' + (t + 13) + ' Z" fill="' + d + '"/>';
    [g.l + 10, 90, 106, g.r - 14].forEach(function (x) {
      s += '<rect x="' + x + '" y="' + (t - 1) + '" width="4" height="16" fill="' + deep + '"/>';
    });
    s += '<path d="M100 ' + (t + 13) + ' L100 ' + (t + 46) + ' Q100 ' + (t + 56) + ' 91 ' + (t + 58) + '" fill="none" stroke="' + line + '" stroke-width="1.6"' + dash + '/>';
    s += '<path d="M' + (g.l + 3) + ' ' + (t + 15) + ' Q' + (g.l + 18) + ' ' + (t + 20) + ' ' + (g.l + 20) + ' ' + (t + 38) + ' M' + (g.r - 3) + ' ' + (t + 15) + ' Q' + (g.r - 18) + ' ' + (t + 20) + ' ' + (g.r - 20) + ' ' + (t + 38) + '" fill="none" stroke="' + line + '" stroke-width="1.6"' + dash + '/>';

    if (p.shape === 'jogger') {
      s += '<path d="M64 206 L92 206 L92 218 L65 218 Z M108 206 L136 206 L135 218 L108 218 Z" fill="' + d + '"/>';
      s += '<path d="M97 41 L94 60 M103 41 L106 60" stroke="' + deep + '" stroke-width="2" stroke-linecap="round"/>';
    }
    if (p.cargo) {
      s += '<path d="M54 120 L80 120 L80 152 L54 152 Z M120 120 L146 120 L146 152 L120 152 Z" fill="' + d + '" stroke="' + OUTLINE + '"/>';
      s += '<path d="M53 116 L81 116 L81 126 L53 126 Z M119 116 L147 116 L147 126 L119 126 Z" fill="' + deep + '"/>';
    }
    return s;
  }

  /* ---------- 양말 ---------- */
  function sockPath(top) {
    return 'M78 ' + top + ' L122 ' + top + ' L122 140 Q122 156 138 164 L166 178 Q184 188 176 206 Q168 222 148 216 L96 200 Q76 194 78 170 Z';
  }

  function sock(p, fill, tx, ty) {
    var top = p.shape === 'ankle' ? 118 : p.shape === 'long' ? 14 : 40;
    var cuff = p.shape === 'ankle' ? 10 : p.shape === 'long' ? 30 : 24;
    var d = tone(fill, 0.14);
    var rib = tone(fill, 0.24);
    var s = '<g transform="translate(' + tx + ' ' + ty + ')">';

    s += '<path d="' + sockPath(top) + '" fill="' + fill + '" stroke="' + OUTLINE + '" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<path d="M78 ' + top + ' L122 ' + top + ' L122 ' + (top + cuff) + ' L78 ' + (top + cuff) + ' Z" fill="' + d + '"/>';
    for (var x = 84; x < 122; x += 6) {
      s += '<path d="M' + x + ' ' + (top + 2) + ' L' + x + ' ' + (top + cuff - 2) + '" stroke="' + rib + '" stroke-width="1"/>';
    }
    if (p.stripe && p.shape !== 'ankle') {
      var y = top + cuff + 6;
      s += '<path d="M78 ' + y + ' L122 ' + y + ' L122 ' + (y + 6) + ' L78 ' + (y + 6) + ' Z M78 ' + (y + 12) + ' L122 ' + (y + 12) + ' L122 ' + (y + 18) + ' L78 ' + (y + 18) + ' Z" fill="' + p.stripe + '"/>';
    }
    s += '<path d="M78 166 Q76 196 98 201 L101 186 Q88 182 88 166 Z" fill="' + d + '"/>';
    s += '<path d="M150 170 L166 178 Q184 188 176 206 Q168 222 148 216 L142 214 Q160 196 150 170 Z" fill="' + d + '"/>';
    return s + '</g>';
  }

  function socks(p) {
    return sock(p, mix(p.color, !isDark(p.color), 0.06), 4, -8) + sock(p, p.color, -22, 4);
  }

  window.productArt = function (p) {
    var uid = p.id + '-' + (uidSeed++);
    var inner = p.cat === 'top' ? top(p, uid) : p.cat === 'pants' ? pants(p) : socks(p);
    return '<svg viewBox="0 0 200 240" aria-hidden="true" focusable="false"><g transform="translate(20 26) scale(.8)">' + inner + '</g></svg>';
  };
})();
