#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { WorldSimulation } from '../core/simulation.js';

function parseArgs(args) {
  const options = {
    seed: 42,
    night: 1,
    scenario: null,
    inputs: null,
    ticks: 100,
    out: null,
    snapshotEvery: 10
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--seed' && i + 1 < args.length) {
      options.seed = parseInt(args[++i], 10);
    } else if (arg === '--night' && i + 1 < args.length) {
      options.night = parseInt(args[++i], 10);
    } else if (arg === '--scenario' && i + 1 < args.length) {
      options.scenario = args[++i];
    } else if (arg === '--inputs' && i + 1 < args.length) {
      options.inputs = args[++i];
    } else if (arg === '--ticks' && i + 1 < args.length) {
      options.ticks = parseInt(args[++i], 10);
    } else if (arg === '--out' && i + 1 < args.length) {
      options.out = args[++i];
    } else if (arg === '--snapshot-every' && i + 1 < args.length) {
      options.snapshotEvery = parseInt(args[++i], 10);
    }
  }

  return options;
}

export function runSimulation(options) {
  let scenarioData = {};
  if (options.scenario) {
    try {
      scenarioData = JSON.parse(fs.readFileSync(options.scenario, 'utf8'));
    } catch (err) {
      console.error(`Error reading scenario file ${options.scenario}:`, err.message);
      process.exit(2);
    }
  }

  let frames = [];
  if (options.inputs) {
    try {
      const inputsData = JSON.parse(fs.readFileSync(options.inputs, 'utf8'));
      if (Array.isArray(inputsData.frames)) {
        frames = inputsData.frames;
      }
    } catch (err) {
      console.error(`Error reading inputs file ${options.inputs}:`, err.message);
      process.exit(2);
    }
  }

  const frameMap = new Map();
  for (const f of frames) {
    if (f.tick !== undefined) {
      frameMap.set(f.tick, f);
    }
  }

  const night = options.night || 1;
  const sim = new WorldSimulation({}, options.seed, night);
  if (options.scenario) {
    sim.loadScenario(scenarioData);
  }

  const jsonlLines = [];

  // Snapshot tick 0 là trạng thái sau khi dựng scenario, trước khi áp dụng input
  const snapshot0 = sim.getSnapshot();
  jsonlLines.push(JSON.stringify(snapshot0));

  // Trạng thái input duy trì qua các frame (sparse frames)
  let currentInput = {
    move: [0, 0],
    cam_yaw_deg: 0,
    jump: false,
    interact: false,
    pulse: false,
    dash: false,
    pause: false
  };

  const maxTicks = options.ticks;
  for (let k = 0; k < maxTicks; k++) {
    // Đọc input tại tick k nếu có cập nhật
    if (frameMap.has(k)) {
      const update = frameMap.get(k);
      if (update.move !== undefined) currentInput.move = update.move;
      if (update.cam_yaw_deg !== undefined) currentInput.cam_yaw_deg = update.cam_yaw_deg;
      if (update.jump !== undefined) currentInput.jump = update.jump;
      if (update.interact !== undefined) currentInput.interact = update.interact;
      if (update.pulse !== undefined) currentInput.pulse = update.pulse;
      if (update.dash !== undefined) currentInput.dash = update.dash;
      if (update.pause !== undefined) currentInput.pause = update.pause;
    }

    // Chạy 1 bước (k -> k+1)
    const events = sim.step(currentInput);

    // Ghi sự kiện xảy ra trong bước đó
    for (const ev of events) {
      jsonlLines.push(JSON.stringify(ev));
    }

    // Ghi snapshot định kỳ
    if (sim.tick % options.snapshotEvery === 0) {
      jsonlLines.push(JSON.stringify(sim.getSnapshot()));
    }

    // Nếu game kết thúc (thắng hoặc thua), dừng sớm
    if (sim.state === 'won' || sim.state === 'lost') {
      break;
    }
  }

  // Dòng cuối cùng: End
  const endObj = {
    type: 'end',
    ticks: sim.tick,
    state: sim.state,
    score: sim.score
  };
  jsonlLines.push(JSON.stringify(endObj));

  const jsonlContent = jsonlLines.join('\n') + '\n';

  if (options.out) {
    const dir = path.dirname(options.out);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.out, jsonlContent, 'utf8');
  }

  return { lines: jsonlLines, end: endObj };
}

// Chạy trực tiếp từ CLI
if (process.argv[1] && (process.argv[1].endsWith('cli.js') || process.argv[1].endsWith('cli.mjs'))) {
  const options = parseArgs(process.argv.slice(2));
  const result = runSimulation(options);
  if (!options.out) {
    console.log(result.lines.join('\n'));
  }
}
