# pi extensions

A collection of extensions for [pi.dev](https://pi.dev).

## Install

```bash
pi install git:github.com/gnurg/pi.dev
```

Or try without installing:

```bash
pi -e git:github.com/gnurg/pi.dev
```

---

## Extensions

### human-cognitive-load

Visualizes cognitive saturation during AI usage directly in the status bar.

Instead of tracking time, it measures the volume of text streamed by the AI — the more tokens arrive on screen, the higher the load climbs. Load decays passively over time, reflecting natural recovery during pauses or breaks.

```
[████░░░░░░] 38% • 763ch • bee
```

| Color | Range | Meaning |
|---|---|---|
| Green | 0–40% | Light usage |
| Yellow | 41–70% | Moderate load |
| Red | 71–100% | High saturation |

#### Commands

```
/human-cognitive-load on      — enable
/human-cognitive-load off     — disable
/human-cognitive-load reset   — reset load to 0
/human-cognitive-load status  — show current state
```

#### Presets

Switch sensitivity at any time — the choice is saved across sessions.

```
/human-cognitive-load fish    — lowest sensitivity, fastest recovery
/human-cognitive-load cat     — balanced
/human-cognitive-load bee     — higher sensitivity, slower decay (default)
/human-cognitive-load bonobo  — maximum sensitivity, very slow recovery
```
