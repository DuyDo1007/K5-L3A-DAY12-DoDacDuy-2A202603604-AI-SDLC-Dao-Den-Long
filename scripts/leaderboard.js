#!/usr/bin/env node

/**
 * Leaderboard CLI Tool (Ticket-04 · Test Contract v1.3)
 * Lệnh: node scripts/leaderboard.js --export out.json
 */

import { getLeaderboard, exportLeaderboard, addScore } from '../src/core/leaderboard.js';

const args = process.argv.slice(2);
let exportPath = null;

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--export' || args[i] === '--export-leaderboard') && i + 1 < args.length) {
    exportPath = args[++i];
  }
}

if (exportPath) {
  exportLeaderboard(exportPath);
} else {
  console.log('=== BẢNG XẾP HẠNG CỤC BỘ (TOP 10) ===');
  const list = getLeaderboard();
  console.table(list);
  console.log('\nLệnh xuất: node scripts/leaderboard.js --export <path.json>');
}
