// Human Cognitive Load — a pi.dev extension that visualizes cognitive saturation during AI usage.
//
// Instead of tracking time, it measures the volume of text streamed by the AI: the more tokens
// arrive on screen, the higher the load climbs. Load decays passively over time, reflecting
// natural recovery during pauses or breaks.
//
// Status bar: [████░░░░░░] 38% • 763ch • cat
//   Green  0–40%   — light usage
//   Yellow 41–70%  — moderate load
//   Red    71–100% — high saturation
//
// Four sensitivity presets:
//   fish   — barely registers, very fast recovery (light users)
//   cat    — balanced, default mode
//   bee    — higher sensitivity, slower decay (focused sessions)
//   bonobo — saturates fast, very slow recovery (maximum sensitivity)
//
// The /human-cognitive-load command is available in pi's command palette (tab to autocomplete).
// Commands: /human-cognitive-load [on|off|reset|status|fish|cat|bee|bonobo]

import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { PRESETS, DEFAULT_PRESET } from "./config";
import type { CognitivePreset } from "./config";
import { createInitialState, applyStreamDelta, applyDecay } from "./state";
import { setStatus, clearStatus, renderBar, formatChars } from "./render";
import { loadSettings, saveSettings } from "./settings";

export default function registerHumanCognitiveLoad(pi: ExtensionAPI): void {
	let state = createInitialState();
	let enabled = true;
	let preset: CognitivePreset = DEFAULT_PRESET;
	let interval: NodeJS.Timeout | undefined;
	let lastTickAt = Date.now();

	const config = () => PRESETS[preset];

	const notify = (ctx: ExtensionContext, message: string): void => {
		if (!ctx.hasUI) return;
		ctx.ui.notify(message, "info");
	};

	const statusMessage = (): string => {
		const bar = renderBar(state.load, config().barSlots);
		return `Human Cognitive Load: ${enabled ? "ON" : "OFF"} • ${bar} • ${formatChars(state.totalCharsReceived)}ch • ${preset}`;
	};

	const refreshStatus = (ctx: ExtensionContext): void => {
		if (enabled) {
			setStatus(ctx, state, config(), preset);
			return;
		}
		clearStatus(ctx);
	};

	const tick = (ctx: ExtensionContext): void => {
		const now = Date.now();
		const elapsedSeconds = (now - lastTickAt) / 1000;
		lastTickAt = now;
		if (!enabled || elapsedSeconds <= 0) return;
		state = applyDecay(state, elapsedSeconds, config());
		refreshStatus(ctx);
	};

	const PRESETS_KEYS = Object.keys(PRESETS) as CognitivePreset[];

	const handlers: Record<string, (ctx: ExtensionCommandContext) => void> = {
		on: (ctx) => {
			enabled = true;
			void saveSettings({ preset, enabled });
			lastTickAt = Date.now();
			refreshStatus(ctx);
			notify(ctx, statusMessage());
		},
		off: (ctx) => {
			enabled = false;
			void saveSettings({ preset, enabled });
			refreshStatus(ctx);
			notify(ctx, statusMessage());
		},
		reset: (ctx) => {
			state = createInitialState();
			lastTickAt = Date.now();
			refreshStatus(ctx);
			notify(ctx, statusMessage());
		},
		status: (ctx) => {
			tick(ctx);
			notify(ctx, statusMessage());
		},
		...Object.fromEntries(
			PRESETS_KEYS.map((name) => [
				name,
				(ctx: ExtensionCommandContext) => {
					preset = name;
					void saveSettings({ preset, enabled });
					refreshStatus(ctx);
					notify(ctx, statusMessage());
				},
			])
		),
	};

	pi.registerCommand("human-cognitive-load", {
		description: "Control Human Cognitive Load (on/off/reset/status/fish/cat/bee/bonobo)",
		getArgumentCompletions: (prefix: string) => {
			const actions = ["on", "off", "reset", "status", ...PRESETS_KEYS];
			return actions.filter((action) => action.startsWith(prefix)).map((value) => ({ value, label: value }));
		},
		handler: async (args, ctx) => {
			const action = (args ?? "status").trim().toLowerCase();
			const handler = handlers[action];
			if (handler) {
				handler(ctx);
				return;
			}
			notify(ctx, "Usage: /human-cognitive-load [on|off|reset|status|fish|cat|bee|bonobo]");
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		if (interval) {
			clearInterval(interval);
		}
		const saved = await loadSettings();
		state = createInitialState();
		enabled = saved.enabled;
		preset = saved.preset;
		lastTickAt = Date.now();
		refreshStatus(ctx);
		interval = setInterval(() => tick(ctx), 100);
		notify(ctx, `${statusMessage()}\n/human-cognitive-load [on|off|reset|status|fish|cat|bee|bonobo]`);
	});

	pi.on("message_update", async (event, ctx) => {
		if (!enabled) return;
		const { assistantMessageEvent } = event;
		if (assistantMessageEvent.type === "text_delta") {
			state = applyStreamDelta(state, assistantMessageEvent.delta.length, config());
			refreshStatus(ctx);
		}
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
		clearStatus(ctx);
	});
}
