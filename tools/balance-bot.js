(opts) => {
  // Adapter so the same bot can drive v0.3.0 (globals) and v0.4.0 (window.__aa).
  const NEW = !!window.__aa;
  const K = NEW ? __aa.KINDS : kinds.map((d, i) => ({ ...d, predator: i >= 2 }));
  const api = NEW ? {
    start: () => __aa.start(), p: () => __aa.p, fish: () => __aa.fish, st: () => __aa.state,
    aim: (x, y) => __aa.setAim(x, y), boost: b => __aa.setBoost(b), step: () => __aa.step(1), choose: i => __aa.choose(i),
  } : {
    start: () => start(), p: () => p, fish: () => fish, st: () => ({ active, evolving, offers: offers.map(m => m.id) }),
    aim: (x, y) => { aim = { x, y }; }, boost: b => { boosting = b; }, step: () => { phase += 1/60; update(1/60); },
    choose: i => chooseMutation(offers[i].id),
  };
  const out = [];
  for (let run = 0; run < opts.runs; run++) {
    api.start();
    let steps = 0, cause = 'timeout', stageAt = {}, hits = 0, lastHp = 100, decide = 0, cur = { x: 1, y: 0, b: false }, menus = 0;
    while (steps < opts.minutes * 3600) {
      const st = api.st();
      if (st.evolving) { menus++; if ([5,15,30].includes(menus)) stageAt['menu'+menus] = +(steps/3600).toFixed(1); api.choose(Math.floor(Math.random() * st.offers.length)); continue; }
      if (!st.active) { cause = document.getElementById('desc').textContent; break; }
      const p = api.p();
      if (--decide <= 0) {
        decide = 14 + Math.floor(Math.random() * 10); // ~0.3 s reaction time
        const sight = NEW && p.y > 1300 ? (190 + p.r * 2.4) * (1 + .35 * (p.mods.biolum || 0)) : 470;
        let ax = 0, ay = 0, best = 0, tgt = null, danger = 0;
        for (const f of api.fish()) {
          const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy); if (d > sight) continue;
          const k = K[f.k], jaw = 1 + .12 * (p.mods.jaw || 0);
          const edible = f.r <= p.r * .83 * jaw && (!k.minEat || p.r >= k.minEat || p.mods.jellyproof);
          const threat = k.hazard ? !edible && !p.mods.jellyproof : k.predator && f.r > p.r * 1.04;
          if (threat && d < 260) { const w = (1 - d / 260) * (k.hazard ? 1 : 2); ax -= dx / d * w * 2; ay -= dy / d * w * 2; danger = Math.max(danger, 1 - d / 260); }
          else if (edible) { const s = k.v / (d + 80) * (0.7 + Math.random() * .6); if (s > best) { best = s; tgt = f; } }
        }
        const wantY = NEW ? [450, 1450, 2450][p.r < 40 ? 0 : p.r < 62 ? 1 : 2] : 700;
        if (tgt) { const d = Math.hypot(tgt.x - p.x, tgt.y - p.y); ax += (tgt.x - p.x) / d; ay += (tgt.y - p.y) / d; }
        else { ax += Math.cos(run + steps / 900); ay += Math.max(-1, Math.min(1, (wantY - p.y) / 300)); }
        const W2 = 4600, H2 = NEW ? 2965 : 1665; // keep away from walls/surface/seabed like a person would
        if (p.y < 160) ay += (160 - p.y) / 60; if (p.y > H2 - 200) ay -= (p.y - (H2 - 200)) / 60;
        if (p.x < 200) ax += (200 - p.x) / 70; if (p.x > W2 - 200) ax -= (p.x - (W2 - 200)) / 70;
        if (NEW && !tgt && p.y > wantY + 500) ay -= 1.5;
        const l = Math.hypot(ax, ay) || 1, n = .25;
        cur = { x: ax / l + (Math.random() - .5) * n, y: ay / l + (Math.random() - .5) * n, b: danger > .5 && p.food > 25 };
      }
      api.aim(cur.x, cur.y); api.boost(cur.b); api.step(); steps++;
      const q = api.p(); if (q.hp < lastHp - 3) hits++; lastHp = q.hp;
      for (const [n, r] of [['hunter', 32], ['apex', 48], ['leviathan', 68], ['titan', 100], ['max', 114]]) if (!stageAt[n] && q.r >= r) stageAt[n] = +(steps / 3600).toFixed(1);
    }
    const p = api.p();
    out.push({ deathY: Math.round(p.y), min: +(steps / 3600).toFixed(1), score: p.score, level: p.level, size: +(p.r / 23).toFixed(2), hits, menus, stageAt, cause: cause.slice(0, 34) });
  }
  return out;
}
