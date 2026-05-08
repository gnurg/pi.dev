import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { CognitiveConfig, CognitivePreset } from "./config";
import type { CognitiveState } from "./state";

const STATUS_KEY = "human-cognitive-load";

export function getStatusColor(load: number): "success" | "warning" | "error" {
	if (load <= 40) return "success";
	if (load <= 70) return "warning";
	return "error";
}

export function formatChars(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return `${n}`;
}

export function renderBar(load: number, slots: number): string {
	const normalized = Math.max(0, Math.min(100, load));
	const filledSlots = Math.round((normalized / 100) * slots);
	const filled = "█".repeat(filledSlots);
	const empty = "░".repeat(slots - filledSlots);
	return `[${filled}${empty}] ${Math.round(normalized)}%`;
}

export function setStatus(ctx: ExtensionContext, state: CognitiveState, config: CognitiveConfig, preset: CognitivePreset): void {
	if (!ctx.hasUI) return;
	const bar = renderBar(state.load, config.barSlots);
	const color = getStatusColor(state.load);
	ctx.ui.setStatus(STATUS_KEY, ctx.ui.theme.fg(color, `${bar} • ${formatChars(state.totalCharsReceived)}ch • ${preset}`));
}

export function clearStatus(ctx: ExtensionContext): void {
	if (!ctx.hasUI) return;
	ctx.ui.setStatus(STATUS_KEY, undefined);
}
