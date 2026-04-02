// GradeRunnerBackground.jsx
// 사용법: 로그인 페이지에서 배경으로 깔기
//
// import GradeRunnerBackground from './GradeRunnerBackground';
//
// function LoginPage() {
//   return (
//     <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
//       <GradeRunnerBackground />
//       {/* 기존 로그인 UI를 위에 올리기 */}
//       <div style={{ position: 'relative', zIndex: 10 }}>
//         ... 기존 로그인 폼 ...
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useCallback } from 'react';

const REPEL_RADIUS = 110;
const REPEL_STRENGTH = 15;
const PX = 4;

const WORDS = [
  '뚝딱','스포츠','SPORTS','달려!','GO!',
  '뚝딱스포츠','RUN','화이팅!','점프!','GOAL!','1등급!','몸짱!'
];
const COLORS = [
  '#AFA9EC','#5DCAA5','#F0997B','#85B7EB','#ED93B1',
  '#97C459','#FAC775','#7F77DD','#1D9E75','#D85A30'
];
const GRADES = [
  { label: '1등급', sub: '몸짱', color: '#5DCAA5' },
  { label: '2등급', sub: '건강', color: '#85B7EB' },
  { label: '3등급', sub: '보통', color: '#FAC775' },
  { label: '4등급', sub: '주의', color: '#F0997B' },
  { label: '5등급', sub: '위험', color: '#ED93B1' },
];
const PALETTE = {
  skin: '#F5C9A0',
  skinShade: '#E0A878',
  skinHi: '#FDDDC0',
  hair: '#8B6B4A',
  hairDark: '#6B4F35',
  hairLight: '#A88B6A',
  eye: '#2C2C3A',
  eyeWhite: '#FFFFFF',
  eyeBrow: '#5C4030',
  mouth: '#CC5555',
  shirt: '#F0F0F0',
  shirtShade: '#D8D8D8',
  shirtHi: '#FFFFFF',
  pants: '#E8DCC8',
  pantsShade: '#D4C8B0',
  shoes: '#2A2A2A',
  shoesHi: '#444444',
  outline: '#3A2820',
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

function drawPixelChar(ctx, x, y, scale, bodyType, frameIndex) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y);

  const s = PX * scale;
  const t = bodyType;
  const belly = t * 1.2;

  const phase = (frameIndex / 6) * Math.PI * 2;
  const legSwing = Math.sin(phase) * (14 - t);
  const armSwing = Math.sin(phase + Math.PI) * (12 - t * 0.5);
  const bounce = Math.abs(Math.sin(phase)) * (3 - t * 0.3);

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

  // ── Hair (top, fluffy short style) ──
  const hY = -18 - (t > 2 ? 0.5 : 0);
  px(-2, hY, P.hairLight); px(-1, hY, P.hair); px(0, hY, P.hairLight); px(1, hY, P.hair);
  rect(-3, hY+1, 7, 1, P.hair);
  px(4, hY+1, P.hairLight);
  px(-4, hY+2, P.hairDark);
  rect(-3, hY+2, 8, 1, P.hair);
  px(5, hY+2, P.hairLight);
  px(-4, hY+3, P.hairDark);
  rect(-3, hY+3, 8, 1, P.hair);
  px(5, hY+3, P.hairDark);
  px(-4, hY+4, P.hairDark); px(-3, hY+4, P.hair);
  px(4, hY+4, P.hair); px(5, hY+4, P.hairDark);

  // ── Face ──
  const fY = hY + 4;
  rect(-2, fY, 6, 1, P.skinHi);
  rect(-3, fY+1, 8, 1, P.skin);
  rect(-3, fY+2, 8, 1, P.skin);
  rect(-3, fY+3, 8, 1, P.skin);
  rect(-2, fY+4, 6, 1, P.skinShade);
  rect(-1, fY+5, 4, 1, P.skinShade);

  px(-4, fY+2, P.skin); px(-4, fY+3, P.skinShade);
  px(5, fY+2, P.skin); px(5, fY+3, P.skinShade);

  rect(-2, fY+1, 2, 0.6, P.eyeBrow);
  rect(2, fY+1, 2, 0.6, P.eyeBrow);

  px(-2, fY+2, P.eyeWhite); px(-1, fY+2, P.eye);
  px(2, fY+2, P.eyeWhite); px(3, fY+2, P.eye);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-1.6 * s, (fY+1.7) * s, 0.4 * s, 0.4 * s);
  ctx.fillRect(2.4 * s, (fY+1.7) * s, 0.4 * s, 0.4 * s);

  ctx.fillStyle = P.skinShade;
  ctx.fillRect(0.3 * s, (fY+3) * s, 0.6 * s, 0.5 * s);

  ctx.fillStyle = P.mouth;
  ctx.fillRect(-0.5 * s, (fY+3.8) * s, 2.5 * s, 0.5 * s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0 * s, (fY+3.8) * s, 1.5 * s, 0.3 * s);

  ctx.fillStyle = 'rgba(255,130,130,0.3)';
  ctx.fillRect(-3 * s, (fY+3) * s, 1.5 * s, 0.8 * s);
  ctx.fillRect(3 * s, (fY+3) * s, 1.5 * s, 0.8 * s);

  ctx.fillStyle = P.outline + '40';
  for (let i = 1; i <= 3; i++) ctx.fillRect(-3.2 * s, (fY+i) * s, 0.2 * s, s);
  for (let i = 1; i <= 3; i++) ctx.fillRect(5 * s, (fY+i) * s, 0.2 * s, s);
  ctx.fillRect(-1 * s, (fY+5) * s, 4 * s, 0.2 * s);

  // ── Neck ──
  rect(0, fY+5.5, 2, 1.5, P.skin);
  px(0, fY+6, P.skinShade);

  // ── Body / Shirt ──
  const bTop = fY + 7;
  const bW = 5 + belly;
  const bH = 5.5 + t * 0.8;
  const bX = -bW / 2 + 1;

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

  if (t === 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect((bX + bW/2 - 0.15) * s, (bTop + 1) * s, 0.3 * s, (bH - 2) * s);
  }
  if (t >= 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.ellipse((bX + bW/2) * s, (bTop + bH * 0.6) * s, (bW * 0.35) * s, (bH * 0.35) * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Arms ──
  const armY = bTop + 0.8;
  const armLen = 5 + (t === 0 ? 0.5 : 0);
  const armThick = 1.2 + t * 0.3;

  ctx.save();
  ctx.translate((bX - 0.3) * s, armY * s);
  ctx.rotate(armSwing * Math.PI / 180 * 3);
  ctx.fillStyle = P.skin;
  ctx.fillRect(-armThick * s, 0, armThick * s, armLen * 0.5 * s);
  ctx.fillStyle = P.skinShade;
  ctx.fillRect(-armThick * s, armLen * 0.5 * s, armThick * s, armLen * 0.5 * s);
  ctx.fillStyle = P.skin;
  ctx.fillRect((-armThick + 0.1) * s, armLen * 0.9 * s, (armThick - 0.2) * s, 1 * s);
  ctx.strokeStyle = P.outline + '20';
  ctx.lineWidth = 0.3;
  ctx.strokeRect(-armThick * s, 0, armThick * s, armLen * s);
  ctx.restore();

  ctx.save();
  ctx.translate((bX + bW + 0.3) * s, armY * s);
  ctx.rotate(-armSwing * Math.PI / 180 * 3);
  ctx.fillStyle = P.skin;
  ctx.fillRect(0, 0, armThick * s, armLen * 0.5 * s);
  ctx.fillStyle = P.skinShade;
  ctx.fillRect(0, armLen * 0.5 * s, armThick * s, armLen * 0.5 * s);
  ctx.fillStyle = P.skin;
  ctx.fillRect(0.1 * s, armLen * 0.9 * s, (armThick - 0.2) * s, 1 * s);
  ctx.strokeStyle = P.outline + '20';
  ctx.lineWidth = 0.3;
  ctx.strokeRect(0, 0, armThick * s, armLen * s);
  ctx.restore();

  // ── Pants ──
  const pTop = bTop + bH;
  const pW = bW - (t >= 3 ? 0 : 0.3);
  const pX = -pW / 2 + 1;
  const pH = 3 + t * 0.3;
  rect(pX, pTop, pW, pH, P.pants);
  rect(pX + pW * 0.6, pTop, pW * 0.4, pH, P.pantsShade);
  ctx.fillStyle = P.pantsShade;
  ctx.fillRect(pX * s, pTop * s, pW * s, 0.5 * s);
  ctx.fillStyle = P.pantsShade;
  ctx.fillRect((pX + pW/2 - 0.1) * s, (pTop + 0.5) * s, 0.2 * s, (pH - 0.5) * s);

  // ── Legs ──
  const legTop = pTop + pH - 0.3;
  const legLen = 5.5 - t * 0.2;
  const legThick = 1.3 + t * 0.35;
  const legSpread = t * 0.25;

  [[-1.2 - legSpread, legSwing], [1.2 + legSpread, -legSwing]].forEach(([offX, swing], idx) => {
    ctx.save();
    ctx.translate((offX + 1) * s, legTop * s);
    ctx.rotate(swing * Math.PI / 180 * 2);

    ctx.fillStyle = idx === 1 ? P.pantsShade : P.pants;
    ctx.fillRect(-legThick / 2 * s, 0, legThick * s, legLen * 0.3 * s);

    ctx.fillStyle = P.skin;
    ctx.fillRect(-legThick / 2 * s, legLen * 0.28 * s, legThick * s, legLen * 0.55 * s);
    ctx.fillStyle = P.skinShade;
    ctx.fillRect((legThick * 0.1) * s, legLen * 0.3 * s, (legThick * 0.3) * s, legLen * 0.5 * s);
    ctx.fillStyle = P.skinHi;
    ctx.fillRect((-legThick * 0.3) * s, legLen * 0.4 * s, (legThick * 0.3) * s, 0.6 * s);

    const shoeY = legLen * 0.8;
    const shoeW = legThick + 0.8;
    ctx.fillStyle = P.shoes;
    ctx.fillRect((-shoeW / 2) * s, shoeY * s, shoeW * s, 1.5 * s);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect((-shoeW / 2) * s, (shoeY + 1.3) * s, shoeW * s, 0.4 * s);
    ctx.fillStyle = P.shoesHi;
    ctx.fillRect((-shoeW / 2 + 0.2) * s, (shoeY + 0.2) * s, (shoeW * 0.4) * s, 0.4 * s);
    ctx.fillStyle = '#888888';
    ctx.fillRect((-shoeW / 2 + 0.4) * s, (shoeY + 0.7) * s, 0.3 * s, 0.3 * s);
    ctx.fillRect(0.1 * s, (shoeY + 0.7) * s, 0.3 * s, 0.3 * s);

    ctx.restore();
  });

  // ── Effects ──
  if (t >= 3) {
    const st = Date.now() / 300;
    const dropY = Math.abs(Math.sin(st)) * 3;
    ctx.fillStyle = 'rgba(100,180,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(5.5 * s, (fY + 1 + dropY) * s);
    ctx.quadraticCurveTo(6 * s, (fY + 2 + dropY) * s, 5.5 * s, (fY + 3 + dropY) * s);
    ctx.quadraticCurveTo(5 * s, (fY + 2 + dropY) * s, 5.5 * s, (fY + 1 + dropY) * s);
    ctx.fill();
    if (t >= 4) {
      ctx.beginPath();
      ctx.moveTo(-4 * s, (fY + 2 + dropY * 0.7) * s);
      ctx.quadraticCurveTo(-3.5 * s, (fY + 3 + dropY * 0.7) * s, -4 * s, (fY + 4 + dropY * 0.7) * s);
      ctx.quadraticCurveTo(-4.5 * s, (fY + 3 + dropY * 0.7) * s, -4 * s, (fY + 2 + dropY * 0.7) * s);
      ctx.fill();
    }
  }

  if (t === 0) {
    const st = Date.now() / 400;
    const alpha = 0.4 + Math.sin(st) * 0.35;
    ctx.fillStyle = `rgba(255,255,120,${alpha})`;
    const spX = (bX + bW + 2.5) * s;
    const spY = (bTop - 1) * s;
    ctx.fillRect(spX, spY + 0.5 * s, 1.8 * s, 0.4 * s);
    ctx.fillRect(spX + 0.7 * s, spY - 0.2 * s, 0.4 * s, 1.8 * s);
    ctx.fillRect(spX + 0.2 * s, spY + 0.1 * s, 0.3 * s, 0.3 * s);
    ctx.fillRect(spX + 1.3 * s, spY + 0.1 * s, 0.3 * s, 0.3 * s);
    ctx.fillRect(spX + 0.2 * s, spY + 1 * s, 0.3 * s, 0.3 * s);
    ctx.fillRect(spX + 1.3 * s, spY + 1 * s, 0.3 * s, 0.3 * s);
    const sp2X = (bX - 2) * s;
    const sp2Y = (bTop + 1) * s;
    const alpha2 = 0.3 + Math.sin(st + 1.5) * 0.25;
    ctx.fillStyle = `rgba(255,255,180,${alpha2})`;
    ctx.fillRect(sp2X, sp2Y + 0.3 * s, 1.2 * s, 0.3 * s);
    ctx.fillRect(sp2X + 0.45 * s, sp2Y, 0.3 * s, 1.2 * s);
  }

  ctx.restore();
}

export default function GradeRunnerBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    W: 0, H: 0,
    particles: [],
    runnerX: 0, runnerY: 0,
    targetX: 0, targetY: 0,
    mouseDown: false,
    frameIndex: 0, frameTick: 0,
    rafId: null,
  });

  const initParticles = useCallback((W, H) => {
    const count = Math.min(300, Math.floor(W * H / 700));
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      arr.push({
        word: WORDS[Math.floor(Math.random() * WORDS.length)],
        size: 9 + Math.random() * 14,
        homeX: x, homeY: y, x, y, vx: 0, vy: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.06 + Math.random() * 0.45,
        rotation: (Math.random() - 0.5) * 0.5,
      });
    }
    return arr;
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
      S.particles = initParticles(S.W, S.H);
      S.runnerX = S.W * 0.5;
      S.runnerY = S.H * 0.82;
      S.targetX = S.runnerX;
      S.targetY = S.runnerY;
    }

    function drawGradeZones() {
      const zoneH = S.H / 5;
      for (let i = 0; i < 5; i++) {
        const g = GRADES[i];
        const yTop = i * zoneH;
        const grad = ctx.createLinearGradient(0, yTop, 0, yTop + zoneH);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, g.color + '08');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, yTop, S.W, zoneH);

        if (i > 0) {
          ctx.strokeStyle = g.color + '20';
          ctx.lineWidth = 1;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(0, yTop);
          ctx.lineTo(S.W, yTop);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.save();
        ctx.font = '700 18px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = g.color + '50';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(g.label, 16, yTop + zoneH / 2 - 10);
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = g.color + '35';
        ctx.fillText(g.sub, 16, yTop + zoneH / 2 + 10);
        ctx.restore();

        ctx.save();
        ctx.font = '700 18px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = g.color + '50';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(g.label, S.W - 16, yTop + zoneH / 2 - 10);
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = g.color + '35';
        ctx.fillText(g.sub, S.W - 16, yTop + zoneH / 2 + 10);
        ctx.restore();
      }
    }

    function drawGradeBadge() {
      const gi = getGradeAtY(S.runnerY, S.H);
      const g = GRADES[gi];
      const bx = S.runnerX, by = S.runnerY - 75;
      const text = g.label + ' ' + g.sub;
      ctx.save();
      ctx.font = '700 14px -apple-system, BlinkMacSystemFont, sans-serif';
      const pw = ctx.measureText(text).width + 20, ph = 28, r = 8;
      ctx.fillStyle = g.color + 'CC';
      ctx.beginPath();
      ctx.moveTo(bx - pw/2 + r, by - ph/2);
      ctx.lineTo(bx + pw/2 - r, by - ph/2);
      ctx.quadraticCurveTo(bx + pw/2, by - ph/2, bx + pw/2, by - ph/2 + r);
      ctx.lineTo(bx + pw/2, by + ph/2 - r);
      ctx.quadraticCurveTo(bx + pw/2, by + ph/2, bx + pw/2 - r, by + ph/2);
      ctx.lineTo(bx - pw/2 + r, by + ph/2);
      ctx.quadraticCurveTo(bx - pw/2, by + ph/2, bx - pw/2, by + ph/2 - r);
      ctx.lineTo(bx - pw/2, by - ph/2 + r);
      ctx.quadraticCurveTo(bx - pw/2, by - ph/2, bx - pw/2 + r, by - ph/2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + ph/2);
      ctx.lineTo(bx, by + ph/2 + 6);
      ctx.lineTo(bx + 6, by + ph/2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx, by);
      ctx.restore();
    }

    function drawRunner() {
      const { runnerX: x, runnerY: y, H: h } = S;
      const gi = getGradeAtY(y, h);
      const g = GRADES[gi];

      // Glow
      const grd = ctx.createRadialGradient(x, y, 5, x, y, 90);
      grd.addColorStop(0, g.color + '25');
      grd.addColorStop(1, g.color + '00');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 90, 0, Math.PI * 2);
      ctx.fill();

      // Speed lines
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = g.color;
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

    function animate() {
      ctx.clearRect(0, 0, S.W, S.H);
      drawGradeZones();

      S.frameTick++;
      if (S.frameTick >= 6) { S.frameTick = 0; S.frameIndex = (S.frameIndex + 1) % 6; }

      S.runnerX += (S.targetX - S.runnerX) * 0.12;
      S.runnerY += (S.targetY - S.runnerY) * 0.12;
      S.runnerX = Math.max(60, Math.min(S.W - 60, S.runnerX));
      S.runnerY = Math.max(50, Math.min(S.H - 50, S.runnerY));

      for (const p of S.particles) {
        const dx = p.x - S.runnerX, dy = p.y - S.runnerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.vx += (p.homeX - p.x) * 0.035;
        p.vy += (p.homeY - p.y) * 0.035;
        p.vx *= 0.87; p.vy *= 0.87;
        p.x += p.vx; p.y += p.vy;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `600 ${p.size}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.word, 0, 0);
        ctx.restore();
      }

      drawRunner();
      drawGradeBadge();
      S.rafId = requestAnimationFrame(animate);
    }

    // Event handlers
    function onDown(e) {
      const x = e.clientX, y = e.clientY;
      const dx = x - S.runnerX, dy = y - S.runnerY;
      if (Math.sqrt(dx * dx + dy * dy) < 90) {
        S.mouseDown = true;
        canvas.classList.add('grabbing');
        canvas.setPointerCapture(e.pointerId);
      }
    }
    function onMove(e) {
      if (!S.mouseDown) return;
      S.targetX = e.clientX;
      S.targetY = e.clientY;
    }
    function onUp() {
      S.mouseDown = false;
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
  }, [initParticles]);

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
        background: '#0a0a1a',
      }}
    />
  );
}
