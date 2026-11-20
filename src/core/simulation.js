import { SeededRNG } from './rng.js';
import { DEFAULT_CONFIG } from './config.js';

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

export class WorldSimulation {
  constructor(config = {}, seed = 42) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.seed = seed;
    this.rng = new SeededRNG(seed);
    this.tick = 0;
    this.sim_tick = 0;
    this.state = 'playing'; // 'playing' | 'won' | 'lost'
    this.score = 0;
    this.initial_duration_s = this.config.night1_duration_s;
    this.time_left_s = this.config.night1_duration_s;

    // Player Mây
    this.player = {
      pos: [0.0, 0.0, 0.0],
      flames: this.config.flames,
      carried: 0,
      invulnTicks: 0,
      pulseCooldownTicks: 0
    };

    // 5 Đèn Lồng Lớn cho Night 1 (L1 .. L5)
    this.lanterns = [];
    const numLanterns = this.config.lantern_count_night1;
    for (let i = 0; i < numLanterns; i++) {
      const angle = (i * 2 * Math.PI) / numLanterns;
      const dist = 22.0;
      const lx = round3(Math.cos(angle) * dist);
      const lz = round3(Math.sin(angle) * dist);
      this.lanterns.push({
        id: `L${i + 1}`,
        pos: [lx, 0.0, lz],
        lit: false,
        deposited: 0
      });
    }

    // Đom đóm (Motes)
    this.motes = [];
    for (let i = 0; i < 25; i++) {
      const angle = this.rng.nextFloat() * 2 * Math.PI;
      const dist = 3.0 + this.rng.nextFloat() * (this.config.islandRadius - 6.0);
      const mx = round3(Math.cos(angle) * dist);
      const mz = round3(Math.sin(angle) * dist);
      this.motes.push({
        id: `M${i + 1}`,
        pos: [mx, 0.0, mz],
        active: true
      });
    }

    // Bóng Mực (Shades)
    this.shades = [];
    const initialShadeCount = 3;
    for (let i = 0; i < initialShadeCount; i++) {
      const angle = (i + 0.5) * (2 * Math.PI / initialShadeCount);
      const dist = 26.0;
      const sx = round3(Math.cos(angle) * dist);
      const sz = round3(Math.sin(angle) * dist);
      this.shades.push({
        id: `S${i + 1}`,
        pos: [sx, 0.0, sz],
        state: 'chase',
        stunnedTicks: 0
      });
    }

    this.prevButtons = {
      interact: false,
      pulse: false,
      jump: false,
      dash: false
    };

