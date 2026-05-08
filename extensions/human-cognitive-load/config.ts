export interface CognitiveConfig {
	streamScaleFactor: number;
	decayPerSecond: number;
	maxLoad: number;
	barSlots: number;
}

export type CognitivePreset = "fish" | "cat" | "bee" | "bonobo";

export const PRESETS: Record<CognitivePreset, CognitiveConfig> = {
	fish:   { streamScaleFactor: 0.20, decayPerSecond: 0.3, maxLoad: 100, barSlots: 10 },
	cat:    { streamScaleFactor: 0.10, decayPerSecond: 1,   maxLoad: 100, barSlots: 10 },
	bee:    { streamScaleFactor: 0.05, decayPerSecond: 2,   maxLoad: 100, barSlots: 10 },
	bonobo: { streamScaleFactor: 0.02, decayPerSecond: 4,   maxLoad: 100, barSlots: 10 },
};

export const DEFAULT_PRESET: CognitivePreset = "bee";
