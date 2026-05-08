export interface CognitiveConfig {
	streamScaleFactor: number;
	decayPerSecond: number;
	maxLoad: number;
	barSlots: number;
}

export const DEFAULT_COGNITIVE_CONFIG: CognitiveConfig = {
	streamScaleFactor: 0.05,
	decayPerSecond: 1,
	maxLoad: 100,
	barSlots: 10,
};
