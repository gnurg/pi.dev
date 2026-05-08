import type { CognitiveConfig } from "./config";

export interface CognitiveState {
	load: number;
	totalCharsReceived: number;
}

export function createInitialState(): CognitiveState {
	return { load: 0, totalCharsReceived: 0 };
}

function clampLoad(load: number, maxLoad: number): number {
	if (load < 0) return 0;
	if (load > maxLoad) return maxLoad;
	return load;
}

export function applyStreamDelta(state: CognitiveState, deltaLength: number, config: CognitiveConfig): CognitiveState {
	const increase = deltaLength * config.streamScaleFactor;
	return {
		load: clampLoad(state.load + increase, config.maxLoad),
		totalCharsReceived: state.totalCharsReceived + deltaLength,
	};
}

export function applyDecay(state: CognitiveState, elapsedSeconds: number, config: CognitiveConfig): CognitiveState {
	if (elapsedSeconds <= 0) return state;
	return { ...state, load: clampLoad(state.load - elapsedSeconds * config.decayPerSecond, config.maxLoad) };
}
