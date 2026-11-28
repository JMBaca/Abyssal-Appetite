# Abyssal Appetite

A Hungry Shark–style ocean survival prototype in a single HTML file: no build step, no downloads, no external assets. Art is drawn on a canvas and sound is synthesized in the browser.

Start as a 1 m juvenile, eat what's smaller than you, avoid what's bigger, and grow until yesterday's predators become today's prey. The deeper you dive, the bigger the meals and the darker the water.

**Play:** open `index.html` in any modern browser (desktop or phone).

## Controls

| | Touch | Keyboard / mouse |
|---|---|---|
| Swim | Drag anywhere (analog stick from where you touch) | WASD or arrow keys, or drag with the mouse |
| Boost | Hold **BOOST** with a second finger | Hold Space (burns hunger fast) |
| Pick a mutation | Tap a card | 1 / 2 / 3 |
| Pause | ❚❚ button | P or Esc |
| Sound | ♪ button | M |
| Start / dive again | Tap the button | Enter |

Green markers mean you can eat it. Red markers mean it can hurt you. A red **!** means a predator has just spotted you and is about to charge. Red arrows on the screen edge point at threats closing in from off-screen.

## The ocean

| Zone | Depth | Score | What lives there |
|---|---|---|---|
| Sunlit Shallows | 0–500 m | ×1 | Sardines, reef fish, tuna, a few barracuda and jellyfish |
| Twilight Zone | 500–1000 m | ×1.5 | Tuna, barracuda, sharks, orcas, lots of jellyfish, lanternfish |
| Midnight Abyss | 1000 m+ | ×2 | Lanternfish, anglerfish, sharks, and giant squid |

Below about 550 m the light fades and you can only see around yourself; bioluminescent creatures glow through the dark. Jellyfish sting (damage and slow) until you're Apex-sized or take the Jellyproof Hide mutation. Giant squid scale with you, so the abyss always has something bigger than you.

Size stages: Juvenile → Hunter → Apex → Leviathan → Abyssal Titan.

## What's new in 0.4.0

- **Depth zones.** Taller ocean with three zones, depth score multipliers, darkness with a player light radius, glowing creatures, marine snow, and a seabed.
- **New creatures.** Jellyfish (stinging hazard), lanternfish, anglerfish (glowing lure, lunges from the dark), and the giant squid apex predator.
- **Pacing fix.** In 0.3.0 a decent player reached maximum size in about 1.5 minutes and nothing could hurt them afterwards. Growth now tapers as you get bigger, hunger scales with body size, and the XP curve is steeper, so the full arc takes roughly 8–12 minutes and mutations spread across the dive (numbers from the balance bot, below).
- **Predators telegraph.** A short "!" pause before they charge, so deaths feel fair.
- **Game feel.** Bite and eat particles, screen shake, a boost bubble trail, a hurt flash, shockwave rings, synthesized sound effects with an ambient underwater rumble, and a halo so you can spot your shark in a crowd.
- **Quality of life.** Pause (with auto-pause when you switch tabs), mute, off-screen threat arrows, a visible touch joystick, keyboard mutation picks, a persistent best score, a richer end screen (depth, time, biggest catch, cause of death), and a guard against accidentally tapping a mutation card while steering.
- **New mutations.** Bioluminescence (wider light in the deep) and Jellyproof Hide. They only appear once they're relevant.
- **Tech.** Readable, sectioned source; a sharp canvas on high-DPI phones (drops to 1× automatically if frames get slow); cached gradients and glow sprites; safe-area insets for notched phones.

## Files

- `index.html`: the current build (same as the newest `play-vXXX.html`)
- `play-v023.html`, `play-v030.html`, `play-v040.html`: archived standalone builds
- `tools/`: headless balance checker (see below)

## Tuning and testing

Pacing knobs live in the `TUNE` object near the top of the script (growth per meal, growth falloff, hunger per size, squid scaling, XP curve). Spawn mix per zone is the `w` array on each entry in `KINDS`.

Add `?debug` to the URL for an FPS / fish-count overlay and a `window.__aa` test hook (`start()`, `step(n)`, `setAim(x, y)`, `spawn(kind, x, y)`, `choose(i)`).

`tools/balance.py` plays the game headlessly with a simple human-like bot and reports survival time and when each size stage was reached:

```bash
pip install playwright && playwright install chromium
python tools/balance.py                      # 6 dives x 12 min on index.html
python tools/balance.py play-v030.html 4 8   # compare against an older build
```
