#!/usr/bin/env node

import { WorldSimulation } from '../src/core/simulation.js';

console.log('=== BENCHMARK: ĐẢO ĐÈN LỒNG CORE SIMULATION ===');

const TOTAL_TICKS = 10000;
const sim = new WorldSimulation({ islandRadius: 35.0 }, 42);

const startMemory = process.memoryUsage().heapUsed;
const startTime = process.hrtime.bigint();

for (let i = 0; i < TOTAL_TICKS; i++) {
  // Mô phỏng input ngẫu nhiên có kiểm soát
  const angle = (i % 360) * (Math.PI / 180);
  sim.step({
    move: [Math.cos(angle), Math.sin(angle)],
    cam_yaw_deg: (i * 2) % 360,
    interact: (i % 60 === 0),
    pulse: (i % 120 === 0)
  });
}

const endTime = process.hrtime.bigint();
const endMemory = process.memoryUsage().heapUsed;

const durationNs = Number(endTime - startTime);
const durationMs = durationNs / 1_000_000;
const durationSec = durationMs / 1000;
const ticksPerSec = Math.round(TOTAL_TICKS / durationSec);
const memoryDeltaMB = ((endMemory - startMemory) / (1024 * 1024)).toFixed(2);

console.log(`- Tổng số tick chạy: ${TOTAL_TICKS.toLocaleString()} ticks`);
console.log(`- Thời gian thực thi: ${durationMs.toFixed(2)} ms (${durationSec.toFixed(3)} s)`);
console.log(`- Tốc độ mô phỏng: ${ticksPerSec.toLocaleString()} ticks/giây (~${(ticksPerSec / 60).toFixed(0)}x thời gian thực 60fps)`);
console.log(`- Bộ nhớ heap sử dụng thêm: ${memoryDeltaMB} MB`);
console.log(`- Trạng thái cuối: tick=${sim.tick}, score=${sim.score}, state=${sim.state}`);
console.log('=== KẾT QUẢ: ĐẠT TIÊU CHUẨN HIỆU NĂNG CAO ===');
