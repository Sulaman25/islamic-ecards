"use client";
import React, { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
};

function resetParticle(
  particle: Particle,
  viewportWidth: number,
  viewportHeight: number,
) {
  particle.x = Math.random() * viewportWidth;
  particle.y = viewportHeight + 100;
  particle.size = Math.random() * 2 + 1;
  particle.speedX = Math.random() * 1 - 0.5;
  particle.speedY = Math.random() * -1 - 0.5;
  particle.color = "#d4af37";
  particle.opacity = Math.random() * 0.5 + 0.2;
}

function createParticle(viewportWidth: number, viewportHeight: number): Particle {
  const particle: Particle = {
    x: 0,
    y: 0,
    size: 0,
    speedX: 0,
    speedY: 0,
    color: "",
    opacity: 0,
  };
  resetParticle(particle, viewportWidth, viewportHeight);
  return particle;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    let animationFrameId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particles.length === 0) {
        for (let i = 0; i < 50; i += 1) {
          particles.push(createParticle(canvas.width, canvas.height));
        }
      }
    };

    const updateParticle = (particle: Particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      if (particle.y < -10) {
        resetParticle(particle, canvas.width, canvas.height);
      }
    };

    const drawParticle = (particle: Particle) => {
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        updateParticle(particle);
        drawParticle(particle);
      }
      animationFrameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 opacity-60"
    />
  );
};

export default ParticleBackground;
