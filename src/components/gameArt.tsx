import { useEffect, useRef } from 'react';

const DPR = () => Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

export function BossCanvas({ bossId, color, hpPct, phase, attacking, size = 300 }: { bossId: string; color: string; hpPct: number; phase: number; attacking?: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = DPR();
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0;
    const start = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rgb = (hex: string) => {
      const v = hex.replace('#', '');
      const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };
    const c = rgb(color);
    const parts = Array.from({ length: 26 }, () => ({ a: Math.random() * Math.PI * 2, r: 55 + Math.random() * 95, s: 0.3 + Math.random() * 0.8, size: 1 + Math.random() * 2.4 }));

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2 + 4;
      const shake = attacking ? Math.sin(t * 55) * 3.5 : 0;
      ctx.save();
      ctx.translate(cx + shake, cy);

      // aura rings
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 82 + i * 24 + Math.sin(t * 1.2 + i) * 4, 68 + i * 18 + Math.cos(t + i) * 3, t * 0.12 + i, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${0.14 - i * 0.035})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // orbiting spores
      parts.forEach((p, i) => {
        const ang = p.a + t * 0.22 * p.s;
        const rad = p.r * (0.85 + hpPct * 0.15);
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.7, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${0.25 + (i % 4) * 0.12})`;
        ctx.fill();
      });

      // central glow
      const grd = ctx.createRadialGradient(0, 0, 8, 0, 0, 120);
      grd.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0.32)`);
      grd.addColorStop(0.45, `rgba(${c.r},${c.g},${c.b},0.1)`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, 125, 0, Math.PI * 2);
      ctx.fill();

      const pulse = 1 + Math.sin(t * 2.1) * 0.025 + (1 - hpPct) * -0.04;
      ctx.scale(pulse, pulse);

      if (bossId.includes('blight')) {
        // spore mass with tendrils
        ctx.beginPath();
        for (let i = 0; i <= 70; i++) {
          const a = (i / 70) * Math.PI * 2;
          const r = 63 + Math.sin(a * 5 + t * 1.8) * 7 + Math.cos(a * 3 - t) * 5;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r * 0.88;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const bodyGrad = ctx.createRadialGradient(-18, -26, 8, 0, 0, 78);
        bodyGrad.addColorStop(0, '#335c24');
        bodyGrad.addColorStop(0.55, '#162f18');
        bodyGrad.addColorStop(1, '#07120a');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        // veins
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.22)`;
        ctx.lineWidth = 1.2;
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + 0.3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 16);
          ctx.quadraticCurveTo(Math.cos(a + 0.4) * 42, Math.sin(a + 0.4) * 38, Math.cos(a) * 60, Math.sin(a) * 53);
          ctx.stroke();
        }
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2 + Math.sin(t * 0.7 + k) * 0.2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 58, Math.sin(a) * 48);
          ctx.quadraticCurveTo(Math.cos(a) * 88 + Math.sin(t * 2 + k) * 12, Math.sin(a) * 78, Math.cos(a) * 104, Math.sin(a) * 92 + Math.cos(t + k) * 8);
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.5)`;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        // five asymmetric eyes
        const eyes = [[-25,-22,8], [4,-30,6], [27,-17,7], [-9,5,5], [38,6,4.5]];
        eyes.forEach(([ex, ey, er], idx) => {
          ctx.beginPath(); ctx.arc(ex, ey, er + 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(6,14,7,0.9)'; ctx.fill();
          ctx.beginPath(); ctx.arc(ex + Math.sin(t * 1.2 + idx) * 2, ey, er, 0, Math.PI * 2); ctx.fillStyle = idx % 2 ? '#d9ff7a' : '#ffcf5a'; ctx.fill();
          ctx.beginPath(); ctx.arc(ex + Math.sin(t * 1.2 + idx) * 2, ey, er * 0.38, 0, Math.PI * 2); ctx.fillStyle = '#07120a'; ctx.fill();
        });
        // jagged mouth
        ctx.beginPath();
        ctx.moveTo(-39, 30);
        for (let k = 0; k <= 8; k++) {
          const x = -39 + k * 10;
          const y = 30 + (k % 2 === 0 ? 10 : 0) + Math.sin(t * 3 + k) * 1.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(45, 24);
        ctx.lineTo(35, 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(4,9,5,0.92)'; ctx.fill();
        ctx.strokeStyle = 'rgba(183,243,74,0.35)'; ctx.lineWidth = 1.4; ctx.stroke();
        // teeth
        ctx.fillStyle = 'rgba(220,245,190,0.85)';
        for (let k = 0; k < 6; k++) {
          const x = -31 + k * 13;
          ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x + 4, 39); ctx.lineTo(x + 7, 30); ctx.fill();
        }
      } else if (bossId.includes('combustion')) {
        // furnace skull
        ctx.beginPath();
        ctx.moveTo(-58, -12);
        ctx.bezierCurveTo(-62, -72, 60, -78, 60, -14);
        ctx.bezierCurveTo(62, 38, 34, 58, 0, 60);
        ctx.bezierCurveTo(-34, 58, -60, 34, -58, -12);
        ctx.closePath();
        ctx.fillStyle = '#1a0e09';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        // flames
        for (let k = 0; k < 8; k++) {
          const x = -56 + k * 16;
          const fh = 20 + Math.sin(t * 4 + k) * 13;
          ctx.beginPath();
          ctx.moveTo(x, 46);
          ctx.quadraticCurveTo(x + 10, 46 - fh, x + 5, 14);
          ctx.quadraticCurveTo(x - 2, 32, x, 46);
          ctx.fillStyle = `rgba(255,${80 + k * 8},40,0.55)`;
          ctx.fill();
        }
        ctx.fillStyle = '#ffb24a';
        ctx.beginPath(); ctx.ellipse(-24, -14, 11, 8, -0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(24, -14, 11, 8, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a0e09';
        ctx.beginPath(); ctx.arc(-23, -14, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(25, -14, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ff8a65';
        ctx.lineWidth = 3;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath(); ctx.moveTo(-35 + k * 22, 20); ctx.lineTo(-28 + k * 22, 34); ctx.stroke();
        }
      } else {
        // crystal tyrant
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 ? 46 : 76;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r * 0.9;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const g2 = ctx.createLinearGradient(-60, -80, 60, 80);
        g2.addColorStop(0, '#4c1d95');
        g2.addColorStop(1, '#2e1065');
        ctx.fillStyle = g2;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f5eaff';
        ctx.beginPath(); ctx.ellipse(0, -4, 9, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3b0764';
        ctx.beginPath(); ctx.ellipse(0, -3, 3, 10, 0, 0, Math.PI * 2); ctx.fill();
        // orbiting atoms
        for (let k = 0; k < 3; k++) {
          const a = t * (0.8 + k * 0.18) + k * 2.1;
          const rad = 95;
          const x = Math.cos(a) * rad;
          const y = Math.sin(a) * rad * 0.5;
          ctx.beginPath(); ctx.arc(x, y, 5.2, 0, Math.PI * 2); ctx.fillStyle = '#a78bfa'; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(167,139,250,0.25)'; ctx.stroke();
        }
      }
      ctx.restore();
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [bossId, color, hpPct, phase, attacking, size]);
  return <canvas ref={ref} className="block max-w-full" aria-hidden="true" />;
}

export function TowerCanvas({ floors, wrongCount, supports, collapsed, size = 380 }: { floors: number; wrongCount: number; supports: number; collapsed?: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = DPR();
    const w = size;
    const h = Math.round(size * 1.45);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0;
    const start = performance.now();
    const stars = Array.from({ length: 60 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.7, r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.6 + 0.15 }));
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#071018');
      sky.addColorStop(0.65, '#0a1520');
      sky.addColorStop(1, '#122018');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      // moon
      ctx.beginPath(); ctx.arc(w * 0.78, 62, 25, 0, Math.PI * 2); ctx.fillStyle = 'rgba(183,243,74,0.12)'; ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.78, 62, 17, 0, Math.PI * 2); ctx.fillStyle = 'rgba(230,255,200,0.55)'; ctx.fill();
      stars.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(230,255,220,${s.a * (0.7 + Math.sin(t + s.x) * 0.3)})`; ctx.fill(); });
      // ground
      const groundY = h - 26;
      ctx.fillStyle = '#0b1712'; ctx.fillRect(0, groundY, w, 26);
      ctx.strokeStyle = 'rgba(183,243,74,0.18)'; ctx.beginPath(); ctx.moveTo(0, groundY + 0.5); ctx.lineTo(w, groundY + 0.5); ctx.stroke();

      const baseW = w * 0.52;
      const cx = w / 2;
      const floorH = Math.min(28, (groundY - 120) / 12);
      ctx.save();
      if (collapsed) {
        ctx.translate(cx, groundY);
        ctx.rotate(0.12);
        ctx.translate(-cx, -groundY);
      }
      // support legs
      ctx.strokeStyle = `rgba(183,243,74,${0.24 + supports * 0.1})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - baseW / 2 - 12, groundY); ctx.lineTo(cx - baseW / 2 + 10, groundY - floorH * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + baseW / 2 + 12, groundY); ctx.lineTo(cx + baseW / 2 - 10, groundY - floorH * 2); ctx.stroke();
      // floors
      for (let i = 0; i < 12; i++) {
        const y = groundY - (i + 1) * floorH;
        const width = baseW * (1 - i * 0.032);
        const built = i < floors;
        const target = i === floors;
        ctx.beginPath();
        ctx.roundRect(cx - width / 2, y, width, floorH - 2, 3);
        if (built) {
          const g = ctx.createLinearGradient(cx - width / 2, y, cx + width / 2, y + floorH);
          g.addColorStop(0, 'rgba(36,62,45,0.95)');
          g.addColorStop(1, 'rgba(15,31,24,0.95)');
          ctx.fillStyle = g;
        } else if (target) {
          ctx.fillStyle = 'rgba(183,243,74,0.08)';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.02)';
        }
        ctx.fill();
        ctx.strokeStyle = built ? 'rgba(183,243,74,0.42)' : target ? 'rgba(183,243,74,0.3)' : 'rgba(255,255,255,0.05)';
        ctx.setLineDash(target ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
        if (built) {
          // windows
          const count = 4 + (i % 2);
          for (let k = 0; k < count; k++) {
            const wx = cx - width / 2 + 10 + k * ((width - 20) / count);
            const glow = Math.sin(t * 1.5 + i + k) * 0.15 + 0.65;
            ctx.fillStyle = `rgba(255,214,120,${glow})`;
            ctx.fillRect(wx, y + 7, 6, 5);
          }
        }
      }
      // obstacles
      for (let i = 0; i < wrongCount; i++) {
        const x = cx - baseW / 2 + 14 + i * 18;
        const y = groundY - Math.max(1, floors) * floorH - 6;
        ctx.strokeStyle = 'rgba(255,107,107,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 5, y + 8); ctx.lineTo(x + 1, y + 15); ctx.lineTo(x + 7, y + 22); ctx.stroke();
      }
      // crane at top
      const topY = groundY - Math.max(1, floors) * floorH - 26;
      ctx.strokeStyle = 'rgba(183,243,74,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 20, topY + 20); ctx.lineTo(cx + 20, topY); ctx.lineTo(cx + 75, topY - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 58, topY - 10); ctx.lineTo(cx + 58, topY + 12); ctx.stroke();
      ctx.fillStyle = 'rgba(183,243,74,0.7)';
      ctx.beginPath(); ctx.roundRect(cx + 52, topY + 12, 12, 10, 2); ctx.fill();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [floors, wrongCount, supports, collapsed, size]);
  return <canvas ref={ref} className="block max-w-full" aria-hidden="true" />;
}

export function SpeedGauge({ remaining, total, size = 210 }: { remaining: number; total: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, remaining / total));
  const angle = -220 + pct * 260;
  const r = size / 2 - 20;
  const c = size / 2;
  const ticks = Array.from({ length: 21 }, (_, i) => -220 + (i / 20) * 260);
  return (
    <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`} aria-hidden="true">
      <defs>
        <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4de1c1" /><stop offset="70%" stopColor="#b7f34a" /><stop offset="100%" stopColor="#ff7a6b" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d={`M ${c + Math.cos((-220 * Math.PI) / 180) * r} ${c + Math.sin((-220 * Math.PI) / 180) * r} A ${r} ${r} 0 1 1 ${c + Math.cos((40 * Math.PI) / 180) * r} ${c + Math.sin((40 * Math.PI) / 180) * r}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${c + Math.cos((-220 * Math.PI) / 180) * r} ${c + Math.sin((-220 * Math.PI) / 180) * r} A ${r} ${r} 0 1 1 ${c + Math.cos((( -220 + pct * 260) * Math.PI) / 180) * r} ${c + Math.sin((( -220 + pct * 260) * Math.PI) / 180) * r}`} fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round" filter="url(#glow)" />
      {ticks.map((a, i) => <line key={i} x1={c + Math.cos((a * Math.PI) / 180) * (r - 17)} y1={c + Math.sin((a * Math.PI) / 180) * (r - 17)} x2={c + Math.cos((a * Math.PI) / 180) * (r - 10)} y2={c + Math.sin((a * Math.PI) / 180) * (r - 10)} stroke={i > 16 ? '#ff7a6b' : 'rgba(255,255,255,0.25)'} strokeWidth={i % 5 === 0 ? 2 : 1} />)}
      <g transform={`rotate(${angle} ${c} ${c})`}><line x1={c} y1={c} x2={c + r - 28} y2={c} stroke="#f2f7f3" strokeWidth="2.5" strokeLinecap="round" /><circle cx={c} cy={c} r="5" fill="#b7f34a" /></g>
      <text x={c} y={c + 34} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="700">{Math.ceil(remaining)}s</text>
    </svg>
  );
}