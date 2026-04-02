// GradeRunnerBackground.jsx
// 학교 운동장: 잔디 위에 실제 트랙(직선+반원) + 가운데 모래 필드
// 트랙 위에 등급별 텍스트가 빼곡히 채워지고, 캐릭터가 밀고 다님

import { useEffect, useRef, useCallback } from 'react';

const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 18;
const PX = 4;
const FONT = 'GmarketSans, Pretendard, sans-serif';

const GRADES = [
  { label: '1등급', words: ['1등급','몸짱','PERFECT','최고','★','뚝딱체력','BEST','짱'], color: '#FFD166' },
  { label: '2등급', words: ['2등급','건강','GREAT','좋아','굿','NICE','탄탄','GOOD'], color: '#81C784' },
  { label: '3등급', words: ['3등급','보통','NORMAL','평균','SO-SO','기본','OK','중간'], color: '#FFFFFF' },
  { label: '4등급', words: ['4등급','주의','WARNING','노력','분발','TRY','힘내','UP'], color: '#FFAB40' },
  { label: '5등급', words: ['5등급','위험','DANGER','시작','출발','START','도전','GO'], color: '#FF6F61' },
];

const COLORS = {
  grass1: '#3B9B5A',
  track: '#C85A38',
  trackDark: '#A84D30',
  sand: '#E8D5A3',
  sandDark: '#D9C48E',
  sandLight: '#F0E2BA',
  lane: 'rgba(255,255,255,0.35)',
  laneBold: 'rgba(255,255,255,0.7)',
};

const PALETTE = {
  skin: '#F5C9A0',      // 밝은 피부
  skinShade: '#E0A878',  // 피부 그림자
  skinHi: '#FDDDC0',    // 피부 하이라이트
  hair: '#8B6B4A',       // 머리카락
  hairDark: '#6B4F35',   // 머리카락 어두운
  hairLight: '#A88B6A',  // 머리카락 밝은
  eye: '#2C2C3A',        // 눈동자
  eyeWhite: '#FFFFFF',   // 흰자
  eyeBrow: '#5C4030',    // 눈썹
  mouth: '#CC5555',      // 입
  shirt: '#F0F0F0',      // 흰 민소매
  shirtShade: '#D8D8D8', // 셔츠 그림자
  shirtHi: '#FFFFFF',    // 셔츠 하이라이트
  pants: '#E8DCC8',      // 베이지 반바지
  pantsShade: '#D4C8B0', // 반바지 그림자
  shoes: '#2A2A2A',      // 검정 신발
  shoesHi: '#444444',    // 신발 하이라이트
  outline: '#3A2820',    // 외곽선
};

function getGradeAtY(y, H) {
  const ratio = y / H;
  if (ratio < 0.2) return 0;
  if (ratio < 0.4) return 1;
  if (ratio < 0.6) return 2;
  if (ratio < 0.8) return 3;
  return 4;
}

function getBlendedBodyType(y, H) {
  return Math.max(0, Math.min(4, (y / H) * 4));
}

