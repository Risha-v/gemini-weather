"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Journey, JourneyState } from '../domain/journey.types';
import { demoJourney } from '../data/demoJourney';

type Action =
  | { type: 'SET_JOURNEY'; payload: Journey }
  | { type: 'SET_STATE'; payload: JourneyState }
  | { type: 'SELECT_ROUTE'; payload: string }
  | { type: 'ADVANCE_TIME'; payload: number } // minutes
  | { type: 'TRIGGER_EMERGENCY'; payload: { stopId: string, reason: string } }
  | { type: 'UPDATE_SETUP'; payload: Partial<Journey> }
  | { type: 'RESET_DEMO' };

interface JourneyContextType {
  journey: Journey | null;
  dispatch: React.Dispatch<Action>;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

function journeyReducer(state: Journey | null, action: Action): Journey | null {
  if (!state && action.type !== 'SET_JOURNEY' && action.type !== 'RESET_DEMO') return state;

  switch (action.type) {
    case 'SET_JOURNEY':
      return action.payload;
    case 'UPDATE_SETUP':
      return { ...state!, ...action.payload };
    case 'SET_STATE':
      return { ...state!, state: action.payload };
    case 'SELECT_ROUTE':
      return { ...state!, selectedRouteId: action.payload };
    case 'ADVANCE_TIME':
      return {
        ...state!,
        departureTime: state!.departureTime + action.payload * 60000,
      };
    case 'TRIGGER_EMERGENCY':
      return {
        ...state!,
        state: 'EMERGENCY_MODE',
        incidents: [
          ...state!.incidents,
          {
            type: 'EMERGENCY',
            message: action.payload.reason,
            recommendedStopId: action.payload.stopId
          }
        ]
      };
    case 'RESET_DEMO':
      return { ...demoJourney };
    default:
      return state;
  }
}

const isLive = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_MODE !== 'demo';

const initialJourney: Journey = isLive ? {
  ...demoJourney,
  journeyId: 'live-' + Date.now(),
  origin: { name: '', lat: 0, lng: 0, source: 'manual', status: 'empty', inputText: '' },
  destination: { name: '', lat: 0, lng: 0, source: 'manual', status: 'empty', inputText: '' },
  routes: [],
  selectedRouteId: null,
  journeyTwin: [],
  recommendation: null,
  incidents: [],
  safeStops: [],
  state: 'IDLE',
  sourceMode: process.env.NEXT_PUBLIC_APP_MODE as any || 'live'
} : {
  ...demoJourney,
  state: 'IDLE',
};

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journey, dispatch] = useReducer(journeyReducer, initialJourney);

  return (
    <JourneyContext.Provider value={{ journey, dispatch }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
