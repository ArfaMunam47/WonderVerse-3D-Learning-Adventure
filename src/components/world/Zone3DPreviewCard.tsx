import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WorldZone, WorldZoneId } from '../../types';
import { WORLD_ZONES } from '../../data/worldZones';
import { Sparkles, ArrowRight, X, Compass } from 'lucide-react';
import { audioService } from '../../utils/audio';

export interface Zone3DPreviewCardProps {
  zone?: WorldZone;
  zoneId?: WorldZoneId;
  onSelectZone?: (zoneId: WorldZoneId) => void;
  onExplore?: () => void;
  onClose?: () => void;
}

export const Zone3DPreviewCard: React.FC<Zone3DPreviewCardProps> = ({
  zone,
  zoneId,
  onSelectZone,
  onExplore,
  onClose
}) => {
  const miniCanvasRef = useRef<HTMLDivElement>(null);
  const targetZone = zone || (zoneId ? WORLD_ZONES.find(z => z.id === zoneId) : undefined);

  // Render miniature live 3D preview of the landmark/theme
  useEffect(() => {
    if (!targetZone || !miniCanvasRef.current) return;
    const container = miniCanvasRef.current;
    const width = container.clientWidth || 240;
    const height = container.clientHeight || 140;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F8FAFC');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 3.5, 7.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#FFF7D6', 1.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Dynamic 3D feature based on zone
    const previewGroup = new THREE.Group();
    scene.add(previewGroup);

    // Mini ground pedestal
    const pedestalGeo = new THREE.CylinderGeometry(3.2, 3.5, 0.6, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: targetZone.bgColor === '#F0FDFA' ? '#99F6E4' : '#E2E8F0',
      roughness: 0.5
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.3;
    previewGroup.add(pedestal);

    // 3D Objects per zone
    if (targetZone.id === 'alphabet') {
      // Golden glowing Letter block A
      const blockGeo = new THREE.BoxGeometry(2, 2, 2);
      const blockMat = new THREE.MeshStandardMaterial({ color: '#0D9488', roughness: 0.3 });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.y = 1.2;
      previewGroup.add(block);

      const archGeo = new THREE.TorusGeometry(2.2, 0.35, 16, 32, Math.PI);
      const archMat = new THREE.MeshStandardMaterial({ color: '#5EEAD4', roughness: 0.2 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.y = 0.5;
      previewGroup.add(arch);
    } else if (targetZone.id === 'numbers') {
      // Stepping dice pillars
      for (let i = 0; i < 3; i++) {
        const cylGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.8 + i * 0.6, 16);
        const cylMat = new THREE.MeshStandardMaterial({ color: i === 0 ? '#3B82F6' : i === 1 ? '#60A5FA' : '#93C5FD' });
        const pillar = new THREE.Mesh(cylGeo, cylMat);
        pillar.position.set((i - 1) * 1.5, (0.4 + i * 0.3), 0);
        previewGroup.add(pillar);
      }
    } else if (targetZone.id === 'fruits') {
      // Big Apple & Orange
      const appleGeo = new THREE.SphereGeometry(1.2, 24, 24);
      const appleMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.2 });
      const apple = new THREE.Mesh(appleGeo, appleMat);
      apple.position.set(-0.9, 1.2, 0);
      previewGroup.add(apple);

      const orangeGeo = new THREE.SphereGeometry(1.0, 24, 24);
      const orangeMat = new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.3 });
      const orange = new THREE.Mesh(orangeGeo, orangeMat);
      orange.position.set(1.0, 1.0, 0.4);
      previewGroup.add(orange);
    } else if (targetZone.id === 'animals') {
      // Animal Treehouse Shelter
      const trunkGeo = new THREE.CylinderGeometry(0.6, 0.8, 2.2, 12);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350F' });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1;
      previewGroup.add(trunk);

      const roofGeo = new THREE.ConeGeometry(2.0, 1.4, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: '#DB2777' });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 2.4;
      roof.rotateY(Math.PI / 4);
      previewGroup.add(roof);
    } else if (targetZone.id === 'creative') {
      // Easel & Palette
      const easelGeo = new THREE.BoxGeometry(2, 2.2, 0.2);
      const easelMat = new THREE.MeshStandardMaterial({ color: '#FAF5FF', roughness: 0.4 });
      const canvasMesh = new THREE.Mesh(easelGeo, easelMat);
      canvasMesh.position.set(0, 1.4, 0);
      canvasMesh.rotateX(-0.15);
      previewGroup.add(canvasMesh);
    } else if (targetZone.id === 'music') {
      // Xylophone keys
      for (let i = 0; i < 5; i++) {
        const barGeo = new THREE.BoxGeometry(0.4, 0.15, 1.8 - i * 0.2);
        const colors = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];
        const barMat = new THREE.MeshStandardMaterial({ color: colors[i] });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set((i - 2) * 0.55, 0.8, 0);
        previewGroup.add(bar);
      }
    } else if (targetZone.id === 'stories') {
      // Open storybook
      const bookGeo = new THREE.BoxGeometry(2.4, 0.3, 1.8);
      const bookMat = new THREE.MeshStandardMaterial({ color: '#C2410C' });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.y = 1;
      book.rotateX(0.3);
      previewGroup.add(book);
    } else {
      // Observatory Star
      const starGeo = new THREE.OctahedronGeometry(1.2, 0);
      const starMat = new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.6, roughness: 0.1 });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.y = 1.4;
      previewGroup.add(star);
    }

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      previewGroup.rotation.y += 0.015;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [targetZone]);

  if (!targetZone) return null;

  const handleAction = () => {
    audioService.playPop();
    if (onExplore) {
      onExplore();
    } else if (onSelectZone && targetZone) {
      onSelectZone(targetZone.id);
    }
  };

  return (
    <div
      id="zone-3d-preview-card"
      className="w-80 md:w-96 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border-2 border-slate-200/80 text-slate-800 animate-in fade-in zoom-in-95 duration-200"
      style={{
        boxShadow: `0 20px 35px -10px ${targetZone.themeColor}33`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: targetZone.themeColor }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg leading-snug text-slate-900">
              {targetZone.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              {targetZone.landmark}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            aria-label="Close preview"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3D Miniature Live Viewport */}
      <div
        ref={miniCanvasRef}
        className="w-full h-32 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/70 relative mb-3 shadow-inner"
      >
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-xs text-[10px] font-bold text-slate-600 border border-slate-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          3D Live Preview
        </div>
      </div>

      {/* Tagline & Learning Badges */}
      <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2">
        {targetZone.tagline}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {targetZone.learningFocus.slice(0, 3).map((focus, idx) => (
          <span
            key={idx}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60"
          >
            {focus}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        className="w-full py-3 px-4 rounded-2xl text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 hover:brightness-110"
        style={{
          backgroundColor: targetZone.themeColor
        }}
      >
        <span>Explore {targetZone.shortName}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