// ── Stadium shape (straight sides + semicircle caps) ──
// cx,cy = center, halfW = half total width, halfH = half total height
// Orientation adapts: long axis = max(halfW, halfH)
function stadiumPath(ctx, cx, cy, halfW, halfH) {
  ctx.beginPath();
  if (halfW >= halfH) {
    // Horizontal: semicircles on left/right
    const r = halfH;
    const sl = halfW - r;
    ctx.moveTo(cx - sl, cy - r);
    ctx.lineTo(cx + sl, cy - r);
    ctx.arc(cx + sl, cy, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(cx - sl, cy + r);
    ctx.arc(cx - sl, cy, r, Math.PI / 2, Math.PI * 1.5);
  } else {
    // Vertical: semicircles on top/bottom
    const r = halfW;
    const sl = halfH - r;
    ctx.moveTo(cx + r, cy - sl);
    ctx.arc(cx, cy - sl, r, 0, Math.PI, true);
    ctx.lineTo(cx - r, cy + sl);
    ctx.arc(cx, cy + sl, r, Math.PI, 0, true);
  }
  ctx.closePath();
}

// Point-in-stadium test (signed distance-like)
// Returns how far from center (0 = center, 1 = on the edge of given stadium)
function stadiumDist(px, py, cx, cy, halfW, halfH) {
  if (halfW >= halfH) {
    const r = halfH;
    const sl = halfW - r;
    const dx = Math.abs(px - cx);
    const dy = Math.abs(py - cy);
    if (dx <= sl) {
      return dy / r;
    }
    const cdx = dx - sl;
    return Math.sqrt(cdx * cdx + dy * dy) / r;
  } else {
    const r = halfW;
    const sl = halfH - r;
    const dx = Math.abs(px - cx);
    const dy = Math.abs(py - cy);
    if (dy <= sl) {
      return dx / r;
    }
    const cdy = dy - sl;
    return Math.sqrt(dx * dx + cdy * cdy) / r;
  }
}

function drawPixelChar(ctx, x, y, scale, bodyType, frameIndex) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y);

  const s = PX * scale;
  const t = bodyType;
  // 5등급(t=4)은 훨씬 더 뚱뚱하게
  const belly = t <= 2 ? t * 1.0 : (t === 3 ? 4.0 : 7.0);

  const phase = (frameIndex / 6) * Math.PI * 2;
  const legSwing = Math.sin(phase) * (14 - t * 1.5);
  const armSwing = Math.sin(phase + Math.PI) * (12 - t * 0.8);
  // 뚱뚱할수록 바운스 줄어듦
  const bounce = Math.abs(Math.sin(phase)) * (3.5 - t * 0.6);

  ctx.translate(0, -bounce * s / PX);

  const P = PALETTE;

  const px = (bx, by, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(bx * s, by * s, s, s);
  };
  const rect = (bx, by, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(bx * s, by * s, w * s, h * s);
  };

  // ══════════════════════════════════════
  // ── HAIR ──
  // ══════════════════════════════════════
  const hY = -18 - (t > 2 ? 0.5 : 0);

  if (t === 0) {
    // 1등급: 멋진 스파이크 헤어 + 하이라이트
    px(-1, hY - 1, P.hairLight); px(1, hY - 1, P.hair); // 뾰족 튀어나온 앞머리
    px(-3, hY, P.hairDark); px(-2, hY, P.hair); px(-1, hY, P.hairLight); px(0, hY, P.hair); px(1, hY, P.hairLight); px(2, hY, P.hair);
    rect(-4, hY+1, 9, 1, P.hair); px(5, hY+1, P.hairLight);
    px(-4, hY+2, P.hairDark); rect(-3, hY+2, 9, 1, P.hair); px(6, hY+2, P.hairLight);
    px(-4, hY+3, P.hairDark); rect(-3, hY+3, 9, 1, P.hair); px(6, hY+3, P.hairDark);
    // 사이드번
    px(-4, hY+4, P.hairDark); px(-3, hY+4, P.hair);
    px(5, hY+4, P.hair); px(6, hY+4, P.hairDark);
    // 하이라이트 반짝
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-1 * s, (hY+1) * s, 2 * s, 0.5 * s);
  } else {
    // 일반 / 뚱뚱 헤어
    px(-2, hY, P.hairLight); px(-1, hY, P.hair); px(0, hY, P.hairLight); px(1, hY, P.hair);
    rect(-3, hY+1, 7, 1, P.hair); px(4, hY+1, P.hairLight);
    px(-4, hY+2, P.hairDark); rect(-3, hY+2, 8, 1, P.hair); px(5, hY+2, P.hairLight);
    px(-4, hY+3, P.hairDark); rect(-3, hY+3, 8, 1, P.hair); px(5, hY+3, P.hairDark);
    px(-4, hY+4, P.hairDark); px(-3, hY+4, P.hair);
    px(4, hY+4, P.hair); px(5, hY+4, P.hairDark);
  }

  // ══════════════════════════════════════
  // ── FACE ──
  // ══════════════════════════════════════
  const fY = hY + 4;
  // 뚱뚱할수록 얼굴 넓어짐
  const faceExtra = t >= 4 ? 1 : (t >= 3 ? 0.5 : 0);

  rect(-2 - faceExtra, fY, 6 + faceExtra * 2, 1, P.skinHi);
  rect(-3 - faceExtra, fY+1, 8 + faceExtra * 2, 1, P.skin);
  rect(-3 - faceExtra, fY+2, 8 + faceExtra * 2, 1, P.skin);
  rect(-3 - faceExtra, fY+3, 8 + faceExtra * 2, 1, P.skin);
  rect(-2 - faceExtra, fY+4, 6 + faceExtra * 2, 1, P.skinShade);
  rect(-1, fY+5, 4, 1, P.skinShade);

  // 5등급: 이중턱
  if (t >= 4) {
    rect(-1.5, fY+5, 5, 0.8, P.skinShade);
    rect(-1, fY+5.5, 4, 0.8, P.skin);
  }

  // 귀
  px(-4 - faceExtra, fY+2, P.skin); px(-4 - faceExtra, fY+3, P.skinShade);
  px(5 + faceExtra, fY+2, P.skin); px(5 + faceExtra, fY+3, P.skinShade);

  // ── 눈썹 ──
  if (t === 0) {
    // 1등급: 자신감 있는 각진 눈썹
    ctx.fillStyle = P.eyeBrow;
    ctx.fillRect(-2.5 * s, (fY+0.8) * s, 2.5 * s, 0.6 * s);
    ctx.fillRect(2 * s, (fY+0.8) * s, 2.5 * s, 0.6 * s);
  } else if (t >= 4) {
    // 5등급: 걱정스러운 올라간 눈썹
    ctx.save();
    ctx.translate(-1.5 * s, (fY+1) * s); ctx.rotate(-0.15);
    ctx.fillStyle = P.eyeBrow; ctx.fillRect(0, 0, 2 * s, 0.5 * s);
    ctx.restore();
    ctx.save();
    ctx.translate(2.5 * s, (fY+1) * s); ctx.rotate(0.15);
    ctx.fillStyle = P.eyeBrow; ctx.fillRect(0, 0, 2 * s, 0.5 * s);
    ctx.restore();
  } else {
    rect(-2, fY+1, 2, 0.6, P.eyeBrow);
    rect(2, fY+1, 2, 0.6, P.eyeBrow);
  }

  // ── 눈 ──
  if (t === 0) {
    // 1등급: 반짝이는 큰 눈, 윙크
    px(-2, fY+2, P.eyeWhite); px(-1, fY+2, P.eye);
    // 오른쪽 윙크 (> 모양)
    ctx.fillStyle = P.eye;
    ctx.fillRect(2 * s, (fY+2.2) * s, 1.5 * s, 0.3 * s);
    ctx.fillRect(2.3 * s, (fY+1.9) * s, 0.8 * s, 0.3 * s);
    ctx.fillRect(2.3 * s, (fY+2.5) * s, 0.8 * s, 0.3 * s);
    // 큰 하이라이트
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-1.6 * s, (fY+1.5) * s, 0.6 * s, 0.6 * s);
    ctx.fillRect(-0.8 * s, (fY+2.3) * s, 0.3 * s, 0.3 * s);
  } else if (t >= 4) {
    // 5등급: 지친 눈 (반쯤 감김)
    ctx.fillStyle = P.eyeWhite;
    ctx.fillRect(-2 * s, (fY+2.2) * s, s, 0.6 * s);
    ctx.fillRect(2.5 * s, (fY+2.2) * s, s, 0.6 * s);
    ctx.fillStyle = P.eye;
    ctx.fillRect(-1.5 * s, (fY+2.3) * s, 0.6 * s, 0.5 * s);
    ctx.fillRect(3 * s, (fY+2.3) * s, 0.6 * s, 0.5 * s);
    // 감긴 눈꺼풀
    ctx.fillStyle = P.skinShade;
    ctx.fillRect(-2.2 * s, (fY+1.8) * s, 1.5 * s, 0.5 * s);
    ctx.fillRect(2.3 * s, (fY+1.8) * s, 1.5 * s, 0.5 * s);
  } else {
    px(-2, fY+2, P.eyeWhite); px(-1, fY+2, P.eye);
    px(2, fY+2, P.eyeWhite); px(3, fY+2, P.eye);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-1.6 * s, (fY+1.7) * s, 0.4 * s, 0.4 * s);
    ctx.fillRect(2.4 * s, (fY+1.7) * s, 0.4 * s, 0.4 * s);
  }

  // ── 코 ──
  ctx.fillStyle = P.skinShade;
  ctx.fillRect(0.3 * s, (fY+3) * s, 0.6 * s, 0.5 * s);

  // ── 입 ──
  if (t === 0) {
    // 1등급: 활짝 웃는 큰 미소 + 이 드러남
    ctx.fillStyle = P.mouth;
    ctx.beginPath();
    ctx.arc(1 * s, (fY+4) * s, 1.8 * s, 0, Math.PI);
    ctx.fill();
    // 이빨
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-0.3 * s, (fY+3.9) * s, 2.6 * s, 0.6 * s);
    // 윗입술
    ctx.fillStyle = P.mouth;
    ctx.fillRect(-0.5 * s, (fY+3.8) * s, 3 * s, 0.3 * s);
  } else if (t >= 4) {
    // 5등급: 헥헥 벌어진 입
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(1 * s, (fY+4.2) * s, 1.3 * s, 0.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // 혀
    ctx.fillStyle = '#E06060';
    ctx.beginPath();
    ctx.ellipse(1 * s, (fY+4.5) * s, 0.8 * s, 0.4 * s, 0, 0, Math.PI);
    ctx.fill();
  } else if (t === 3) {
    // 4등급: 살짝 찡그린 입
    ctx.fillStyle = P.mouth;
    ctx.fillRect(-0.3 * s, (fY+4) * s, 2 * s, 0.4 * s);
  } else {
    // 기본 미소
    ctx.fillStyle = P.mouth;
    ctx.fillRect(-0.5 * s, (fY+3.8) * s, 2.5 * s, 0.5 * s);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0 * s, (fY+3.8) * s, 1.5 * s, 0.3 * s);
  }

  // ── 볼터치 ──
  if (t === 0) {
    // 건강한 핑크빛
    ctx.fillStyle = 'rgba(255,150,150,0.35)';
    ctx.fillRect(-3 * s, (fY+3) * s, 1.5 * s, 1 * s);
    ctx.fillRect(3 * s, (fY+3) * s, 1.5 * s, 1 * s);
  } else if (t >= 4) {
    // 붉은 홍조 (더위)
    ctx.fillStyle = 'rgba(255,80,80,0.4)';
    ctx.fillRect((-3 - faceExtra) * s, (fY+3) * s, 2 * s, 1 * s);
    ctx.fillRect((3 + faceExtra - 0.5) * s, (fY+3) * s, 2 * s, 1 * s);
  } else {
    ctx.fillStyle = 'rgba(255,130,130,0.3)';
    ctx.fillRect(-3 * s, (fY+3) * s, 1.5 * s, 0.8 * s);
    ctx.fillRect(3 * s, (fY+3) * s, 1.5 * s, 0.8 * s);
  }

  // 얼굴 외곽선
  ctx.fillStyle = P.outline + '40';
  for (let i = 1; i <= 3; i++) ctx.fillRect((-3.2 - faceExtra) * s, (fY+i) * s, 0.2 * s, s);
  for (let i = 1; i <= 3; i++) ctx.fillRect((5 + faceExtra) * s, (fY+i) * s, 0.2 * s, s);
  ctx.fillRect(-1 * s, (fY+5) * s, 4 * s, 0.2 * s);

  // ══════════════════════════════════════
  // ── NECK ──
  // ══════════════════════════════════════
  const neckW = t >= 4 ? 3.5 : (t >= 3 ? 2.5 : 2);
  rect(-neckW/2 + 1, fY+5.5, neckW, 1.5, P.skin);
  rect(-neckW/2 + 1, fY+6, neckW, 0.5, P.skinShade);

  // ══════════════════════════════════════
  // ── BODY / SHIRT ──
  // ══════════════════════════════════════
  const bTop = fY + 7;
  const bW = 5 + belly;
  const bH = 5.5 + t * 1.0;
  const bX = -bW / 2 + 1;

  if (t === 0) {
    // ★ 1등급: 쿨한 스포츠 재킷 (파란색 + 흰 줄)
    const jacketColor = '#2266CC';
    const jacketDark = '#1A4FA0';
    const jacketLight = '#3388EE';
    const stripe = '#FFFFFF';

    rect(bX, bTop, bW, bH, jacketColor);
    // 오른쪽 그림자
    rect(bX + bW * 0.7, bTop, bW * 0.3, bH, jacketDark);
    // 왼쪽 하이라이트
    rect(bX + 0.3, bTop + 0.3, 1, bH - 0.6, jacketLight);
    // 지퍼 중앙선
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect((bX + bW/2 - 0.15) * s, bTop * s, 0.3 * s, bH * s);
    // 어깨 흰 줄
    rect(bX, bTop, bW, 0.6, stripe);
    rect(bX, bTop + bH - 0.6, bW, 0.6, stripe);
    // 옷깃 / V넥
    ctx.fillStyle = stripe;
    ctx.fillRect((bX + bW/2 - 1) * s, bTop * s, 2 * s, 1.5 * s);
    // 안쪽 셔츠
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect((bX + bW/2 - 0.6) * s, (bTop + 0.3) * s, 1.2 * s, 1.2 * s);
    // 가슴 근육 라인
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect((bX + bW*0.3) * s, (bTop + 1.5) * s, 0.3 * s, (bH - 3) * s);
    ctx.fillRect((bX + bW*0.65) * s, (bTop + 1.5) * s, 0.3 * s, (bH - 3) * s);
    // 외곽선
    ctx.strokeStyle = '#1A3A70';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(bX * s, bTop * s, bW * s, bH * s);
  } else if (t >= 4) {
    // ★ 5등급: 배가 튀어나온 늘어난 회색 티셔츠
    const fatShirt = '#CCCCCC';
    const fatShirtDark = '#AAAAAA';

    rect(bX, bTop, bW, bH, fatShirt);
    rect(bX + bW * 0.6, bTop, bW * 0.4, bH, fatShirtDark);
    // 배 튀어나옴 (둥글게)
    ctx.fillStyle = fatShirt;
    ctx.beginPath();
    ctx.ellipse((bX + bW/2) * s, (bTop + bH * 0.65) * s, (bW * 0.55) * s, (bH * 0.45) * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // 배 하이라이트
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse((bX + bW/2 - 0.5) * s, (bTop + bH * 0.55) * s, (bW * 0.3) * s, (bH * 0.25) * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // 배꼽 비침
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect((bX + bW/2 - 0.2) * s, (bTop + bH * 0.7) * s, 0.4 * s, 0.4 * s);
    // 옷 밑단이 올라감
    ctx.fillStyle = P.skin;
    ctx.fillRect((bX + 1) * s, (bTop + bH - 0.8) * s, (bW - 2) * s, 0.8 * s);
    // 외곽선
    ctx.strokeStyle = P.outline + '25';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(bX * s, bTop * s, bW * s, bH * s);
  } else if (t >= 3) {
    // 4등급: 약간 빡빡한 티셔츠
    rect(bX, bTop, bW, bH, '#DDDDDD');
    rect(bX + bW * 0.65, bTop, bW * 0.35, bH, '#C5C5C5');
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.ellipse((bX + bW/2) * s, (bTop + bH * 0.6) * s, (bW * 0.4) * s, (bH * 0.35) * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = P.outline + '25';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(bX * s, bTop * s, bW * s, bH * s);
  } else {
    // 2~3등급: 기본 민소매
    rect(bX, bTop, bW, bH, P.shirt);
    rect(bX + bW * 0.65, bTop, bW * 0.35, bH, P.shirtShade);
    rect(bX + 0.5, bTop + 0.5, 1.5, bH - 1, P.shirtHi);
    ctx.fillStyle = P.shirtShade;
    ctx.fillRect((bX + 1) * s, bTop * s, (bW - 2) * s, 0.3 * s);
    rect(bX, bTop, 1.5, 1, P.shirt);
    rect(bX + bW - 1.5, bTop, 1.5, 1, P.shirt);
    ctx.strokeStyle = P.outline + '30';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(bX * s, bTop * s, bW * s, bH * s);
  }

  // ══════════════════════════════════════
  // ── ARMS ──
  // ══════════════════════════════════════
  const armY = bTop + 0.8;
  const armLen = t === 0 ? 5.5 : (5 - t * 0.15);
  const armThick = t >= 4 ? 2.2 : (t >= 3 ? 1.8 : (t === 0 ? 1.4 : 1.2));

  // Left arm
  ctx.save();
  ctx.translate((bX - 0.3) * s, armY * s);
  ctx.rotate(armSwing * Math.PI / 180 * 3);
  if (t === 0) {
    // 재킷 소매
    ctx.fillStyle = '#2266CC';
    ctx.fillRect(-armThick * s, 0, armThick * s, armLen * 0.35 * s);
    ctx.fillStyle = '#1A4FA0';
    ctx.fillRect(-armThick * s, 0, 0.3 * s, armLen * 0.35 * s);
  }
  ctx.fillStyle = P.skin;
  ctx.fillRect(-armThick * s, (t === 0 ? armLen * 0.33 : 0) * s, armThick * s, armLen * (t === 0 ? 0.37 : 0.5) * s);
  ctx.fillStyle = P.skinShade;
  ctx.fillRect(-armThick * s, armLen * 0.5 * s, armThick * s, armLen * 0.4 * s);
  ctx.fillStyle = P.skin;
  ctx.fillRect((-armThick + 0.1) * s, armLen * 0.88 * s, (armThick - 0.2) * s, 1.1 * s);
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate((bX + bW + 0.3) * s, armY * s);
  ctx.rotate(-armSwing * Math.PI / 180 * 3);
  if (t === 0) {
    ctx.fillStyle = '#2266CC';
    ctx.fillRect(0, 0, armThick * s, armLen * 0.35 * s);
    ctx.fillStyle = '#3388EE';
    ctx.fillRect((armThick - 0.3) * s, 0, 0.3 * s, armLen * 0.35 * s);
  }
  ctx.fillStyle = P.skin;
  ctx.fillRect(0, (t === 0 ? armLen * 0.33 : 0) * s, armThick * s, armLen * (t === 0 ? 0.37 : 0.5) * s);
  ctx.fillStyle = P.skinShade;
  ctx.fillRect(0, armLen * 0.5 * s, armThick * s, armLen * 0.4 * s);
  ctx.fillStyle = P.skin;
  ctx.fillRect(0.1 * s, armLen * 0.88 * s, (armThick - 0.2) * s, 1.1 * s);
  ctx.restore();

  // ══════════════════════════════════════
  // ── PANTS ──
  // ══════════════════════════════════════
  const pTop = bTop + bH;
  const pW = bW + (t >= 4 ? 0.5 : 0);
  const pX = -pW / 2 + 1;
  const pH = t >= 4 ? 2.5 : (3 + t * 0.3);

  if (t === 0) {
    // 1등급: 네이비 스포츠 팬츠
    rect(pX, pTop, pW, pH, '#1A2A4A');
    rect(pX + pW * 0.6, pTop, pW * 0.4, pH, '#142240');
    // 사이드 흰줄
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(pX * s, pTop * s, 0.4 * s, pH * s);
    ctx.fillRect((pX + pW - 0.4) * s, pTop * s, 0.4 * s, pH * s);
  } else if (t >= 4) {
    // 5등급: 짧은 반바지 (배에 밀려 올라감)
    rect(pX, pTop, pW, pH, '#B8A888');
    rect(pX + pW * 0.6, pTop, pW * 0.4, pH, '#A89878');
  } else {
    rect(pX, pTop, pW, pH, P.pants);
    rect(pX + pW * 0.6, pTop, pW * 0.4, pH, P.pantsShade);
  }
  // Belt
  ctx.fillStyle = t === 0 ? '#0D1B33' : P.pantsShade;
  ctx.fillRect(pX * s, pTop * s, pW * s, 0.5 * s);
  // Seam
  ctx.fillStyle = t === 0 ? '#0D1B33' : P.pantsShade;
  ctx.fillRect((pX + pW/2 - 0.1) * s, (pTop + 0.5) * s, 0.2 * s, (pH - 0.5) * s);

  // ══════════════════════════════════════
  // ── LEGS ──
  // ══════════════════════════════════════
  const legTop = pTop + pH - 0.3;
  const legLen = t >= 4 ? 4.5 : (5.5 - t * 0.2);
  const legThick = t >= 4 ? 2.3 : (t >= 3 ? 1.8 : (1.3 + t * 0.2));
  const legSpread = t >= 4 ? 1.5 : (t * 0.25);

  [[-1.2 - legSpread, legSwing], [1.2 + legSpread, -legSwing]].forEach(([offX, swing], idx) => {
    ctx.save();
    ctx.translate((offX + 1) * s, legTop * s);
    ctx.rotate(swing * Math.PI / 180 * (t >= 4 ? 1.2 : 2));

    // Upper leg
    ctx.fillStyle = idx === 1 ? (t === 0 ? '#142240' : P.pantsShade) : (t === 0 ? '#1A2A4A' : P.pants);
    ctx.fillRect(-legThick / 2 * s, 0, legThick * s, legLen * 0.3 * s);

    // Lower leg (skin)
    ctx.fillStyle = P.skin;
    ctx.fillRect(-legThick / 2 * s, legLen * 0.28 * s, legThick * s, legLen * 0.55 * s);
    ctx.fillStyle = P.skinShade;
    ctx.fillRect((legThick * 0.1) * s, legLen * 0.3 * s, (legThick * 0.3) * s, legLen * 0.5 * s);

    // Shoes
    const shoeY = legLen * 0.8;
    const shoeW = legThick + 0.8;
    if (t === 0) {
      // 1등급: 멋진 운동화 (파란+흰)
      ctx.fillStyle = '#2255BB';
      ctx.fillRect((-shoeW / 2) * s, shoeY * s, shoeW * s, 1.5 * s);
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect((-shoeW / 2) * s, (shoeY + 1.3) * s, shoeW * s, 0.4 * s);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((-shoeW / 2 + 0.2) * s, (shoeY + 0.3) * s, (shoeW * 0.5) * s, 0.5 * s);
      // 나이키풍 체크
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((-shoeW / 2 + 0.3) * s, (shoeY + 0.8) * s, (shoeW * 0.35) * s, 0.25 * s);
    } else {
      ctx.fillStyle = P.shoes;
      ctx.fillRect((-shoeW / 2) * s, shoeY * s, shoeW * s, 1.5 * s);
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect((-shoeW / 2) * s, (shoeY + 1.3) * s, shoeW * s, 0.4 * s);
      ctx.fillStyle = P.shoesHi;
      ctx.fillRect((-shoeW / 2 + 0.2) * s, (shoeY + 0.2) * s, (shoeW * 0.4) * s, 0.4 * s);
    }

    ctx.restore();
  });

  // ══════════════════════════════════════
  // ── EFFECTS ──
  // ══════════════════════════════════════

  // ★ 5등급 (t>=4): 땀 폭포
  if (t >= 3) {
    const st = Date.now() / 250;
    ctx.fillStyle = 'rgba(100,180,255,0.7)';

    if (t >= 4) {
      // 양쪽 얼굴에서 땀 5~6방울
      for (let i = 0; i < 6; i++) {
        const phase2 = st + i * 1.2;
        const dY = (Math.abs(Math.sin(phase2)) * 5);
        const side = i % 2 === 0 ? 1 : -1;
        const offX = (5 + faceExtra + (i % 3) * 0.8) * side;
        const offY = fY + 1 + i * 0.7;
        ctx.globalAlpha = 0.5 + Math.sin(phase2) * 0.3;
        ctx.beginPath();
        ctx.moveTo(offX * s, (offY + dY) * s);
        ctx.quadraticCurveTo((offX + 0.5 * side) * s, (offY + 1.2 + dY) * s, offX * s, (offY + 2 + dY) * s);
        ctx.quadraticCurveTo((offX - 0.5 * side) * s, (offY + 1.2 + dY) * s, offX * s, (offY + dY) * s);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 머리 위 증기
      const steamAlpha = 0.15 + Math.sin(st * 0.5) * 0.1;
      ctx.fillStyle = `rgba(200,220,255,${steamAlpha})`;
      for (let i = 0; i < 3; i++) {
        const sx2 = (-2 + i * 2.5 + Math.sin(st + i) * 0.5);
        const sy2 = hY - 2 - Math.sin(st * 0.7 + i) * 1.5;
        ctx.beginPath();
        ctx.arc(sx2 * s, sy2 * s, (0.8 + i * 0.2) * s, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // t=3: 땀 2방울
      const dropY = Math.abs(Math.sin(st)) * 3;
      ctx.beginPath();
      ctx.moveTo(5.5 * s, (fY + 1 + dropY) * s);
      ctx.quadraticCurveTo(6 * s, (fY + 2 + dropY) * s, 5.5 * s, (fY + 3 + dropY) * s);
      ctx.quadraticCurveTo(5 * s, (fY + 2 + dropY) * s, 5.5 * s, (fY + 1 + dropY) * s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-4 * s, (fY + 2 + dropY * 0.7) * s);
      ctx.quadraticCurveTo(-3.5 * s, (fY + 3 + dropY * 0.7) * s, -4 * s, (fY + 4 + dropY * 0.7) * s);
      ctx.quadraticCurveTo(-4.5 * s, (fY + 3 + dropY * 0.7) * s, -4 * s, (fY + 2 + dropY * 0.7) * s);
      ctx.fill();
    }
  }

  // ★ 1등급: 화려한 이펙트
  if (t === 0) {
    const st = Date.now() / 350;

    // 아우라 글로우
    ctx.save();
    const auraAlpha = 0.08 + Math.sin(st) * 0.04;
    ctx.fillStyle = `rgba(34,102,204,${auraAlpha})`;
    ctx.beginPath();
    ctx.ellipse(1 * s, (bTop + bH / 2) * s, (bW * 0.9) * s, (bH * 0.8) * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 반짝이 3개 (시계방향 회전)
    for (let i = 0; i < 3; i++) {
      const angle = st * 1.2 + (i * Math.PI * 2 / 3);
      const dist2 = (bW * 0.8 + 2);
      const spX = (1 + Math.cos(angle) * dist2) * s;
      const spY = (bTop + bH / 2 + Math.sin(angle) * (bH * 0.6)) * s;
      const alpha = 0.5 + Math.sin(st * 2 + i) * 0.4;
      const sz = (0.4 + Math.sin(st + i) * 0.15) * s;

      ctx.fillStyle = `rgba(255,255,180,${alpha})`;
      ctx.fillRect(spX - sz * 1.5, spY - sz * 0.3, sz * 3, sz * 0.6);
      ctx.fillRect(spX - sz * 0.3, spY - sz * 1.5, sz * 0.6, sz * 3);
      // 대각선
      ctx.save();
      ctx.translate(spX, spY);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-sz, -sz * 0.2, sz * 2, sz * 0.4);
      ctx.fillRect(-sz * 0.2, -sz, sz * 0.4, sz * 2);
      ctx.restore();
    }

    // 엄지척 표시 (오른쪽 손 위)
    const thumbAlpha = 0.6 + Math.sin(st * 1.5) * 0.3;
    ctx.font = `${2.5 * s}px sans-serif`;
    ctx.globalAlpha = thumbAlpha;
    ctx.fillText('👍', (bX + bW + 3) * s, (bTop - 2) * s);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ───────────────────────────────────────
export default function GradeRunnerBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    W: 0, H: 0,
    cx: 0, cy: 0,
    // Stadium dimensions (half-sizes of the OUTER edge)
    halfW: 0, halfH: 0,
    laneWidth: 0,
    // Inner field half-sizes
    fieldHW: 0, fieldHH: 0,
    textParticles: [],
    // Runner on oval track
    trackCx: 0, trackCy: 0, trackRx: 0, trackRy: 0,
    runnerX: 0, runnerY: 0,
    targetX: 0, targetY: 0,
    targetAngle: 0,
    mouseDown: false,
    dragging: false,
    dragStartX: 0,
    dragStartAngle: 0,
    frameIndex: 0, frameTick: 0,
    rafId: null,
  });

  // Dense text grid – wider spacing to avoid overlap
  const initTextParticles = useCallback((W, H) => {
    const particles = [];
    const zoneH = H / 5;
    const fontSize = 12;
    const lineHeight = fontSize + 9;   // more vertical space
    const baseWordGap = 12;            // horizontal gap between words

    for (let gi = 0; gi < 5; gi++) {
      const grade = GRADES[gi];
      const yStart = gi * zoneH + 10;
      const yEnd = (gi + 1) * zoneH - 6;

      let row = 0;
      for (let y = yStart; y < yEnd; y += lineHeight) {
        let col = 0;
        // Offset every other row for a staggered/book-like feel
        const rowOffset = (row % 2) * 14;
        for (let x = rowOffset; x < W;) {
          const word = grade.words[(row * 37 + col * 13) % grade.words.length];
          // Estimate pixel width: Korean chars ~fontSize, Latin ~fontSize*0.6
          const isKorean = word.charCodeAt(0) > 0x1100;
          const estWidth = word.length * fontSize * (isKorean ? 0.85 : 0.6);
          const cellWidth = estWidth + baseWordGap;
          const px = x + estWidth / 2;
          const py = y + fontSize / 2;

          particles.push({
            word,
            homeX: px,
            homeY: py,
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            gradeIndex: gi,
            fontSize,
          });

          x += cellWidth;
          col++;
        }
        row++;
      }
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const S = stateRef.current;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      S.W = window.innerWidth;
      S.H = window.innerHeight;
      canvas.width = S.W * dpr;
      canvas.height = S.H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      S.cx = S.W / 2;
      S.cy = S.H / 2;

      // Track fills ~90% of screen, 6 lanes wide
      const lanes = 6;
      S.laneWidth = Math.min(S.W, S.H) * 0.035;
      const trackTotalWidth = lanes * S.laneWidth;

      S.halfW = S.W * 0.46;
      S.halfH = S.H * 0.43;
      S.fieldHW = S.halfW - trackTotalWidth;
      S.fieldHH = S.halfH - trackTotalWidth;

      // Center oval for runner path (middle of track)
      S.trackCx = S.cx;
      S.trackCy = S.cy;
      S.trackRx = (S.fieldHW + S.halfW) * 0.5;
      S.trackRy = (S.fieldHH + S.halfH) * 0.5;

      S.textParticles = initTextParticles(S.W, S.H);
      S.targetAngle = 0;
      S.runnerX = S.trackCx + Math.cos(S.targetAngle) * S.trackRx;
      S.runnerY = S.trackCy + Math.sin(S.targetAngle) * S.trackRy;
      S.targetX = S.runnerX;
      S.targetY = S.runnerY;
    }

    // ── Draw the field ──
    function drawField() {
      const { W, H, cx, cy, halfW, halfH, fieldHW, fieldHH, laneWidth } = S;

      // 1. Grass background
      ctx.fillStyle = COLORS.grass1;
      ctx.fillRect(0, 0, W, H);
      // Mowing stripes
      for (let y = 0; y < H; y += 20) {
        ctx.fillStyle = y % 40 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)';
        ctx.fillRect(0, y, W, 20);
      }

      // 2. Outer track surface (outermost stadium shape)
      stadiumPath(ctx, cx, cy, halfW, halfH);
      ctx.fillStyle = COLORS.track;
      ctx.fill();
      // Subtle shading on track
      const tGrad = ctx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, Math.max(halfW, halfH));
      tGrad.addColorStop(0, 'rgba(255,255,255,0.04)');
      tGrad.addColorStop(1, 'rgba(0,0,0,0.08)');
      stadiumPath(ctx, cx, cy, halfW, halfH);
      ctx.fillStyle = tGrad;
      ctx.fill();

      // 3. Lane lines (6 lanes → 7 lines from inner to outer)
      const lanes = 6;
      for (let i = 0; i <= lanes; i++) {
        const t = i / lanes;
        const lhw = fieldHW + (halfW - fieldHW) * t;
        const lhh = fieldHH + (halfH - fieldHH) * t;
        stadiumPath(ctx, cx, cy, lhw, lhh);
        ctx.strokeStyle = (i === 0 || i === lanes) ? COLORS.laneBold : COLORS.lane;
        ctx.lineWidth = (i === 0 || i === lanes) ? 2.5 : 1.2;
        ctx.stroke();
      }

      // Lane numbers (inside each lane, at the bottom-right straight section)
      ctx.save();
      ctx.font = `700 ${Math.max(9, laneWidth * 0.55)}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < lanes; i++) {
        const t = (i + 0.5) / lanes;
        const lhw = fieldHW + (halfW - fieldHW) * t;
        const lhh = fieldHH + (halfH - fieldHH) * t;
        // Place number at the bottom of the straight section
        const numX = halfW >= halfH ? cx + lhw * 0.15 : cx + lhw;
        const numY = halfW >= halfH ? cy + lhh : cy + lhh * 0.15;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(String(i + 1), numX, numY - laneWidth * 0.3);
      }
      ctx.restore();

      // Start/finish line
      if (halfW >= halfH) {
        // Horizontal track → vertical start line on right straight
        const sx = cx + fieldHW * 0.3;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(sx - 2, cy - halfH, 4, halfH * 2);
      } else {
        // Vertical track → horizontal start line at bottom straight
        const sy = cy + fieldHH * 0.3;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(cx - halfW, sy - 2, halfW * 2, 4);
      }

      // 4. Inner field (sand/dirt)
      stadiumPath(ctx, cx, cy, fieldHW, fieldHH);
      ctx.fillStyle = COLORS.sand;
      ctx.fill();
      // Sand gradient
      const sGrad = ctx.createRadialGradient(cx, cy * 0.92, 0, cx, cy, Math.max(fieldHW, fieldHH));
      sGrad.addColorStop(0, COLORS.sandLight + '50');
      sGrad.addColorStop(0.8, 'rgba(0,0,0,0)');
      sGrad.addColorStop(1, COLORS.sandDark + '30');
      stadiumPath(ctx, cx, cy, fieldHW, fieldHH);
      ctx.fillStyle = sGrad;
      ctx.fill();

      // 5. Grade zone labels (left edge)
      const zoneH = H / 5;
      for (let i = 0; i < 5; i++) {
        const g = GRADES[i];
        const yCenter = i * zoneH + zoneH / 2;
        ctx.save();
        ctx.font = `700 11px ${FONT}`;
        const tw = ctx.measureText(g.label).width + 14;
        ctx.fillStyle = g.color + '45';
        ctx.beginPath();
        ctx.roundRect(8, yCenter - 11, tw, 22, 6);
        ctx.fill();
        ctx.fillStyle = g.color;
        ctx.globalAlpha = 0.85;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(g.label, 15, yCenter);
        ctx.restore();
      }

      // Horizontal zone dividers (very subtle)
      for (let i = 1; i < 5; i++) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.beginPath();
        ctx.moveTo(0, i * zoneH);
        ctx.lineTo(W, i * zoneH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // ── Draw text particles ──
    function drawTextParticles() {
      const { cx, cy, halfW, halfH, fieldHW, fieldHH } = S;

      for (const p of S.textParticles) {
        // Repel from runner
        const dx = p.x - S.runnerX;
        const dy = p.y - S.runnerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.vx += (p.homeX - p.x) * 0.04;
        p.vy += (p.homeY - p.y) * 0.04;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;

        // Zone detection via stadium distance
        const dOuter = stadiumDist(p.x, p.y, cx, cy, halfW, halfH);
        const dField = stadiumDist(p.x, p.y, cx, cy, fieldHW, fieldHH);

        let baseAlpha = 0.18;
        if (dField <= 1) {
          // Sand field 조금 낮게
          baseAlpha = 0.12;
        } else if (dOuter <= 1) {
          // Track 부분 좀 더 또렷하게
          baseAlpha = 0.22;
        }

        const GRADIENT_COLORS = ['#FFD166', '#81C784', '#FFFFFF', '#FFAB40', '#FF6F61'];
        const color = GRADIENT_COLORS[p.gradeIndex] || '#FFFFFF';

        // Fade near runner
        const distR = Math.hypot(p.x - S.runnerX, p.y - S.runnerY);
        const fadeDist = REPEL_RADIUS * 1.5;
        const alpha = distR < fadeDist
          ? Math.max(0.04, (distR / fadeDist) * baseAlpha)
          : baseAlpha;

        ctx.save();
        ctx.font = `700 ${p.fontSize}px ${FONT}`;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText(p.word, p.x, p.y);
        ctx.restore();
      }
    }

    function drawGradeBadge() {
      const gi = getGradeAtY(S.runnerY, S.H);
      const g = GRADES[gi];
      const bx = S.runnerX;
      const by = S.runnerY - 105;

      ctx.save();
      ctx.font = `700 14px ${FONT}`;
      const pw = ctx.measureText(g.label).width + 24;
      const ph = 30;
      const r = 10;

      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = g.color + 'DD';
      ctx.beginPath();
      ctx.roundRect(bx - pw / 2, by - ph / 2, pw, ph, r);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Arrow
      ctx.fillStyle = g.color + 'DD';
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + ph / 2 - 1);
      ctx.lineTo(bx, by + ph / 2 + 7);
      ctx.lineTo(bx + 6, by + ph / 2 - 1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.label, bx, by);
      ctx.restore();
    }

    function drawRunner() {
      const { runnerX: x, runnerY: y, H: h } = S;
      const gi = getGradeAtY(y, h);
      const g = GRADES[gi];

      // Glow
      const grd = ctx.createRadialGradient(x, y, 5, x, y, 80);
      grd.addColorStop(0, g.color + '30');
      grd.addColorStop(0.6, g.color + '10');
      grd.addColorStop(1, g.color + '00');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 80, 0, Math.PI * 2);
      ctx.fill();

      // Ground shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(x + 3, y + 8, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Speed lines
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      const tt = Date.now() / 100;
      const bt = getBlendedBodyType(y, h);
      const lc = Math.max(1, Math.floor(5 - bt));
      for (let i = 0; i < lc; i++) {
        const ly = y - 15 + i * 12 + Math.sin(tt + i) * 3;
        const lx = x - 35 - i * 6 - Math.abs(Math.sin(tt * 0.7 + i)) * 12;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 10 - Math.random() * 8, ly);
        ctx.stroke();
      }
      ctx.restore();

      drawPixelChar(ctx, x, y, 1.6, Math.round(bt), S.frameIndex);
    }

    // ── Animation loop ──
    function animate() {
      ctx.clearRect(0, 0, S.W, S.H);
      drawField();

      S.frameTick++;
      if (S.frameTick >= 6) { S.frameTick = 0; S.frameIndex = (S.frameIndex + 1) % 6; }

      // Idle orbit when not dragging
      if (!S.dragging) {
        S.targetAngle += 0.0028;
      }

      S.targetX = S.trackCx + Math.cos(S.targetAngle) * S.trackRx;
      S.targetY = S.trackCy + Math.sin(S.targetAngle) * S.trackRy;

      S.runnerX += (S.targetX - S.runnerX) * 0.16;
      S.runnerY += (S.targetY - S.runnerY) * 0.16;
      S.runnerX = Math.max(60, Math.min(S.W - 60, S.runnerX));
      S.runnerY = Math.max(50, Math.min(S.H - 50, S.runnerY));

      drawTextParticles();
      drawRunner();
      drawGradeBadge();

      S.rafId = requestAnimationFrame(animate);
    }

    // ── Pointer events ──
    function onDown(e) {
      S.mouseDown = true;
      S.dragging = true;
      const dx = e.clientX - S.trackCx;
      const dy = e.clientY - S.trackCy;
      S.targetAngle = Math.atan2(dy, dx);
      S.dragStartX = e.clientX;
      S.dragStartAngle = S.targetAngle;
      canvas.classList.add('grabbing');
      canvas.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!S.dragging) return;
      const deltaX = e.clientX - S.dragStartX;
      S.targetAngle = S.dragStartAngle + deltaX * 0.005;
    }
    function onUp() {
      S.mouseDown = false;
      S.dragging = false;
      canvas.classList.remove('grabbing');
    }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', resize);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(S.rafId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      window.removeEventListener('resize', resize);
    };
  }, [initTextParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}
