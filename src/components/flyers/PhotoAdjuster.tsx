'use client';

import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { PhotoTransform } from '@/lib/types';

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = { x: 50, y: 50, zoom: 1 };

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const PAN_STEP = 10;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface PhotoAdjusterProps {
  transform: PhotoTransform;
  onChange: (transform: PhotoTransform) => void;
}

export default function PhotoAdjuster({ transform, onChange }: PhotoAdjusterProps) {
  const zoomed = transform.zoom > 1;

  const setZoom = (zoom: number) =>
    onChange({ ...transform, zoom: clamp(Math.round(zoom * 100) / 100, MIN_ZOOM, MAX_ZOOM) });
  const pan = (dx: number, dy: number) =>
    onChange({ ...transform, x: clamp(transform.x + dx, 0, 100), y: clamp(transform.y + dy, 0, 100) });

  const reset = () => onChange({ ...DEFAULT_PHOTO_TRANSFORM });

  const arrowClass = (disabled: boolean) =>
    `w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-navy-800 ${
      disabled ? 'bg-navy-800 text-navy-500' : 'bg-navy-800 hover:bg-navy-700 text-navy-200 hover:text-white'
    }`;

  return (
    <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Ajustar Fotografia</p>
        <button
          type="button"
          onClick={reset}
          aria-label="Repor posição e zoom da fotografia"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-navy-300 hover:text-white text-[10px] font-semibold transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Repor
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="photo-zoom" className="block text-[11px] font-semibold text-navy-200">
            Zoom
          </label>
          <span className="text-[11px] font-bold text-gold-300 tabular-nums">{Math.round(transform.zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom(transform.zoom - ZOOM_STEP)}
            disabled={transform.zoom <= MIN_ZOOM}
            aria-label="Diminuir zoom"
            className={arrowClass(transform.zoom <= MIN_ZOOM)}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            id="photo-zoom"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.05}
            value={transform.zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-gold-500 cursor-pointer"
            aria-label="Zoom da fotografia"
          />
          <button
            type="button"
            onClick={() => setZoom(transform.zoom + ZOOM_STEP)}
            disabled={transform.zoom >= MAX_ZOOM}
            aria-label="Aumentar zoom"
            className={arrowClass(transform.zoom >= MAX_ZOOM)}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-1">
          <span></span>
          <button
            type="button"
            onClick={() => pan(0, -PAN_STEP)}
            disabled={!zoomed}
            aria-label="Mover fotografia para cima"
            className={arrowClass(!zoomed)}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <span></span>
          <button
            type="button"
            onClick={() => pan(-PAN_STEP, 0)}
            disabled={!zoomed}
            aria-label="Mover fotografia para a esquerda"
            className={arrowClass(!zoomed)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span></span>
          <button
            type="button"
            onClick={() => pan(PAN_STEP, 0)}
            disabled={!zoomed}
            aria-label="Mover fotografia para a direita"
            className={arrowClass(!zoomed)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span></span>
          <button
            type="button"
            onClick={() => pan(0, PAN_STEP)}
            disabled={!zoomed}
            aria-label="Mover fotografia para baixo"
            className={arrowClass(!zoomed)}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <span></span>
        </div>

        <div className="text-[10px] text-navy-400 leading-relaxed flex-1">
          <p>Aplique zoom e use as setas para enquadrar a fotografia no molde do flyer.</p>
          {!zoomed && <p className="text-navy-500 mt-1">Amplie primeiro para poder mover a imagem.</p>}
        </div>
      </div>
    </div>
  );
}