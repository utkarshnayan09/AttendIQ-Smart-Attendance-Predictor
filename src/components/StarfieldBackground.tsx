import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  dx: number;
  dy: number;
  opacity: number;
  active: boolean;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Glowing vibrant star palette
    const starColors = [
      '#ffffff',
      '#93c5fd', // Light Blue
      '#bfdbfe', // Soft Blue
      '#c4b5fd', // Soft Purple
      '#a78bfa', // Purple
      '#38bdf8', // Cyan
    ];

    // Create 180 - 240 visible stars
    const starCount = Math.min(220, Math.max(120, Math.floor((width * height) / 6000)));
    const particles: Particle[] = [];

    for (let i = 0; i < starCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35, // Floating speed
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() < 0.25 ? 2.2 : Math.random() < 0.6 ? 1.5 : 1.0,
        baseAlpha: 0.4 + Math.random() * 0.55,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      dx: 1,
      dy: 0.6,
      opacity: 0,
      active: false,
    };

    const spawnShootingStar = () => {
      if (shootingStar.active || Math.random() > 0.015) return;
      shootingStar.x = Math.random() * width * 0.7;
      shootingStar.y = Math.random() * (height * 0.4);
      shootingStar.length = 100 + Math.random() * 80;
      shootingStar.speed = 12 + Math.random() * 8;
      shootingStar.opacity = 0.95;
      shootingStar.active = true;
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Render drifting stars
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Screen wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Twinkle calculation
        const alpha = Math.max(
          0.15,
          Math.min(1, p.baseAlpha + Math.sin(tick * p.twinkleSpeed + p.twinklePhase) * 0.35)
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;

        // Glowing outer halo for bright stars
        if (p.radius > 1.4) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      // Constellation lines between nearby stars
      ctx.shadowBlur = 0;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;

          if (dist < 6000) {
            const lineAlpha = (1 - dist / 6000) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#818cf8';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Shooting star streak
      spawnShootingStar();
      if (shootingStar.active) {
        ctx.beginPath();
        const tailX = shootingStar.x - shootingStar.dx * shootingStar.length;
        const tailY = shootingStar.y - shootingStar.dy * shootingStar.length;

        const grad = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          tailX,
          tailY
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
        grad.addColorStop(0.3, `rgba(147, 197, 253, ${shootingStar.opacity * 0.7})`);
        grad.addColorStop(1, 'rgba(147, 197, 253, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        shootingStar.x += shootingStar.dx * shootingStar.speed;
        shootingStar.y += shootingStar.dy * shootingStar.speed;
        shootingStar.opacity -= 0.015;

        if (
          shootingStar.opacity <= 0 ||
          shootingStar.x > width + 100 ||
          shootingStar.y > height + 100
        ) {
          shootingStar.active = false;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
