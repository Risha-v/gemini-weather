"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { cn } from '@/lib/utils';
import JourneySetup from './JourneySetup';
import IntelligenceContent from './IntelligenceContent';

type SheetState = 'COLLAPSED' | 'HALF' | 'EXPANDED';

export default function MobileBottomSheet({ onPlayDemo }: { onPlayDemo: () => void }) {
  const { journey } = useJourney();
  const [sheetState, setSheetState] = useState<SheetState>('COLLAPSED');
  const touchStartY = useRef<number | null>(null);

  // Auto-expand slightly if intelligence arrives (Demo mode might trigger this)
  useEffect(() => {
    if (journey?.state === 'ANALYZED' && sheetState === 'COLLAPSED') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTimeout(() => setSheetState('HALF'), 100);
    }
  }, [journey?.state, sheetState]);

  // If no route, we just show a floating search at the top, not a bottom sheet
  if (!journey) return null;
  const showSetup = journey.state === 'IDLE' || journey.state === 'ANALYZING' || !journey.routes || journey.routes.length === 0;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartY.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartY.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = clientY - touchStartY.current;
    
    // threshold for swipe
    if (deltaY < -40) {
      // Swiped UP
      if (sheetState === 'COLLAPSED') setSheetState('HALF');
      else if (sheetState === 'HALF') setSheetState('EXPANDED');
    } else if (deltaY > 40) {
      // Swiped DOWN
      if (sheetState === 'EXPANDED') setSheetState('HALF');
      else if (sheetState === 'HALF') setSheetState('COLLAPSED');
    }
    
    touchStartY.current = null;
  };

  const handleHeaderClick = () => {
    if (sheetState === 'COLLAPSED') setSheetState('HALF');
    else if (sheetState === 'HALF') setSheetState('EXPANDED');
    else setSheetState('HALF');
  };

  if (showSetup) {
    return (
      <div className="md:hidden absolute top-4 left-4 right-4 z-40">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 pointer-events-auto">
          <JourneySetup onPlayDemo={onPlayDemo} />
        </div>
      </div>
    );
  }

  // Determine height classes based on state
  const heightClass = 
    sheetState === 'COLLAPSED' ? 'h-[120px]' : 
    sheetState === 'HALF' ? 'h-[50dvh]' : 
    'h-[90dvh]';

  return (
    <div 
      className={cn(
        "md:hidden absolute bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl transition-all duration-300 ease-in-out flex flex-col pointer-events-auto",
        heightClass
      )}
    >
      {/* Drag Handle Area */}
      <div 
        className="w-full pt-3 pb-2 flex justify-center items-center cursor-grab active:cursor-grabbing shrink-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onClick={handleHeaderClick}
      >
        <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 hide-scrollbar">
        <div className="flex flex-col gap-4">
          <IntelligenceContent />
        </div>
      </div>
    </div>
  );
}
