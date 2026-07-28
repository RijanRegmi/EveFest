"use client";

import React, { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const spotlight = spotlightRef.current;
    if (!container || !canvas || !spotlight) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let isVisible = true;
    let animationFrameId: number;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    let containerRect = container.getBoundingClientRect();

    const mouse = {
      x: -500,
      y: -500,
      targetX: -500,
      targetY: -500,
      inBounds: false,
    };

    // Cache bounds on scroll/resize, not on every mousemove!
    const updateRect = () => {
      if (container) {
        containerRect = container.getBoundingClientRect();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const relativeX = e.clientX - containerRect.left;
      const relativeY = e.clientY - containerRect.top;

      if (
        relativeX >= -50 &&
        relativeX <= containerRect.width + 50 &&
        relativeY >= -50 &&
        relativeY <= containerRect.height + 50
      ) {
        mouse.targetX = relativeX;
        mouse.targetY = relativeY;
        mouse.inBounds = true;
        // Direct DOM mutation for 120 FPS performance with 0 React re-renders!
        spotlight.style.opacity = "1";
      } else {
        mouse.inBounds = false;
        spotlight.style.opacity = "0";
      }
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
      updateRect();
    };

    // Pause animation when hero section is out of viewport!
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    // 16 lightweight particles
    const particleCount = 16;
    const colors = ["#ff3030", "#6366f1", "#06b6d4"];

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let time = 0;

    const render = () => {
      if (isVisible) {
        time += 0.015;
        ctx.clearRect(0, 0, width, height);

        // Direct DOM update for spotlight position (NO React state setters!)
        if (mouse.inBounds) {
          mouse.x += (mouse.targetX - mouse.x) * 0.12;
          mouse.y += (mouse.targetY - mouse.y) * 0.12;
          spotlight.style.transform = `translate3d(${mouse.x - 220}px, ${mouse.y - 220}px, 0)`;
        }

        // Draw particle nodes & connecting lines
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx + Math.sin(time + i) * 0.1;
          p.y += p.vy + Math.cos(time + i) * 0.1;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Draw node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.5;
          ctx.fill();

          // Connect particles to mouse
          if (mouse.inBounds) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              const alpha = (1 - dist / 140) * 0.35;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = alpha;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }

          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const pdx = p.x - p2.x;
            const pdy = p.y - p2.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < 100) {
              const alpha = (1 - pdist / 100) * 0.12;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = "#6366f1";
              ctx.globalAlpha = alpha;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateRect);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-bg-container">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* GPU Accelerated Spotlight (Direct DOM transformed, 0 React re-renders) */}
      <div ref={spotlightRef} className="mouse-spotlight" />

      {/* Hardware-optimized Ambient Gradient Orbs (No expensive live CSS filter: blur) */}
      <div className="hero-orb orb-red" />
      <div className="hero-orb orb-violet" />

      <style jsx>{`
        .hero-bg-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .mouse-spotlight {
          position: absolute;
          width: 440px;
          height: 440px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 48, 48, 0.15) 0%,
            rgba(99, 102, 241, 0.08) 40%,
            transparent 70%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          will-change: transform;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          opacity: 0.35;
          pointer-events: none;
        }

        .orb-red {
          width: 400px;
          height: 400px;
          top: -80px;
          left: 10%;
          background: radial-gradient(circle, rgba(255, 48, 48, 0.18) 0%, transparent 70%);
        }

        .orb-violet {
          width: 450px;
          height: 450px;
          top: 15%;
          right: 5%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
}
