'use client';

import { useEffect, useRef } from 'react';

type ElementType = 'circle' | 'triangle' | 'line';

interface FloatingElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
  points?: { x: number; y: number }[];
  length?: number;
  lineWidth?: number;
}

export default function FloatingElements() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elements = useRef<FloatingElement[]>([]);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajusta o tamanho do canvas para a tela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Cria um triângulo equilátero
    const createTriangle = (x: number, y: number, size: number) => {
      const height = size * Math.sqrt(3);
      return [
        { x: x, y: y - height / 2 },
        { x: x - size / 2, y: y + height / 2 },
        { x: x + size / 2, y: y + height / 2 }
      ];
    };

    // Inicializa os elementos flutuantes
    const initElements = () => {
      const count = 50; // Aumentando para 50 elementos
      const newElements: FloatingElement[] = [];
      
      // Garantir que temos uma mistura balanceada de elementos
      const types: ElementType[] = [];
      for (let i = 0; i < count; i++) {
        if (i % 3 === 0) types.push('circle');
        else if (i % 3 === 1) types.push('triangle');
        else types.push('line');
      }
      
      // Embaralhar os tipos
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      
      for (let i = 0; i < count; i++) {
        const type = types[i];
        
        const size = type === 'line' 
          ? Math.random() * 40 + 30  // Linhas mais longas
          : type === 'triangle' 
            ? Math.random() * 15 + 5  // Triângulos médios
            : Math.random() * 6 + 2;  // Círculos pequenos
        
        const element: FloatingElement = {
          id: i,
          type,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02, // Rotação um pouco mais rápida
          speedX: (Math.random() - 0.5) * 0.8, // Movimento um pouco mais rápido
          speedY: (Math.random() - 0.5) * 0.8,
          opacity: type === 'line' 
            ? Math.random() * 0.1 + 0.05  // Linhas um pouco mais visíveis
            : Math.random() * 0.15 + 0.05, // Formas um pouco mais visíveis
          lineWidth: type === 'line' ? Math.random() * 1 + 0.5 : undefined
        };

        if (type === 'triangle') {
          element.points = [
            { x: 0, y: -size },
            { x: size, y: size },
            { x: -size, y: size }
          ];
        } else if (type === 'line') {
          element.length = size;
        }
        
        newElements.push(element);
      }
      
      elements.current = newElements;
    };

    // Atualiza a posição dos elementos
    const updateElements = () => {
      elements.current = elements.current.map(element => {
        let newX = element.x + element.speedX;
        let newY = element.y + element.speedY;
        let newSpeedX = element.speedX;
        let newSpeedY = element.speedY;
        let newRotation = element.rotation + (element.rotationSpeed || 0);

        // Inverte a direção ao atingir as bordas
        if (newX < -50) newX = canvas.width + 50;
        else if (newX > canvas.width + 50) newX = -50;
        
        if (newY < -50) newY = canvas.height + 50;
        else if (newY > canvas.height + 50) newY = -50;

        // Adiciona um pouco de aleatoriedade ao movimento
        if (Math.random() > 0.99) {
          newSpeedX = (Math.random() - 0.5) * 0.5;
          newSpeedY = (Math.random() - 0.5) * 0.5;
        }

        return {
          ...element,
          x: newX,
          y: newY,
          rotation: newRotation,
          speedX: newSpeedX,
          speedY: newSpeedY
        };
      });
    };

    // Desenha os elementos no canvas
    const drawElements = () => {
      if (!ctx) return;
      
      // Limpa o canvas com um fundo transparente
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenha cada elemento
      elements.current.forEach(element => {
        ctx.save();
        ctx.translate(element.x, element.y);
        
        if (element.rotation) {
          ctx.rotate(element.rotation);
        }
        
        ctx.beginPath();
        
        switch (element.type) {
          case 'circle':
            ctx.arc(0, 0, element.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${element.opacity})`;
            ctx.fill();
            break;
            
          case 'triangle':
            if (element.points && element.points.length === 3) {
              ctx.beginPath();
              ctx.moveTo(element.points[0].x, element.points[0].y);
              ctx.lineTo(element.points[1].x, element.points[1].y);
              ctx.lineTo(element.points[2].x, element.points[2].y);
              ctx.closePath();
              ctx.fillStyle = `rgba(255, 255, 255, ${element.opacity})`;
              ctx.fill();
              
              // Adiciona uma borda sutil
              ctx.strokeStyle = `rgba(255, 255, 255, ${element.opacity * 0.7})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
            break;
            
          case 'line':
            const length = element.length || 30;
            ctx.beginPath();
            ctx.moveTo(-length/2, 0);
            ctx.lineTo(length/2, 0);
            ctx.strokeStyle = `rgba(255, 255, 255, ${element.opacity})`;
            ctx.lineWidth = element.lineWidth || 0.8;
            ctx.lineCap = 'round';
            ctx.stroke();
            break;
        }
        
        ctx.restore();
      });
    };

    // Loop de animação
    const animate = () => {
      updateElements();
      drawElements();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Configuração inicial
    resizeCanvas();
    initElements();
    animate();

    // Atualiza o tamanho do canvas quando a janela for redimensionada
    window.addEventListener('resize', resizeCanvas);

    // Limpeza
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
