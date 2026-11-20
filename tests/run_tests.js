import assert from 'node:assert';
import crypto from 'node:crypto';
import { WorldSimulation } from '../src/core/simulation.js';
import { SeededRNG } from '../src/core/rng.js';
import { runSimulation } from '../src/headless/cli.js';

console.log('--- RUNNING UNIT & INTEGRATION TESTS ---');

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

// 1. Kiểm tra tính tất định của SeededRNG
test('SeededRNG sinh dãy số giống nhau với cùng seed', () => {
  const rng1 = new SeededRNG(999);
  const rng2 = new SeededRNG(999);
  for (let i = 0; i < 50; i++) {
    assert.strictEqual(rng1.nextFloat(), rng2.nextFloat());
  }
});

// 2. Kiểm tra Mây di chuyển chuẩn góc nhìn
test('Player di chuyển đúng theo cam_yaw_deg', () => {
  const sim = new WorldSimulation({ islandRadius: 50.0 }, 100);
  // Di chuyển thẳng +Z khi cam_yaw_deg = 0
  sim.step({ move: [0, 1], cam_yaw_deg: 0 });
  assert(sim.player.pos[2] > 0, 'Player should move forward along +Z');
  assert.strictEqual(sim.player.pos[0], 0, 'Player X should remain 0');

  // Di chuyển thẳng +X khi cam_yaw_deg = 90
  const sim2 = new WorldSimulation({ islandRadius: 50.0 }, 100);
  sim2.step({ move: [0, 1], cam_yaw_deg: 90 });
  assert(sim2.player.pos[0] > 0, 'Player X should move forward along +X with yaw 90');
});

// 3. Kiểm tra nhặt đom đóm
test('Player nhặt đom đóm trong pickup_radius', () => {
  const sim = new WorldSimulation({}, 100);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    motes: [[0, 0, 1.0]]
  });
  const events = sim.step({ move: [0, 1], cam_yaw_deg: 0 });
  assert.strictEqual(sim.player.carried, 1);
  assert(events.some(e => e.name === 'mote_picked'));
});

// 4. Kiểm tra nạp ánh sáng vào đèn
test('Player nạp đom đóm vào Đèn Lồng Lớn khi interact', () => {
  const sim = new WorldSimulation({}, 100);
  sim.loadScenario({
    player: { pos: [0, 0, 1.5], carried: 3, flames: 3 },
    random_motes: false,
    lanterns: [{ id: 'L1', pos: [0, 0, 2.0], deposited: 0, lit: false }]
  });
  const events = sim.step({ interact: true });
  assert(events.some(e => e.name === 'deposit'));
  assert(events.some(e => e.name === 'lantern_lit'));
  assert.strictEqual(sim.lanterns.find(l => l.id === 'L1').lit, true);
});

// 5. Kiểm tra Pulse làm choáng và đẩy lùi Bóng Mực
test('Pulse tiêu tốn đom đóm và làm choáng Bóng Mực', () => {
  const sim = new WorldSimulation({}, 100);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 2, flames: 3 },
    random_shades: false,
    shades: [{ id: 'S1', pos: [2.0, 0, 0], state: 'chase' }]
  });
  const events = sim.step({ pulse: true });
  assert(events.some(e => e.name === 'pulse'));
  const shade = sim.shades.find(s => s.id === 'S1');
  assert.strictEqual(shade.state, 'stunned');
  assert(shade.pos[0] > 2.0, 'Shade should be pushed away');
  assert.strictEqual(sim.player.carried, 1, 'Pulse costs 1 mote');
});

// 6. Kiểm tra Bóng Mực tấn công làm mất máu và rơi đom đóm
test('Bóng Mực chạm Mây làm mất 1 flame và rơi đom đóm', () => {
  const sim = new WorldSimulation({}, 100);
  sim.loadScenario({
    player: { pos: [0, 0, 0], carried: 2, flames: 3 },
    random_shades: false,
    shades: [{ id: 'S1', pos: [0.5, 0, 0], state: 'chase' }]
  });
  const events = sim.step({});
  assert(events.some(e => e.name === 'player_hit'));
  assert.strictEqual(sim.player.flames, 2);
  assert.strictEqual(sim.player.carried, 1);
});

// 7. Kiểm tra tính tất định 100% của kịch bản Headless (Determinism Test)
test('Tính tất định 100%: 2 lần chạy độc lập cho cùng chuỗi JSONL byte-for-byte', () => {
  const opts1 = {
    seed: 12345,
    night: 1,
    scenario: 'tests/scenarios/s1_scenario.json',
    inputs: 'tests/scenarios/s1_inputs.json',
    ticks: 60,
    snapshotEvery: 10
  };
  const res1 = runSimulation(opts1);
  const out1 = res1.lines.join('\n');

  const opts2 = {
    seed: 12345,
    night: 1,
    scenario: 'tests/scenarios/s1_scenario.json',
    inputs: 'tests/scenarios/s1_inputs.json',
    ticks: 60,
    snapshotEvery: 10
  };
  const res2 = runSimulation(opts2);
  const out2 = res2.lines.join('\n');

  const hash1 = crypto.createHash('sha256').update(out1).digest('hex');
  const hash2 = crypto.createHash('sha256').update(out2).digest('hex');

  assert.strictEqual(hash1, hash2, 'SHA-256 hashes must be identical');
  assert.strictEqual(out1, out2, 'Outputs must be character-for-character identical');
});

console.log(`\nKết quả: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
