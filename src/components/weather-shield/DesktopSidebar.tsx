"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { cn } from '@/lib/utils';
import JourneySetup from './JourneySetup';
import IntelligenceContent from './IntelligenceContent';

export default function DesktopSidebar({ onPlayDemo }: { onPlayDemo: () => void }) {
  const { journey } = useJourney();

  if (!journey) return null;

  const showSetup = journey.state === 'IDLE' || journey.state === 'ANALYZING' || !journey.routes || journey.routes.length === 0;

  return (
    <aside className="hidden md:flex absolute top-4 left-4 w-[380px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl flex-col shadow-2xl z-40 pointer-events-auto"
           style={{
             height: 'calc(100dvh - var(--header-height, 72px) - 32px)', // 32px = top 16px + bottom 16px
             minHeight: 0
           }}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar rounded-2xl">
        <div className="p-4 flex flex-col gap-4">
          {showSetup ? (
            <JourneySetup onPlayDemo={onPlayDemo} />
          ) : (
            <IntelligenceContent />
          )}
        </div>
      </div>
    </aside>
  );
}
