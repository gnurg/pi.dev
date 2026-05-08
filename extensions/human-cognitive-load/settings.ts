import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { DEFAULT_PRESET } from "./config";
import type { CognitivePreset } from "./config";

const SETTINGS_DIR = join(homedir(), ".pi", "agent");
const SETTINGS_PATH = join(SETTINGS_DIR, "human-cognitive-load.json");

export interface PersistedSettings {
	preset: CognitivePreset;
	enabled: boolean;
}

export async function loadSettings(): Promise<PersistedSettings> {
	try {
		const raw = await readFile(SETTINGS_PATH, "utf8");
		return { preset: DEFAULT_PRESET, enabled: true, ...JSON.parse(raw) };
	} catch {
		return { preset: DEFAULT_PRESET, enabled: true };
	}
}

export async function saveSettings(settings: PersistedSettings): Promise<void> {
	try {
		await mkdir(SETTINGS_DIR, { recursive: true });
		await writeFile(SETTINGS_PATH, JSON.stringify(settings), "utf8");
	} catch {
		// ignore write errors silently
	}
}