    this.events = [];
  }

  loadScenario(scenario = {}) {
    if (scenario.time_left_s !== undefined) {
      this.initial_duration_s = scenario.time_left_s;
      this.time_left_s = scenario.time_left_s;
    }

    if (scenario.player) {
      if (scenario.player.pos) {
        this.player.pos = [
          round3(scenario.player.pos[0]),
          round3(scenario.player.pos[1] || 0.0),
          round3(scenario.player.pos[2])
        ];
      }
      if (scenario.player.carried !== undefined) this.player.carried = scenario.player.carried;
      if (scenario.player.flames !== undefined) this.player.flames = scenario.player.flames;
    }

    if (scenario.lanterns && Array.isArray(scenario.lanterns)) {
      for (const sl of scenario.lanterns) {
        const existing = this.lanterns.find(l => l.id === sl.id);
        if (existing) {
          if (sl.pos) existing.pos = [round3(sl.pos[0]), round3(sl.pos[1] || 0.0), round3(sl.pos[2])];
          if (sl.deposited !== undefined) existing.deposited = sl.deposited;
          if (sl.lit !== undefined) existing.lit = sl.lit;
        } else {
          this.lanterns.push({
            id: sl.id,
            pos: [round3(sl.pos[0]), round3(sl.pos[1] || 0.0), round3(sl.pos[2])],
            lit: !!sl.lit,
            deposited: sl.deposited || 0
          });
        }
      }
    }

    if (scenario.random_motes === false) {
      this.motes = [];
      if (scenario.motes && Array.isArray(scenario.motes)) {
        scenario.motes.forEach((m, idx) => {
          const pos = Array.isArray(m) ? m : m.pos;
          const id = (m && m.id) ? m.id : `M${idx + 1}`;
          this.motes.push({
            id,
            pos: [round3(pos[0]), round3(pos[1] || 0.0), round3(pos[2])],
            active: true
          });
        });
      }
    }

    if (scenario.random_shades === false) {
      this.shades = [];
      if (scenario.shades && Array.isArray(scenario.shades)) {
        scenario.shades.forEach((s, idx) => {
          const id = s.id || `S${idx + 1}`;
          this.shades.push({
            id,
            pos: [round3(s.pos[0]), round3(s.pos[1] || 0.0), round3(s.pos[2])],
            state: s.state || 'chase',
            stunnedTicks: 0
          });
        });
      }
    }
  }

  getSnapshot() {
    return {
      type: 'snapshot',
      tick: this.tick,
      sim_tick: this.sim_tick,
      state: this.state,
      time_left_s: Number(this.time_left_s.toFixed(1)),
      score: this.score,
      player: {
        pos: [round3(this.player.pos[0]), round3(this.player.pos[1]), round3(this.player.pos[2])],
        flames: this.player.flames,
        carried: this.player.carried
      },
      lanterns: this.lanterns.map(l => ({
        id: l.id,
        pos: [round3(l.pos[0]), round3(l.pos[1]), round3(l.pos[2])],
        lit: l.lit,
        deposited: l.deposited
      })),
      shades: this.shades.map(s => ({
        id: s.id,
        pos: [round3(s.pos[0]), round3(s.pos[1]), round3(s.pos[2])],
        state: s.state
      })),
      motes_active: this.motes.filter(m => m.active).length
    };
  }

  step(input = {}) {
    this.tick++;
    if (this.state !== 'playing') {
      return [];
    }

    this.sim_tick++;
    const stepEvents = [];
    const eventTick = this.tick;
    const dt = 1.0 / this.config.tickRate;

    const totalDuration = this.initial_duration_s !== undefined ? this.initial_duration_s : this.config.night1_duration_s;
    this.time_left_s = Math.max(0.0, totalDuration - (this.sim_tick / this.config.tickRate));

    // 1. Xử lý di chuyển Player Mây
    const move = input.move || [0, 0];
    const camYawDeg = input.cam_yaw_deg || 0;
    const thetaRad = (camYawDeg * Math.PI) / 180.0;

    let mx = move[0] || 0;
    let mz = move[1] || 0;

    // Giới hạn [-1, 1]
    mx = Math.max(-1.0, Math.min(1.0, mx));
    mz = Math.max(-1.0, Math.min(1.0, mz));

    // Chuyển hướng theo cam_yaw_deg:
    // x' = x·cosθ + z·sinθ, z' = −x·sinθ + z·cosθ
    let worldX = mx * Math.cos(thetaRad) + mz * Math.sin(thetaRad);
    let worldZ = -mx * Math.sin(thetaRad) + mz * Math.cos(thetaRad);

    const moveMag = Math.hypot(worldX, worldZ);
    if (moveMag > 1.0) {
      worldX /= moveMag;
      worldZ /= moveMag;
    }

    if (moveMag > 0.0001) {
      const stepDist = this.config.player_speed * dt;
      let newPx = this.player.pos[0] + worldX * stepDist;
      let newPz = this.player.pos[2] + worldZ * stepDist;

      // Giới hạn bán kính đảo nếu fall_enabled = false
      const distCenter = Math.hypot(newPx, newPz);
      if (!this.config.fall_enabled && distCenter > this.config.islandRadius) {
        newPx = (newPx / distCenter) * this.config.islandRadius;
        newPz = (newPz / distCenter) * this.config.islandRadius;
      }
      this.player.pos[0] = round3(newPx);
      this.player.pos[2] = round3(newPz);
    }

    // 2. Xử lý Pulse (Tỏa sáng)
    const pulseTriggered = !!input.pulse && !this.prevButtons.pulse;
    if (pulseTriggered && this.player.pulseCooldownTicks <= 0 && this.player.carried >= this.config.pulse_cost) {
      this.player.carried -= this.config.pulse_cost;
      this.player.pulseCooldownTicks = Math.round(this.config.pulse_cooldown_s * this.config.tickRate);

      const stunnedIds = [];
      for (const s of this.shades) {
        const d = Math.hypot(s.pos[0] - this.player.pos[0], s.pos[2] - this.player.pos[2]);
        if (d <= this.config.pulse_radius) {
          s.state = 'stunned';
          s.stunnedTicks = Math.round(this.config.pulse_stun_s * this.config.tickRate);

          // Đẩy lùi Bóng Mực ra xa
          if (d > 0.001) {
            const pushX = ((s.pos[0] - this.player.pos[0]) / d) * this.config.pulse_push_m;
            const pushZ = ((s.pos[2] - this.player.pos[2]) / d) * this.config.pulse_push_m;
            s.pos[0] = round3(s.pos[0] + pushX);
            s.pos[2] = round3(s.pos[2] + pushZ);
          }
          stunnedIds.push(s.id);
        }
      }

      this.score += stunnedIds.length * this.config.score.per_stun;
      stepEvents.push({
        type: 'event',
        tick: eventTick,
        name: 'pulse',
        data: { stunned_ids: stunnedIds }
      });
    }

    // 3. Thu thập đom đóm (Motes)
    for (const m of this.motes) {
      if (m.active && this.player.carried < this.config.carry_capacity) {
        const d = Math.hypot(m.pos[0] - this.player.pos[0], m.pos[2] - this.player.pos[2]);
        if (d <= this.config.pickup_radius) {
          m.active = false;
          this.player.carried++;
          this.score += this.config.score.per_mote;
          stepEvents.push({
            type: 'event',
            tick: eventTick,
            name: 'mote_picked',
            data: { carried: this.player.carried }
          });
        }
      }
    }

    // 4. Tương tác nạp ánh sáng vào Đèn Lồng (Interact)
    const interactTriggered = !!input.interact && !this.prevButtons.interact;
    if (interactTriggered && this.player.carried > 0) {
      for (const l of this.lanterns) {
        if (!l.lit) {
          const d = Math.hypot(l.pos[0] - this.player.pos[0], l.pos[2] - this.player.pos[2]);
          if (d <= this.config.interact_radius) {
            const needed = this.config.lantern_cost - l.deposited;
            const depositAmount = Math.min(needed, this.player.carried);
            if (depositAmount > 0) {
              this.player.carried -= depositAmount;
              l.deposited += depositAmount;
              stepEvents.push({
                type: 'event',
                tick: eventTick,
                name: 'deposit',
                data: {
                  lantern_id: l.id,
                  amount: depositAmount,
                  deposited: l.deposited
                }
              });

              if (l.deposited >= this.config.lantern_cost) {
                l.lit = true;
                this.score += this.config.score.per_lantern;
                stepEvents.push({
                  type: 'event',
                  tick: eventTick,
                  name: 'lantern_lit',
                  data: { lantern_id: l.id }
                });

                // Kiểm tra thắng màn
                if (this.lanterns.every(lantern => lantern.lit)) {
                  this.state = 'won';
                  const timeBonus = Math.floor(this.time_left_s) * this.config.score.per_second_left;
                  const flameBonus = this.player.flames * this.config.score.per_flame_left;
                  this.score += timeBonus + flameBonus;
                  stepEvents.push({
                    type: 'event',
                    tick: eventTick,
                    name: 'game_over',
                    data: { result: 'won', reason: 'all_lit' }
                  });
                  break;
                }
              }
            }
          }
        }
      }
    }

    // 5. Cập nhật Bóng Mực (Shades)
    if (this.state === 'playing') {
      for (const s of this.shades) {
        if (s.state === 'stunned') {
          s.stunnedTicks--;
          if (s.stunnedTicks <= 0) {
            s.state = 'chase';
          }
        } else {
          // Kiểm tra xem Mây có đang trong safe_radius của đèn đã thắp không
          const inSafeZone = this.lanterns.some(l => {
            if (!l.lit) return false;
            return Math.hypot(l.pos[0] - this.player.pos[0], l.pos[2] - this.player.pos[2]) <= this.config.safe_radius;
          });

          if (!inSafeZone) {
            const dToPlayer = Math.hypot(this.player.pos[0] - s.pos[0], this.player.pos[2] - s.pos[2]);
            if (dToPlayer > 0.001) {
              const stepDist = this.config.shade_speed * dt;
              s.pos[0] = round3(s.pos[0] + ((this.player.pos[0] - s.pos[0]) / dToPlayer) * stepDist);
              s.pos[2] = round3(s.pos[2] + ((this.player.pos[2] - s.pos[2]) / dToPlayer) * stepDist);
            }
            s.state = 'chase';
          } else {
            // Player an toàn trong vùng sáng đèn lồng, Bóng Mực lùi lại
            s.state = 'repelled';
          }

          // Kiểm tra va chạm gây sát thương
          if (this.player.invulnTicks <= 0) {
            const dToPlayer = Math.hypot(this.player.pos[0] - s.pos[0], this.player.pos[2] - s.pos[2]);
            if (dToPlayer <= this.config.shade_hit_radius) {
              this.player.flames--;
              const dropped = Math.floor(this.player.carried * this.config.hit_drop_ratio);
              this.player.carried -= dropped;
              this.player.invulnTicks = Math.round(this.config.invuln_s * this.config.tickRate);

              stepEvents.push({
                type: 'event',
                tick: eventTick,
                name: 'player_hit',
                data: {
                  by: 'shade',
                  flames: this.player.flames,
                  dropped
                }
              });

              if (this.player.flames <= 0) {
                this.state = 'lost';
                stepEvents.push({
                  type: 'event',
                  tick: eventTick,
                  name: 'game_over',
                  data: { result: 'lost', reason: 'no_flames' }
                });
                break;
              }
            }
          }
        }
      }
    }

    // 6. Kiểm tra hết thời gian (Dawn)
    if (this.state === 'playing' && this.time_left_s <= 0.0) {
      this.state = 'lost';
      stepEvents.push({
        type: 'event',
        tick: eventTick,
        name: 'game_over',
        data: { result: 'lost', reason: 'dawn' }
      });
    }

    // Giảm bộ đếm bất tử và cooldown
    if (this.player.invulnTicks > 0) this.player.invulnTicks--;
    if (this.player.pulseCooldownTicks > 0) this.player.pulseCooldownTicks--;

    // Lưu trạng thái nút cho frame sau
    this.prevButtons.interact = !!input.interact;
    this.prevButtons.pulse = !!input.pulse;
    this.prevButtons.jump = !!input.jump;
    this.prevButtons.dash = !!input.dash;

    this.events.push(...stepEvents);
    return stepEvents;
  }
}
