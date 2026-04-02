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
  1: '#FFD5A8', 2: '#3A2A1A', 3: '#5DCAA5',
  4: '#2C3E6B', 5: '#E8E8E8', 6: '#1A1A2E', 7: '#CC4444',
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
  const belly = t * 1.5;
  const legSpread = t * 0.3;

  const phase = (frameIndex / 6) * Math.PI * 2;
  const legSwing = Math.sin(phase) * (12 - t);
  const armSwing = Math.sin(phase + Math.PI) * (10 - t * 0.5);
  const bounce = Math.abs(Math.sin(phase)) * (3 - t * 0.3);

  ctx.translate(0, -bounce * s / PX);

  const skin = PALETTE[1], hair = PALETTE[2], shirt = PALETTE[3];
  const pants = PALETTE[4], shoes = PALETTE[5], eye = PALETTE[6], band = PALETTE[7];

  const rect = (px, py, pw, ph, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * s, py * s, pw * s, ph * s);
  };

  // Head
  const headX = -3, headY = -14 - (t > 2 ? 0.5 : 0);
  rect(headX, headY, 6, 2, hair);
  rect(headX - 0.5, headY + 0.5, 7, 2, hair);
  rect(headX, headY + 2, 6, 1, band);
  rect(headX, headY + 3, 6, 3, skin);
  rect(headX + 1, headY + 3.5, 1, 1, eye);
  rect(headX + 4, headY + 3.5, 1, 1, eye);
  rect(headX + 1, headY + 5, 4, 0.5, skin);

  // Neck
  rect(-1, headY + 6, 2, 1, skin);

  // Torso
  const torsoTop = headY + 7;
  const torsoW = 4 + belly;
  const torsoH = 5 + t * 0.8;
  const torsoX = -torsoW / 2;
  rect(torsoX, torsoTop, torsoW, torsoH, shirt);

  if (t >= 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect((torsoX + 1) * s, (torsoTop + 1) * s, (torsoW - 2) * s, (torsoH - 2) * s);
  }
  if (t === 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(-0.3 * s, torsoTop * s, 0.6 * s, torsoH * s);
  }
  if (t <= 1) {
    rect(torsoX - 0.8, torsoTop, 1, 2, shirt);
    rect(torsoX + torsoW - 0.2, torsoTop, 1, 2, shirt);
  }

  // Arms
  const armY = torsoTop + 1;
  const armLen = 4 + (t === 0 ? 0.5 : 0);
  const armThick = t >= 3 ? 1.5 : 1;

  ctx.save();
  ctx.translate((torsoX - 0.5) * s, armY * s);
  ctx.rotate(armSwing * Math.PI / 180 * 3);
  ctx.fillStyle = skin;
  ctx.fillRect(-armThick * s, 0, armThick * s, armLen * s);
  ctx.restore();

  ctx.save();
  ctx.translate((torsoX + torsoW + 0.5) * s, armY * s);
  ctx.rotate(-armSwing * Math.PI / 180 * 3);
  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, armThick * s, armLen * s);
  ctx.restore();

  // Pants + Legs
  const pantsTop = torsoTop + torsoH;
  const pantsW = torsoW - (t >= 3 ? 0 : 0.5);
  const pantsX = -pantsW / 2;
  const pantsH = 3 + t * 0.3;
  rect(pantsX, pantsTop, pantsW, pantsH * 0.5, pants);

  const legTop = pantsTop + pantsH * 0.4;
  const legLen = 5 - t * 0.2;
  const legThick = 1 + t * 0.4;

  [[-1 - legSpread, legSwing], [1 + legSpread, -legSwing]].forEach(([offX, swing]) => {
    ctx.save();
    ctx.translate(offX * s, legTop * s);
    ctx.rotate(swing * Math.PI / 180 * 2);
    ctx.fillStyle = pants;
    ctx.fillRect(-legThick / 2 * s, 0, legThick * s, legLen * 0.6 * s);
    ctx.fillStyle = skin;
    ctx.fillRect(-legThick / 2 * s, legLen * 0.5 * s, legThick * s, legLen * 0.4 * s);
    ctx.fillStyle = shoes;
    ctx.fillRect((-legThick / 2 - 0.3) * s, legLen * 0.9 * s, (legThick + 0.8) * s, 1.2 * s);
    ctx.restore();
  });

  // Sweat (chubby)
  if (t >= 3) {
    const st = Date.now() / 300;
    ctx.fillStyle = 'rgba(135,206,250,0.6)';
    ctx.fillRect((headX + 6.5) * s, (headY + 2 + Math.abs(Math.sin(st)) * 3) * s, 0.8 * s, 1.2 * s);
    if (t >= 4) ctx.fillRect((headX - 1.5) * s, (headY + 3 + Math.abs(Math.sin(st)) * 3) * s, 0.8 * s, 1.2 * s);
  }

  // Sparkle (fit)
  if (t === 0) {
    const st = Date.now() / 400;
    ctx.fillStyle = `rgba(255,255,100,${0.3 + Math.sin(st) * 0.3})`;
    const sparkX = torsoX + torsoW + 2, sparkY = torsoTop - 1;
    ctx.fillRect(sparkX * s, (sparkY + 0.5) * s, 1.5 * s, 0.4 * s);
    ctx.fillRect((sparkX + 0.5) * s, sparkY * s, 0.4 * s, 1.5 * s);
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
