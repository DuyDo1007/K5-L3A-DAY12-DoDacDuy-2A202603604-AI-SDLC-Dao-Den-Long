import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

/**
 * Đảm bảo thư mục data/ tồn tại
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Đọc danh sách Bảng xếp hạng từ file đĩa cục bộ
 * @returns {Array} Mảng các mục xếp hạng (tối đa 10)
 */
export function getLeaderboard() {
  ensureDataDir();
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    // Khởi tạo một số mục mẫu nếu chưa có dữ liệu
    const initial = [
      { name: "DoDacDuy", score: 850, nights_won: 3, achieved_at: "2026-11-20T10:00:00.000Z", seed: 42 },
      { name: "Naruto_Kun", score: 720, nights_won: 2, achieved_at: "2026-11-20T11:15:00.000Z", seed: 100 },
      { name: "HoiAn_Master", score: 640, nights_won: 2, achieved_at: "2026-11-20T12:30:00.000Z", seed: 888 },
      { name: "May_Runner", score: 510, nights_won: 1, achieved_at: "2026-11-20T13:45:00.000Z", seed: 777 },
      { name: "ShadowHunter", score: 380, nights_won: 1, achieved_at: "2026-11-20T14:20:00.000Z", seed: 123 }
    ];
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Lỗi khi đọc leaderboard.json:', err);
    return [];
  }
}

/**
 * Thêm một mục điểm mới vào Bảng xếp hạng
 * @param {Object} entry { name, score, nights_won, seed }
 * @returns {Object} { success: boolean, reason?: string, leaderboard: Array }
 */
export function addScore({ name, score, nights_won = 0, seed = 42 }) {
  ensureDataDir();

  // Kiểm tra tên hợp lệ: 3-12 ký tự [A-Za-z0-9_]
  const trimmed = (name || '').trim();
  const nameRegex = /^[A-Za-z0-9_]{3,12}$/;
  if (!nameRegex.test(trimmed)) {
    return {
      success: false,
      reason: 'Tên phải từ 3 đến 12 ký tự gồm chữ cái, số và dấu gạch dưới [A-Za-z0-9_].',
      leaderboard: getLeaderboard()
    };
  }

  const list = getLeaderboard();
  const newEntry = {
    name: trimmed,
    score: Math.max(0, parseInt(score, 10) || 0),
    nights_won: Math.max(0, Math.min(3, parseInt(nights_won, 10) || 0)),
    achieved_at: new Date().toISOString(),
    seed: parseInt(seed, 10) || 42
  };

  list.push(newEntry);

  // Sắp xếp theo score giảm dần; bằng điểm thì ai đạt trước đứng trên (stable sort dựa theo achieved_at)
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.achieved_at) - new Date(b.achieved_at);
  });

  // Chỉ giữ Top 10
  const top10 = list.slice(0, 10);
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(top10, null, 2), 'utf8');

  return {
    success: true,
    leaderboard: top10
  };
}

/**
 * Xuất Bảng xếp hạng ra file JSON đích theo cờ --export-leaderboard
 * Output format: { "entries": [ ... ] }
 * @param {string} targetPath 
 */
export function exportLeaderboard(targetPath) {
  const entries = getLeaderboard();
  const output = {
    contract_version: "1.3",
    entries
  };
  const resolved = path.resolve(targetPath);
  fs.writeFileSync(resolved, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Đã xuất Bảng xếp hạng thành công vào: ${resolved}`);
  return output;
}
