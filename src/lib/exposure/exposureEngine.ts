import { Route, WeatherSegment, ExposureSummary } from '@/domain/journey.types';

export function calculateRouteExposure(segments: WeatherSegment[], totalJourneyMinutes: number): ExposureSummary {
  let rainMinutes = 0;
  let heavyRainMinutes = 0;
  let lowVisibilityMinutes = 0;
  let strongWindMinutes = 0;
  let heatMinutes = 0;
  let severeAlertMinutes = 0;

  const majorWindows: string[] = [];
  let earliestEvent: string | undefined;

  for (const seg of segments) {
    const durationMinutes = (seg.segmentEndTime - seg.segmentStartTime) / 60000;
    if (durationMinutes <= 0) continue;

    const isRain = seg.condition === 'LIGHT_RAIN' || seg.condition === 'MODERATE_RAIN' || seg.condition === 'HEAVY_RAIN' || seg.condition === 'STORM';
    const isHeavyRain = seg.condition === 'HEAVY_RAIN' || seg.condition === 'STORM';
    const isLowVis = seg.condition === 'FOG' || seg.visibilityKm < 3;
    const isStrongWind = seg.windKph > 35;
    const isHeat = seg.condition === 'HOT' || seg.temperatureC > 38;

    if (isRain) rainMinutes += durationMinutes;
    if (isHeavyRain) heavyRainMinutes += durationMinutes;
    if (isLowVis) lowVisibilityMinutes += durationMinutes;
    if (isStrongWind) strongWindMinutes += durationMinutes;
    if (isHeat) heatMinutes += durationMinutes;
    if (seg.alertSeverity === 'SEVERE' || seg.alertSeverity === 'EXTREME') {
      severeAlertMinutes += durationMinutes;
    }

    if (isHeavyRain) {
      if (!earliestEvent) earliestEvent = `Heavy rain expected at minute ${Math.round((seg.segmentStartTime - segments[0].segmentStartTime)/60000)}`;
      majorWindows.push(`Heavy rain expected between min ${Math.round((seg.segmentStartTime - segments[0].segmentStartTime)/60000)} and ${Math.round((seg.segmentEndTime - segments[0].segmentStartTime)/60000)}`);
    }
  }

  // Deduplicate windows
  const uniqueWindows = Array.from(new Set(majorWindows));

  const combinedExposureScore = (heavyRainMinutes * 3) + (rainMinutes * 1) + (lowVisibilityMinutes * 2) + (severeAlertMinutes * 5);

  return {
    totalJourneyMinutes: Math.round(totalJourneyMinutes),
    expectedRainExposureMinutes: Math.round(rainMinutes),
    expectedHeavyRainExposureMinutes: Math.round(heavyRainMinutes),
    expectedLowVisibilityMinutes: Math.round(lowVisibilityMinutes),
    expectedStrongWindExposureMinutes: Math.round(strongWindMinutes),
    expectedHeatExposureMinutes: Math.round(heatMinutes),
    severeAlertExposureMinutes: Math.round(severeAlertMinutes),
    combinedExposureScore: Math.round(combinedExposureScore),
    majorExposureWindows: uniqueWindows,
    earliestMeaningfulWeatherEvent: earliestEvent
  };
}
