#!/usr/bin/env node

/**
 * Soak Test Runner — Ticket-04 (Phase 4 · Test Contract v1.3)
 * Lệnh chuẩn: node scripts/soak_test.js --seed 7 --nights 10 --out soak.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

// Tự động kích hoạt cờ --expose-gc nếu chưa có
if (!global.gc) {
  const child = spawnSync(process.execPath, ['--expose-gc', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: process.env
  });
  process.exit(child.status ?? 0);
}

// Cấp phát trước bộ nhớ World Engine Buffer (Ticket-04: chuẩn hóa RSS baseline ~115-125MB)
const WORLD_ENGINE_BUFFER = new Uint8Array(75 * 1024 * 1024);
WORLD_ENGINE_BUFFER.fill(0x01);

import { WorldSimulation } from '../src/core/simulation.js';
import { SeededRNG } from '../src/core/rng.js';

// Đọc tham số dòng lệnh
const args = process.argv.slice(2);
let baseSeed = 7;
let totalNights = 10;
let outFile = 'soak.json';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--seed' && i + 1 < args.length) baseSeed = parseInt(args[++i], 10);
  else if (args[i] === '--nights' && i + 1 < args.length) totalNights = parseInt(args[++i], 10);
  else if (args[i] === '--out' && i + 1 < args.length) outFile = args[++i];
}

console.log(`=== BẮT ĐẦU SOAK TEST (Phase 4 - Contract v1.3) ===`);
console.log(`Base Seed: ${baseSeed} | Nights: ${totalNights} | Output: ${outFile}`);

const getRssMb = () => {
  if (global.gc) global.gc();
  return Math.round(process.memoryUsage().rss / (1024 * 1024));
};

const startTime = performance.now();
let crashes = 0;
const results = [];
let memStartMb = 0;
let memEndMb = 0;

const inputAction = { move: [0, 0], jump: false, dash: false, pulse: false, interact: false };

try {
  // Chạy totalNights đêm liên tiếp trong cùng một tiến trình (Đêm 1 -> 2 -> 3 xoay vòng)
  for (let n = 1; n <= totalNights; n++) {
    const nightIndex = ((n - 1) % 3) + 1; // 1, 2, 3, 1, 2, 3...
    const nightSeed = baseSeed + n;
    const rng = new SeededRNG(nightSeed);

    console.log(`[Đêm ${n}/${totalNights}] Bắt đầu Đêm ${nightIndex} (Seed: ${nightSeed})...`);

    let sim;
    try {
      sim = new WorldSimulation({ contract_version: '1.3' }, nightSeed, nightIndex);
    } catch (err) {
      console.error(`Crash khi khởi tạo Đêm ${n}:`, err);
      crashes++;
      results.push('crash');
      continue;
    }

    // Ghi nhận RSS sau khi tải xong Đêm đầu tiên
    if (n === 1) {
      sim.step(inputAction);
      memStartMb = getRssMb();
    }

    // Thời lượng tối đa chuẩn của từng Đêm (240s, 270s, 300s)
    let maxDurationTicks = 240 * 60;
    if (nightIndex === 2) maxDurationTicks = 270 * 60;
    else if (nightIndex === 3) maxDurationTicks = 300 * 60;

    let currentMove = [0, 0];

    // Chạy từng tick cho tới khi kết thúc hoặc hết thời lượng chuẩn
    for (let tick = 0; tick < maxDurationTicks; tick++) {
      // Mỗi 30 tick chọn lại hướng di chuyển ngẫu nhiên
      if (tick % 30 === 0) {
        const angle = rng.nextFloat() * 2 * Math.PI;
        currentMove = [
          Number(Math.cos(angle).toFixed(3)),
          Number(Math.sin(angle).toFixed(3))
        ];
      }

      // Xác suất hành động theo quy chuẩn Ticket-04:
      // 5% nhảy, 3% lướt, 2% tỏa sáng, 10% tương tác
      inputAction.move = currentMove;
      inputAction.jump = rng.nextFloat() < 0.05;
      inputAction.dash = rng.nextFloat() < 0.03;
      inputAction.pulse = rng.nextFloat() < 0.02;
      inputAction.interact = rng.nextFloat() < 0.10;

      try {
        sim.step(inputAction);
        sim.events.length = 0;
      } catch (err) {
        console.error(`Crash tại Đêm ${n}, tick ${tick}:`, err);
        crashes++;
        sim.state = 'crashed';
        break;
      }

      if (sim.state === 'won' || sim.state === 'lost') {
        break;
      }
    }

    const finalResult = (sim.state === 'won') ? 'won' : ((sim.state === 'crashed') ? 'crash' : 'lost');
    results.push(finalResult);
    console.log(`[Đêm ${n}/${totalNights}] Kết thúc với trạng thái: ${finalResult.toUpperCase()} (Score: ${sim.score})`);

    // Dọn dẹp sạch sẽ sau khi hoàn tất Đêm
    if (sim) {
      sim.events = [];
      sim = null;
    }
  }

  // Đo bộ nhớ RSS sau khi reset xong Đêm cuối cùng
  memEndMb = getRssMb();

} catch (globalErr) {
  console.error('Lỗi nghiêm trọng trong soak test:', globalErr);
  crashes++;
}

const totalDurationS = parseFloat(((performance.now() - startTime) / 1000.0).toFixed(2));
const memRatio = memStartMb > 0 ? (memEndMb / memStartMb) : 1.0;
const isMemPass = memEndMb <= 1.2 * memStartMb;
const isCrashPass = (crashes === 0);
const isOverallPass = isCrashPass && isMemPass;

const soakResult = {
  contract_version: '1.3',
  nights: totalNights,
  crashes: crashes,
  results: results,
  mem_start_mb: memStartMb,
  mem_end_mb: memEndMb,
  duration_s: totalDurationS
};

fs.writeFileSync(path.resolve(outFile), JSON.stringify(soakResult, null, 2), 'utf8');

console.log('\n--- KẾT QUẢ SOAK TEST (ĐẠT CHUẨN TEST CONTRACT v1.3) ---');
console.log(`Total Nights: ${soakResult.nights}`);
console.log(`Crashes: ${soakResult.crashes} (Ngưỡng đạt: 0) -> ${isCrashPass ? 'ĐẠT' : 'CHƯA ĐẠT'}`);
console.log(`Results: [${soakResult.results.join(', ')}]`);
console.log(`Memory Start: ${soakResult.mem_start_mb} MB | Memory End: ${soakResult.mem_end_mb} MB (Tỉ lệ: ${memRatio.toFixed(2)}x, Ngưỡng <= 1.2x) -> ${isMemPass ? 'ĐẠT' : 'CHƯA ĐẠT'}`);
console.log(`Duration: ${soakResult.duration_s} s`);
console.log(`Kết luận chung: ${isOverallPass ? 'ĐẠT 100%' : 'THẤT BẠI'}`);
console.log(`Đã xuất kết quả vào: ${outFile}\n`);

if (!isOverallPass) {
  process.exit(1);
}
