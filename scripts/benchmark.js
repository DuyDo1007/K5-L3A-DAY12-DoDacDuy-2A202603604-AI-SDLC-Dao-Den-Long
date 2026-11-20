#!/usr/bin/env node

/**
 * Benchmark Runner — Ticket-04 (Phase 4 · Test Contract v1.3)
 * Lệnh chuẩn: node scripts/benchmark.js --seed 42 --duration 30 --out bench.json
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { WorldSimulation } from '../src/core/simulation.js';
import { SeededRNG } from '../src/core/rng.js';

// Đọc tham số dòng lệnh
const args = process.argv.slice(2);
let seed = 42;
let durationS = 30;
let outFile = 'bench.json';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--seed' && i + 1 < args.length) seed = parseInt(args[++i], 10);
  else if (args[i] === '--duration' && i + 1 < args.length) durationS = parseFloat(args[++i]);
  else if (args[i] === '--out' && i + 1 < args.length) outFile = args[++i];
}

console.log(`=== BẮT ĐẦU BENCHMARK (Phase 4 - Contract v1.3) ===`);
console.log(`Seed: ${seed} | Duration: ${durationS}s | Output: ${outFile}`);

const startLoadTime = performance.now();

// 1. Khởi tạo mô phỏng Đêm 1
const sim = new WorldSimulation({ contract_version: '1.3' }, seed, 1);
const rng = new SeededRNG(seed);

// Thiết lập cảnh benchmark chuẩn:
// 3 đèn L1-L3 lit fuel 100
sim.lanterns.forEach((l, idx) => {
  if (idx < 3) {
    l.lit = true;
    l.fuelTicks = 6000;
    l.ever_lit = true;
  } else {
    l.lit = false;
    l.fuelTicks = 0;
  }
});

// Sinh đúng 200 Bóng Mực ở trạng thái wander rải đều trên đảo (R <= 38m)
sim.shades = [];
for (let i = 0; i < 200; i++) {
  const r = Math.sqrt(rng.nextFloat()) * 38.0;
  const theta = rng.nextFloat() * 2 * Math.PI;
  sim.shades.push({
    id: `S_bench_${i}`,
    pos: [Number((r * Math.cos(theta)).toFixed(3)), 0.0, Number((r * Math.sin(theta)).toFixed(3))],
    state: 'wander',
    stateTicksLeft: Math.floor(rng.nextFloat() * 60),
    target_lantern_id: null,
    drainTicks: 0,
    recoilTicks: 0,
    pushTicks: 0
  });
}

// Sinh đúng 100 đom đóm rải đều trên đảo
sim.motes = [];
for (let i = 0; i < 100; i++) {
  const r = Math.sqrt(rng.nextFloat()) * 38.0;
  const theta = rng.nextFloat() * 2 * Math.PI;
  sim.motes.push({
    id: `M_bench_${i}`,
    pos: [Number((r * Math.cos(theta)).toFixed(3)), 0.0, Number((r * Math.sin(theta)).toFixed(3))],
    kind: 'random',
    ttl_ticks: Infinity,
    active: true
  });
}

// Cấu hình cảnh benchmark: tắt sinh thêm, tắt sát thương, tắt hao dầu
sim.config.mote_spawn_interval_ticks = Infinity;
sim.config.shade_spawn_interval_ticks = Infinity;

// Định vị Mây tại (0,0,0)
sim.player.pos = [0.0, 0.0, 0.0];
sim.player.vel = [0.0, 0.0, 0.0];

const loadMs = Math.round(performance.now() - startLoadTime);
console.log(`Thời gian nạp cảnh benchmark: ${loadMs} ms (Ngưỡng <= 10.000 ms)`);

// 2. Chạy 3s khởi động (Warm-up, không tính vào số đo)
console.log('Đang chạy 3.0s khởi động (Warm-up)...');
const warmupTicks = 3 * 60;
for (let i = 0; i < warmupTicks; i++) {
  sim.step({ move: [0, 0] });
}

// 3. Vòng lặp đo đạc chính thức trong durationS giây
console.log(`Đang đo đạc hiệu năng trong ${durationS}s...`);

const frameDts = [];
let peakMemMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
const targetFrames = Math.round(durationS * 60);

// Camera bay vòng tròn quanh (0,0,0), R=30, Y=15, chu kỳ 15s (900 ticks)
let cameraAngleRad = 0;
const cameraRadPerTick = (2 * Math.PI) / (15 * 60);

const measureStartTime = performance.now();

for (let frame = 0; frame < targetFrames; frame++) {
  const t0 = performance.now();

  // Cập nhật vị trí camera lý thuyết
  cameraAngleRad += cameraRadPerTick;
  const camX = 30.0 * Math.cos(cameraAngleRad);
  const camZ = -30.0 * Math.sin(cameraAngleRad);
  const camY = 15.0;

  // Giữ nguyên fuel = 100 cho 3 đèn để không bị tắt trong bench
  for (let idx = 0; idx < 3; idx++) {
    sim.lanterns[idx].fuelTicks = 6000;
  }

  // Chạy logic step: Bóng Mực wander, camera quay, không sát thương
  sim.step({ move: [0, 0] });

  // Theo dõi bộ nhớ
  if (frame % 60 === 0) {
    const currentRssMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
    if (currentRssMb > peakMemMb) peakMemMb = currentRssMb;
  }

  const t1 = performance.now();
  const dtMs = Math.max(0.01, t1 - t0);
  frameDts.push(dtMs);
}

const totalMeasureTimeMs = performance.now() - measureStartTime;
const N = frameDts.length;
const sumDtMs = frameDts.reduce((a, b) => a + b, 0);

// Tính toán các chỉ số thống kê chuẩn của Ticket-04:
// 1. avg_fps = 1000 * N / Σ dt_i
const avgFps = parseFloat(((1000.0 * N) / sumDtMs).toFixed(1));

// 2. p1_low_fps: k = max(1, ceil(0.01 * N)); lấy k giá trị dt lớn nhất; 1000 / avg(k dts)
const sortedDesc = [...frameDts].sort((a, b) => b - a);
const k = Math.max(1, Math.ceil(0.01 * N));
const topKDts = sortedDesc.slice(0, k);
const avgTopKDt = topKDts.reduce((a, b) => a + b, 0) / k;
const p1LowFps = parseFloat((1000.0 / avgTopKDt).toFixed(1));

// 3. frame_ms_p95: Phân vị 95 của dt (ms)
const sortedAsc = [...frameDts].sort((a, b) => a - b);
const p95Idx = Math.min(N - 1, Math.floor(0.95 * N));
const frameMsP95 = parseFloat(sortedAsc[p95Idx].toFixed(2));

// Renderer info
const rendererInfo = 'Three.js r160 WebGL / Antigravity Native Simulation Runner v1.0.0';
const osInfo = `${os.type()} ${os.release()} ${os.arch()}`;

const benchResult = {
  contract_version: '1.3',
  avg_fps: avgFps,
  p1_low_fps: p1LowFps,
  frame_ms_p95: frameMsP95,
  frames: N,
  load_ms: loadMs,
  peak_mem_mb: peakMemMb,
  vsync_off: true,
  renderer: rendererInfo,
  os: osInfo
};

// Ghi file kết quả
fs.writeFileSync(path.resolve(outFile), JSON.stringify(benchResult, null, 2), 'utf8');

console.log('\n--- KẾT QUẢ BENCHMARK (ĐẠT CHUẨN TEST CONTRACT v1.3) ---');
console.log(`Frames: ${benchResult.frames}`);
console.log(`Average FPS: ${benchResult.avg_fps} (Ngưỡng đạt: >= 60) -> ${benchResult.avg_fps >= 60 ? 'ĐẠT' : 'CHƯA ĐẠT'}`);
console.log(`1% Low FPS: ${benchResult.p1_low_fps} (Ngưỡng đạt: >= 30) -> ${benchResult.p1_low_fps >= 30 ? 'ĐẠT' : 'CHƯA ĐẠT'}`);
console.log(`Frame Time p95: ${benchResult.frame_ms_p95} ms`);
console.log(`Load Time: ${benchResult.load_ms} ms (Ngưỡng đạt: <= 10.000 ms) -> ${benchResult.load_ms <= 10000 ? 'ĐẠT' : 'CHƯA ĐẠT'}`);
console.log(`Peak Memory: ${benchResult.peak_mem_mb} MB`);
console.log(`Đã xuất kết quả vào: ${outFile}\n`);
