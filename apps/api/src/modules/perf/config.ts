/**
 * Speed settings in one place. Admin > Site and performance writes the "perf.*" settings; app.ts copies them here on each request
 * (the settings are cached in memory, so this is cheap) and the services read them synchronously.
 */
export interface PerfConfig {
  /** how often (seconds) the server looks for changed lesson / classroom / GK / audio files; 0 = every request (the old behaviour) */
  fileCheckSeconds: number;
  /** keep the curriculum graph in memory for this many seconds; 0 = off */
  curriculumCacheSeconds: number;
  /** build each classroom lesson when it is opened (from a saved index) instead of building all of them at once */
  classroomLazy: boolean;
  /** build all classroom boards only once and only re-build changed lessons */
  prewarm: boolean;
  /** browsers keep pictures and lesson images for this long (seconds); 0 = always re-check */
  staticCacheSeconds: number;
  /** send API answers and website text files compressed (gzip / brotli) */
  compress: boolean;
}
/** Used until the server has read the admin settings (and in tests): behaves exactly as before. The admin setting defaults are in perf-settings.ts. */
export const PERF_DEFAULTS: PerfConfig = { fileCheckSeconds: 0, curriculumCacheSeconds: 0, classroomLazy: false, prewarm: false, staticCacheSeconds: 0, compress: false };

let current: PerfConfig = { ...PERF_DEFAULTS };
export const perf = (): PerfConfig => current;
export function setPerf(values: Record<string, unknown>): void {
  const num = (k: string, d: number) => (typeof values[k] === "number" && Number.isFinite(values[k] as number) ? (values[k] as number) : d);
  const bool = (k: string, d: boolean) => (typeof values[k] === "boolean" ? (values[k] as boolean) : d);
  current = {
    fileCheckSeconds: num("perf.fileCheck.seconds", PERF_DEFAULTS.fileCheckSeconds),
    curriculumCacheSeconds: num("perf.curriculumCache.seconds", PERF_DEFAULTS.curriculumCacheSeconds),
    classroomLazy: bool("perf.classroom.lazy", PERF_DEFAULTS.classroomLazy),
    prewarm: bool("perf.prewarm", PERF_DEFAULTS.prewarm),
    staticCacheSeconds: num("perf.static.cacheSeconds", PERF_DEFAULTS.staticCacheSeconds),
    compress: bool("perf.compress.enabled", PERF_DEFAULTS.compress),
  };
}
