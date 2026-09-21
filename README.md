# Gemini Weather Shield

A dynamic, intelligent navigation interface built with Next.js that integrates Google Maps Routes, live weather data, and Gemini AI. It provides proactive, context-aware route recommendations, analyzing trade-offs between speed, road quality, and weather exposure.

## Features

- **Intelligent Routing**: Computes multiple routes using Google Maps Routes API.
- **Smart Recommendations**: Uses Gemini AI to analyze routes and recommend the best option, considering distance, average speed (inferring road quality), and expected weather.
- **Live Weather Layers**: Integrates Tomorrow.io weather data, calculating per-kilometer weather conditions and exposure along the route.
- **Journey Twin Timeline**: Visualizes the journey schedule with weather forecasts at key waypoints.
- **Dynamic UI**: Responsive side panel and map overlay for route comparison, turn-by-turn navigation, and voice-first alerts.

## Getting Started

### Prerequisites
- Node.js 18+
- API Keys for Google Maps, Google Gemini, and Tomorrow.io

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd geminiweather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GEMINI_API_KEY=your_gemini_api_key
   TOMORROW_API_KEY=your_tomorrow_io_api_key
   NEXT_PUBLIC_APP_MODE=live
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technologies Used

- **Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps**: Google Maps Platform (`@vis.gl/react-google-maps`)
- **Weather**: Tomorrow.io API
- **AI/LLM**: Google Gemini (`@google/genai`)

## Project Structure

- `src/components/weather-shield/`: Main UI components (AppShell, JourneyTwin, MapWorkspace, etc.)
- `src/app/api/journey/`: API routes for analyzing journeys and requesting Gemini recommendations.
- `src/services/`: Integrations for routing, weather, and AI providers.
- `src/state/`: React context for managing the journey state.
- `src/domain/`: TypeScript types and domain models.
