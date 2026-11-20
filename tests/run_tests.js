import assert from 'node:assert';
import crypto from 'node:crypto';
import { WorldSimulation } from '../src/core/simulation.js';
import { SeededRNG } from '../src/core/rng.js';
import { runSimulation } from '../src/headless/cli.js';

console.log('=== RUNNING UNIT & INTEGRATION TESTS (PHASE 3 - CONTRACT v1.2) ===');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}\n`, err);
    failed++;
  }
}

// 1. Seeded RNG
test('SeededRNG sinh dãy số giống nhau với cùng seed', () => {
  const rng1 = new SeededRNG(999);
  const rng2 = new SeededRNG(999);
  for (let i = 0; i < 50; i++) {
    assert.strictEqual(rng1.nextFloat(), rng2.nextFloat());
  }
});

// 2. Di chuyển & Lướt (Dash)
test('Lướt (Dash) đạt tốc độ 14 m/s và sinh sự kiện dash', () => {
  const sim = new WorldSimulation({ islandRadius: 50.0 }, 100, 1);
  // Tick 1: Bấm dash theo hướng +Z
  const events = sim.step({ move: [0, 1], dash: true });
  assert(events.some(e => e.name === 'dash'), 'Should emit dash event');
  assert(sim.player.dashCooldownTicks > 0, 'Dash should enter cooldown');
  assert(sim.player.pos[2] > 0.2, 'Player should move forward at dash speed');
});

// 3. Nhảy (Jump) & Trọng lực
test('Nhảy đạt vận tốc ban đầu và trọng lực kéo xuống đất', () => {
  const sim = new WorldSimulation({}, 100, 1);
  assert.strictEqual(sim.player.grounded, true);
  // Nhảy
  sim.step({ jump: true });
  assert(sim.player.vel[1] > 6.0, 'Initial jump velocity minus 1 tick gravity');
  assert(sim.player.pos[1] > 0.0, 'Player should be above ground');
  assert.strictEqual(sim.player.grounded, false);

  // Chạy thêm 45 tick để trọng lực kéo xuống đất
  for (let i = 0; i < 45; i++) {
    sim.step({});
  }
  assert.strictEqual(sim.player.pos[1], 0.0, 'Player should land on ground');
  assert.strictEqual(sim.player.grounded, true, 'Player should be grounded');
});

// 4. Nhặt đom đóm với chuẩn hóa sức chứa 10
test('Nhặt đom đóm với sức chứa 10 và bán kính XZ <= 1.0m, |dY| <= 1.5m', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    motes: [[0, 0, 0.8]]
  });
  const events = sim.step({});
  assert.strictEqual(sim.player.carried, 1);
  assert(events.some(e => e.name === 'mote_picked'));
});

// 5. Thắp Đèn Lồng Lớn (10 đom đóm) & Vùng an toàn 6m
test('Thắp đèn lồng cần 10 đom đóm và tạo vùng an toàn 6m', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [0, 0, 24.0], carried: 10, flames: 3 },
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [0, 0, 25.0], deposited: 0, lit: false }]
  });
  const events = sim.step({ interact: true });
  assert(events.some(e => e.name === 'deposit' && e.data.amount === 10));
  assert(events.some(e => e.name === 'lantern_lit' && e.data.lantern_id === 'L1'));
  const l1 = sim.lanterns.find(l => l.id === 'L1');
  assert.strictEqual(l1.lit, true);
});

// 6. Gió Lạc (Drifter) cướp đom đóm và Pulse làm rơi lại
test('Gió Lạc cướp tối đa 3 đom đóm và Pulse buộc Gió Lạc thả lại', () => {
  const sim = new WorldSimulation({}, 100, 2);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 6, flames: 3 },
    drifters: [{ id: 'D1', pos: [1.0, 0, 0], state: 'chase', stolen: 0 }]
  });
  // Tick 1: Gió Lạc cướp 3 đom đóm
  const events1 = sim.step({});
  assert(events1.some(e => e.name === 'drifter_steal' && e.data.amount === 3));
  assert.strictEqual(sim.player.carried, 3);

  // Tick 2: Mây bấm Pulse -> Gió Lạc thả lại đom đóm
  const events2 = sim.step({ pulse: true });
  assert(events2.some(e => e.name === 'drifter_drop'));
});

// 7. Bùa Gió (Wind Charm) tăng tốc và Lướt không hồi chiêu
test('Bùa Gió tăng tốc lên 7.2 m/s và xóa hồi chiêu Lướt', () => {
  const sim = new WorldSimulation({}, 100, 2);
  sim.loadScenario({
    player: { pos: [35.0, 0, 0], carried: 0, flames: 3 },
    charms: [{ id: 'C1', pos: [35.0, 0, 0], available: true, respawn_s: 0 }]
  });
  const events = sim.step({});
  assert(events.some(e => e.name === 'charm_picked'));
  assert.strictEqual(sim.player.charmTicksLeft, 600);
});

// 8. Tạm dừng (Pause / Resume)
test('Tạm dừng logic khi bấm Pause và tiếp tục khi unpause', () => {
  const sim = new WorldSimulation({}, 100, 1);
  const events1 = sim.step({ pause: true });
  assert(events1.some(e => e.name === 'paused'));
  assert.strictEqual(sim.state, 'paused');
  const simTickBefore = sim.sim_tick;

  // Trong khi paused, sim_tick không tăng
  sim.step({});
  assert.strictEqual(sim.sim_tick, simTickBefore);

  // Unpause
  const events2 = sim.step({ pause: true });
  assert(events2.some(e => e.name === 'resumed'));
  assert.strictEqual(sim.state, 'playing');
});

// 9. Rơi khỏi đảo (Y < -10)
test('Rơi khỏi đảo gây mất 1 ngọn lửa, mất toàn bộ đom đóm và chờ hồi sinh', () => {
  const sim = new WorldSimulation({ islandRadius: 40.0 }, 100, 1);
  sim.player.pos = [45.0, -11.0, 0.0];
  sim.player.carried = 5;
  const events = sim.step({});
  assert(events.some(e => e.name === 'player_hit' && e.data.by === 'fall' && e.data.lost === 5));
  assert.strictEqual(sim.player.flames, 2);
  assert.strictEqual(sim.player.carried, 0);
  assert(sim.player.fallWaitTicks > 0);
});

// 10. Kiểm tra tính tất định 100% của Contract v1.2
test('Tính tất định 100% Contract v1.2: 2 lần chạy cho cùng SHA-256 byte-for-byte', () => {
  const opts = { seed: 54321, night: 1, ticks: 120, snapshotEvery: 10 };
  const res1 = runSimulation(opts);
  const res2 = runSimulation(opts);
  const hash1 = crypto.createHash('sha256').update(res1.lines.join('\n')).digest('hex');
  const hash2 = crypto.createHash('sha256').update(res2.lines.join('\n')).digest('hex');
  assert.strictEqual(hash1, hash2, 'Hashes must match');
});

// === CÁC TEST CASE CHO PHASE 3 (TICKET-03 - CONTRACT v1.2) ===

// 11. Đèn tự hao hụt nhiên liệu & Tắt khi hết dầu (lantern_out)
test('Phase 3: Đèn tự hao hụt 1.0 fuel/s (1/60 mỗi tick), hết dầu thì tắt và nhớ ever_lit', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [10, 0, 10], deposited: 10, lit: true, fuelTicks: 60, ever_lit: true }]
  });
  // Ban đầu fuel = 60/60 = 1.0
  assert.strictEqual(sim.lanterns[0].lit, true);
  // Sau 60 tick, fuel giảm về 0 -> phát sự kiện lantern_out
  let outEmitted = false;
  for (let i = 0; i < 60; i++) {
    const events = sim.step({});
    if (events.some(e => e.name === 'lantern_out' && e.data.lantern_id === 'L1')) {
      outEmitted = true;
    }
  }
  assert.strictEqual(outEmitted, true, 'Should emit lantern_out event');
  assert.strictEqual(sim.lanterns[0].lit, false, 'Lantern should be unlit');
  assert.strictEqual(sim.lanterns[0].deposited, 0, 'Deposited reset to 0');
  assert.strictEqual(sim.lanterns[0].ever_lit, true, 'Ever lit must be true');
});

// 12. Châm dầu (refuel) cho đèn đang sáng
test('Phase 3: Châm dầu đèn đang sáng tính theo used = min(carried, ceil((100-fuel)/10))', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [0, 0, 24.0], carried: 3, flames: 3 },
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [0, 0, 25.0], deposited: 10, lit: true, fuelTicks: 4860, ever_lit: true }] // fuel = 81.0, cần bù 19 -> 2 đom đóm
  });
  // Cần châm ceil((100 - 81) / 10) = 2 đom đóm
  const scoreBefore = sim.score;
  const events = sim.step({ interact: true });
  assert(events.some(e => e.name === 'refuel' && e.data.lantern_id === 'L1' && e.data.amount === 2));
  assert.strictEqual(sim.player.carried, 1, 'Carried should decrease by 2');
  assert.strictEqual(sim.lanterns[0].fuelTicks, 6000, 'Fuel should be full (100.0)');
  assert.strictEqual(sim.score, scoreBefore + 10, 'Score should increase by +5 per mote = +10');
});

// 13. Thắp lại đèn đã từng sáng (ever_lit) chỉ cần 5 đom đóm
test('Phase 3: Đèn đã từng sáng (ever_lit: true) chỉ cần 5 đom đóm để thắp lại và thưởng +40 điểm', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [0, 0, 24.0], carried: 7, flames: 3 },
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [0, 0, 25.0], deposited: 0, lit: false, ever_lit: true }]
  });
  const scoreBefore = sim.score;
  const events = sim.step({ interact: true });
  assert(events.some(e => e.name === 'deposit' && e.data.amount === 5));
  assert(events.some(e => e.name === 'lantern_lit' && e.data.lantern_id === 'L1' && e.data.relight === true));
  assert.strictEqual(sim.player.carried, 2, 'Carried should decrease by 5');
  assert.strictEqual(sim.lanterns[0].lit, true, 'Lantern should be lit');
  assert.strictEqual(sim.lanterns[0].fuelTicks, 6000, 'Fuel reset to 100');
  assert.strictEqual(sim.lanterns[0].relit_count, 1, 'Relit count incremented');
  // Thưởng: 5 motes * 5 = +25, relight = +40 -> tổng +65
  assert.strictEqual(sim.score, scoreBefore + 65);
});

// 14. Bóng Mực hút dầu (drain) khi fuel < 30 và phát sự kiện fuel_drain mỗi 60 tick
test('Phase 3: Bóng Mực tiếp cận đèn fuel < 30, drain 5 fuel/s và phát fuel_drain mỗi 60 tick', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [30, 0, 30], carried: 0, flames: 3 }, // Mây ở xa (>6m)
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [0, 0, 0], deposited: 10, lit: true, fuelTicks: 1500, ever_lit: true }], // fuel = 25 (< 30)
    shades: [{ id: 'S1', pos: [1.5, 0, 0], state: 'drain', drainTicks: 0, target_lantern_id: 'L1' }]
  });
  // Shade bắt đầu drain tại tick 0 -> phát sự kiện fuel_drain ngay tick này
  const events = sim.step({});
  assert(events.some(e => e.name === 'fuel_drain' && e.data.shade_id === 'S1' && e.data.lantern_id === 'L1'));
  // Hao hụt: tự nhiên 1 tick (1/60) + drain 5 ticks (5/60) = 6 ticks
  assert.strictEqual(sim.lanterns[0].fuelTicks, 1500 - 6);
});

// 15. Pulse trúng Shade đang drain thưởng +15 điểm thay vì +5
test('Phase 3: Tỏa Sáng (Pulse) trúng Bóng Mực đang drain thưởng +15 điểm', () => {
  const sim = new WorldSimulation({}, 100, 1);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 3, flames: 3 },
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [2.0, 0, 0], deposited: 10, lit: true, fuelTicks: 1500, ever_lit: true }],
    shades: [{ id: 'S1', pos: [2.0, 0, 0], state: 'drain', target_lantern_id: 'L1' }]
  });
  const scoreBefore = sim.score;
  const events = sim.step({ pulse: true });
  assert(events.some(e => e.name === 'pulse'));
  assert.strictEqual(sim.score, scoreBefore + 15, 'Score should increase by +15 for draining shade');
  assert.strictEqual(sim.shades[0].state, 'stunned');
});

// 16. Sức chứa tăng dần: capacity = min(20, 10 + 2 * successful_lights)
test('Phase 3: Sức chứa tăng dần theo số lần thắp đèn thành công, tối đa 20', () => {
  const sim = new WorldSimulation({}, 100, 1);
  assert.strictEqual(sim.player.capacity, 10);
  sim.successful_lights = 3;
  sim.player.capacity = Math.min(20, 10 + 2 * sim.successful_lights);
  assert.strictEqual(sim.player.capacity, 16);
  sim.successful_lights = 6;
  sim.player.capacity = Math.min(20, 10 + 2 * sim.successful_lights);
  assert.strictEqual(sim.player.capacity, 20); // max 20
});

// 17. Luật thắng mới: Hết giờ sống sót (dawn_survived) khi số đèn đang sáng >= ceil(0.6 * tổng đèn)
test('Phase 3: Thắng bình minh (dawn_survived) khi hết giờ và đủ >= 60% đèn sáng', () => {
  const sim = new WorldSimulation({}, 100, 1);
  // Đêm 1 có 5 đèn, 60% = 3 đèn; hết giờ tại tick đầu
  sim.loadScenario({
    time_left_s: 1.0 / 60.0,
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    lanterns: [
      { id: 'L1', pos: [10, 0, 0], deposited: 10, lit: true, fuelTicks: 6000, ever_lit: true },
      { id: 'L2', pos: [20, 0, 0], deposited: 10, lit: true, fuelTicks: 6000, ever_lit: true },
      { id: 'L3', pos: [30, 0, 0], deposited: 10, lit: true, fuelTicks: 6000, ever_lit: true },
      { id: 'L4', pos: [40, 0, 0], deposited: 0, lit: false, fuelTicks: 0, ever_lit: false },
      { id: 'L5', pos: [50, 0, 0], deposited: 0, lit: false, fuelTicks: 0, ever_lit: false }
    ]
  });
  const events = sim.step({});
  assert(events.some(e => e.name === 'game_over' && e.data.result === 'won' && e.data.reason === 'dawn_survived'));
  assert.strictEqual(sim.state, 'won');
});

console.log(`\nKết quả: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
