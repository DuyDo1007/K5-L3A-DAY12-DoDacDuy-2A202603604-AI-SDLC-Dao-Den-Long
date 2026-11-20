import { SeededRNG } from './rng.js';
import { DEFAULT_CONFIG } from './config.js';

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

export class WorldSimulation {
  constructor(config = {}, seed = 42, night = 1) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.seed = seed;
    this.night = night;
    this.rng = new SeededRNG(seed);

    this.tick = 0;
    this.sim_tick = 0;
    this.state = 'playing'; // 'playing' | 'paused' | 'won' | 'lost'
    this.score = 0;

    // Xác định thời lượng theo đêm
    if (this.night === 1) this.night_duration_s = this.config.night1_duration_s;
    else if (this.night === 2) this.night_duration_s = this.config.night2_duration_s;
    else this.night_duration_s = this.config.night3_duration_s;

    this.time_left_s = this.night_duration_s;

    // Player (Mây)
    const initY = (this.night === 3) ? 6.0 : 0.0;
    const initZ = (this.night === 3) ? 4.0 : 0.0;
    this.player = {
      pos: [0.0, initY, initZ],
      vel: [0.0, 0.0, 0.0],
      facingDeg: 0.0, // Quay mặt về +Z (0 deg)
      grounded: true,
      flames: this.config.flames,
      carried: 0,
      invulnTicks: 0,
      dashTicksLeft: 0,
      dashCooldownTicks: 0,
      pulseCooldownTicks: 0,
      charmTicksLeft: 0,
      inLaunchPad: false,
      fallWaitTicks: 0
    };

    // Wind
    this.wind = {
      active: false,
      dir_deg: 0.0,
      ticksLeft: 0,
      nextWindTick: (this.night === 3) ? 1800 : Infinity
    };
    this.wind_enabled = (this.night === 3);

    // Initial entities
    this.lanterns = [];
    this.moteSpawnPoints = [];
    this.motes = [];
    this.shadeSpawnPoints = [];
    this.shades = [];
    this.charms = [];
    this.drifters = [];

    this.moteIdCounter = 1;
    this.shadeIdCounter = 1;
    this.drifterIdCounter = 1;

    this.prevButtons = {
      interact: false,
      pulse: false,
      jump: false,
      dash: false,
      pause: false
    };

    this.events = [];

    // Khởi tạo bản đồ chuẩn
    this._initNightMap();
  }

  _initNightMap() {
    if (this.night === 1) {
      // Đêm 1: Đảo Bến (R = 40m)
      this.islandRadius = 40.0;
      this.lanterns = [
        { id: 'L1', pos: [0.0, 0.0, 25.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L2', pos: [23.8, 0.0, 7.7], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L3', pos: [14.7, 0.0, -20.2], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L4', pos: [-14.7, 0.0, -20.2], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L5', pos: [-23.8, 0.0, 7.7], lit: false, deposited: 0, pushTicks: 0 }
      ];

      // 8 điểm trên R=12m (mỗi 45°) và 16 điểm trên R=33m (mỗi 22.5°)
      this.moteSpawnPoints = [];
      for (let i = 0; i < 8; i++) {
        const rad = (i * 45 * Math.PI) / 180.0;
        this.moteSpawnPoints.push([round3(12.0 * Math.cos(rad)), 0.0, round3(12.0 * Math.sin(rad))]);
      }
      for (let i = 0; i < 16; i++) {
        const rad = (i * 22.5 * Math.PI) / 180.0;
        this.moteSpawnPoints.push([round3(33.0 * Math.cos(rad)), 0.0, round3(33.0 * Math.sin(rad))]);
      }

      // 12 điểm sinh Bóng Mực trên R=37m
      this.shadeSpawnPoints = [];
      for (let i = 0; i < 12; i++) {
        const rad = ((15 + i * 30) * Math.PI) / 180.0;
        this.shadeSpawnPoints.push([round3(37.0 * Math.cos(rad)), 0.0, round3(37.0 * Math.sin(rad))]);
      }
    } else if (this.night === 2) {
      // Đêm 2: Đảo Cau
      this.lanterns = [
        { id: 'L1', pos: [0.0, 0.0, 20.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L2', pos: [17.0, 0.0, -10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L3', pos: [-17.0, 0.0, -10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L4', pos: [70.0, 0.0, 20.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L5', pos: [87.0, 0.0, -10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L6', pos: [53.0, 0.0, -10.0], lit: false, deposited: 0, pushTicks: 0 }
      ];

      // Đom đóm: 4 điểm R=10m và 8 điểm R=22m mỗi đảo
      this.moteSpawnPoints = [];
      [ [0,0], [70,0] ].forEach(([cx, cz]) => {
        [0, 90, 180, 270].forEach(deg => {
          const rad = (deg * Math.PI) / 180.0;
          this.moteSpawnPoints.push([round3(cx + 10.0 * Math.cos(rad)), 0.0, round3(cz + 10.0 * Math.sin(rad))]);
        });
        for (let i = 0; i < 8; i++) {
          const rad = (i * 45 * Math.PI) / 180.0;
          this.moteSpawnPoints.push([round3(cx + 22.0 * Math.cos(rad)), 0.0, round3(cz + 22.0 * Math.sin(rad))]);
        }
      });

      // Bóng Mực: 8 điểm R=26m mỗi đảo
      this.shadeSpawnPoints = [];
      [ [0,0], [70,0] ].forEach(([cx, cz]) => {
        for (let i = 0; i < 8; i++) {
          const rad = ((22.5 + i * 45) * Math.PI) / 180.0;
          this.shadeSpawnPoints.push([round3(cx + 26.0 * Math.cos(rad)), 0.0, round3(cz + 26.0 * Math.sin(rad))]);
        }
      });

      // Bùa Gió C1
      this.charms = [{ id: 'C1', pos: [35.0, 0.0, 0.0], available: true, respawnTicks: 0 }];
    } else {
      // Đêm 3: Đảo Chuông (R = 45m, 3 tầng)
      this.islandRadius = 45.0;
      this.lanterns = [
        { id: 'L1', pos: [0.0, 6.0, 6.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L2', pos: [18.0, 3.0, 10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L3', pos: [-18.0, 3.0, 10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L4', pos: [35.0, 0.0, -10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L5', pos: [-35.0, 0.0, -10.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L6', pos: [20.0, 0.0, -35.0], lit: false, deposited: 0, pushTicks: 0 },
        { id: 'L7', pos: [-20.0, 0.0, -35.0], lit: false, deposited: 0, pushTicks: 0 }
      ];

      // Đom đóm: 18 điểm R=34m tầng 0, 8 điểm R=18m tầng 1 (z>0), 4 điểm R=5m tầng 2
      this.moteSpawnPoints = [];
      for (let i = 0; i < 18; i++) {
        const rad = (i * 20 * Math.PI) / 180.0;
        this.moteSpawnPoints.push([round3(34.0 * Math.cos(rad)), 0.0, round3(34.0 * Math.sin(rad))]);
      }
      for (let i = 0; i < 8; i++) {
        const rad = ((20 + i * 20) * Math.PI) / 180.0;
        this.moteSpawnPoints.push([round3(18.0 * Math.cos(rad)), 3.0, round3(18.0 * Math.sin(rad))]);
      }
      [45, 135, 225, 315].forEach(deg => {
        const rad = (deg * Math.PI) / 180.0;
        this.moteSpawnPoints.push([round3(5.0 * Math.cos(rad)), 6.0, round3(5.0 * Math.sin(rad))]);
      });

      // Bóng Mực: 16 điểm R=43m
      this.shadeSpawnPoints = [];
      for (let i = 0; i < 16; i++) {
        const rad = (i * 22.5 * Math.PI) / 180.0;
        this.shadeSpawnPoints.push([round3(43.0 * Math.cos(rad)), 0.0, round3(43.0 * Math.sin(rad))]);
      }

      // Bùa Gió C1, C2
      this.charms = [
        { id: 'C1', pos: [30.0, 0.0, 25.0], available: true, respawnTicks: 0 },
        { id: 'C2', pos: [-30.0, 0.0, 25.0], available: true, respawnTicks: 0 }
      ];
    }

    // Sinh 20 đom đóm ban đầu tại 20 điểm trống
    for (let i = 0; i < Math.min(20, this.moteSpawnPoints.length); i++) {
      const p = this.moteSpawnPoints[i];
      this.motes.push({
        id: `M${this.moteIdCounter++}`,
        pos: [p[0], p[1], p[2]],
        kind: 'random',
        ttl_ticks: Infinity,
        active: true
      });
    }
  }

  getGroundHeight(x, z) {
    if (this.night === 1) {
      if (Math.hypot(x, z) <= 40.0) return 0.0;
      return null;
    }
    if (this.night === 2) {
      if (Math.hypot(x, z) <= 28.0) return 0.0;
      if (Math.hypot(x - 70.0, z) <= 28.0) return 0.0;
      if (x >= 26.0 && x <= 44.0 && z >= -2.0 && z <= 2.0) return 0.0;
      return null;
    }
    if (this.night === 3) {
      const r = Math.hypot(x, z);
      if (r > 45.0) return null; // Ngoài đảo
      if (r <= 8.0) return 6.0; // Tầng 2 (đĩa bán kính 8m ở tâm)

      // Kiểm tra dốc ở 30° và 150° (r từ 24m đến 30m)
      const angleDeg = (Math.atan2(z, x) * 180.0) / Math.PI;
      const normAngle = (angleDeg + 360) % 360;
      for (const rampAngle of [30, 150]) {
        let diff = Math.abs(normAngle - rampAngle);
        if (diff > 180) diff = 360 - diff;
        const arcDist = (diff * Math.PI / 180.0) * r;
        if (arcDist <= 1.5 && r >= 24.0 && r <= 30.0) {
          // Đi trên dốc
          return round3(3.0 * (30.0 - r) / 6.0);
        }
      }

      // Tầng 1: vành khăn 12-24m ở nửa z > 0
      if (r >= 12.0 && r <= 24.0 && z > 0) return 3.0;

      // Tầng 0
      return 0.0;
    }
    return 0.0;
  }

  loadScenario(scenario = {}) {
    if (scenario.time_left_s !== undefined) {
      this.night_duration_s = scenario.time_left_s;
      this.time_left_s = scenario.time_left_s;
    }
    if (scenario.wind_enabled !== undefined) {
      this.wind_enabled = scenario.wind_enabled;
    }

    if (scenario.player) {
      const p = scenario.player;
      if (p.pos) this.player.pos = [round3(p.pos[0]), round3(p.pos[1] || 0.0), round3(p.pos[2])];
      if (p.vel) this.player.vel = [round3(p.vel[0]), round3(p.vel[1] || 0.0), round3(p.vel[2])];
      if (p.carried !== undefined) this.player.carried = p.carried;
      if (p.flames !== undefined) this.player.flames = p.flames;
      if (p.invuln_ticks !== undefined) this.player.invulnTicks = p.invuln_ticks;
      if (p.dash_cd_ticks !== undefined) this.player.dashCooldownTicks = p.dash_cd_ticks;
      if (p.pulse_cd_ticks !== undefined) this.player.pulseCooldownTicks = p.pulse_cd_ticks;
      if (p.charm_ticks !== undefined) this.player.charmTicksLeft = p.charm_ticks;
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
            deposited: sl.deposited || 0,
            pushTicks: 0
          });
        }
      }
    }

    if (scenario.random_motes === false) {
      this.motes = [];
      if (scenario.motes && Array.isArray(scenario.motes)) {
        scenario.motes.forEach(m => {
          const pos = Array.isArray(m) ? m : m.pos;
          const id = (m && m.id) ? m.id : `M${this.moteIdCounter++}`;
          this.motes.push({
            id,
            pos: [round3(pos[0]), round3(pos[1] || 0.0), round3(pos[2])],
            kind: (m && m.kind) ? m.kind : 'random',
            ttl_ticks: (m && m.ttl_s) ? Math.round(m.ttl_s * 60) : Infinity,
            active: true
          });
        });
      }
    }

    if (scenario.random_shades === false) {
      this.shades = [];
      if (scenario.shades && Array.isArray(scenario.shades)) {
        scenario.shades.forEach(s => {
          const id = s.id || `S${this.shadeIdCounter++}`;
          this.shades.push({
            id,
            pos: [round3(s.pos[0]), round3(s.pos[1] || 0.0), round3(s.pos[2])],
            state: s.state || 'chase',
            stateTicksLeft: s.state_ticks_left || 0,
            recoilTicks: 0,
            pushTicks: 0
          });
        });
      }
    }

    if (scenario.random_drifters === false || scenario.drifters) {
      this.drifters = [];
      if (scenario.drifters && Array.isArray(scenario.drifters)) {
        scenario.drifters.forEach(d => {
          const id = d.id || `D${this.drifterIdCounter++}`;
          this.drifters.push({
            id,
            pos: [round3(d.pos[0]), round3(d.pos[1] || 0.0), round3(d.pos[2])],
            state: d.state || 'idle',
            stolen: d.stolen || 0,
            fleeTicks: 0,
            vanishTicks: 0
          });
        });
      }
    }

    if (scenario.charms && Array.isArray(scenario.charms)) {
      this.charms = scenario.charms.map(c => ({
        id: c.id,
        pos: c.pos || [0, 0, 0],
        available: (c.available !== undefined) ? c.available : true,
        respawnTicks: c.respawn_s ? Math.round(c.respawn_s * 60) : 0
      }));
    }
  }

  getSnapshot() {
    return {
      type: 'snapshot',
      tick: this.tick,
      sim_tick: this.sim_tick,
      state: this.state,
      night: this.night,
      time_left_s: Number(this.time_left_s.toFixed(1)),
      score: this.score,
      wind: {
        active: this.wind.active,
        dir_deg: round3(this.wind.dir_deg)
      },
      player: {
        pos: [round3(this.player.pos[0]), round3(this.player.pos[1]), round3(this.player.pos[2])],
        vel: [round3(this.player.vel[0]), round3(this.player.vel[1]), round3(this.player.vel[2])],
        grounded: this.player.grounded,
        flames: this.player.flames,
        carried: this.player.carried,
        invuln: (this.player.invulnTicks > 0),
        dash_cd_s: Number((Math.max(0, this.player.dashCooldownTicks) / 60.0).toFixed(1)),
        pulse_cd_s: Number((Math.max(0, this.player.pulseCooldownTicks) / 60.0).toFixed(1)),
        charm_s: Number((Math.max(0, this.player.charmTicksLeft) / 60.0).toFixed(1))
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
      motes: this.motes.filter(m => m.active).map(m => ({
        id: m.id,
        pos: [round3(m.pos[0]), round3(m.pos[1]), round3(m.pos[2])],
        kind: m.kind,
        ttl_s: (m.ttl_ticks === Infinity) ? 0.0 : Number((m.ttl_ticks / 60.0).toFixed(1))
      })),
      drifters: this.drifters.filter(d => d.state !== 'removed').map(d => ({
        id: d.id,
        pos: [round3(d.pos[0]), round3(d.pos[1]), round3(d.pos[2])],
        state: d.state,
        stolen: d.stolen
      })),
      charms: this.charms.map(c => ({
        id: c.id,
        available: c.available,
        respawn_s: Number((c.respawnTicks / 60.0).toFixed(1))
      })),
      motes_active: this.motes.filter(m => m.active).length
    };
  }

  step(input = {}) {
    this.tick++;
    const stepEvents = [];
    const eventTick = this.tick;
    const dt = 1.0 / this.config.tickRate;

    // --- 1. ĐỌC INPUT & XỬ LÝ PAUSE ---
    const pauseTriggered = !!input.pause && !this.prevButtons.pause;
    if (pauseTriggered) {
      if (this.state === 'playing') {
        this.state = 'paused';
        stepEvents.push({ type: 'event', tick: eventTick, name: 'paused', data: {} });
      } else if (this.state === 'paused') {
        this.state = 'playing';
        stepEvents.push({ type: 'event', tick: eventTick, name: 'resumed', data: {} });
      }
    }

    if (this.state === 'paused') {
      // Khi đang tạm dừng: tick tăng nhưng sim_tick và thế giới đứng yên
      this.prevButtons = {
        interact: !!input.interact,
        pulse: !!input.pulse,
        jump: !!input.jump,
        dash: !!input.dash,
        pause: !!input.pause
      };
      this.events.push(...stepEvents);
      return stepEvents;
    }

    if (this.state !== 'playing') {
      return [];
    }

    this.sim_tick++;
    if (this.sim_tick === 1) {
      stepEvents.push({ type: 'event', tick: eventTick, name: 'night_start', data: { night: this.night } });
    }

    // --- 2. GIẢM CÁC BỘ ĐẾM ---
    this.time_left_s = Math.max(0.0, this.night_duration_s - (this.sim_tick / this.config.tickRate));
    if (this.player.invulnTicks > 0) this.player.invulnTicks--;
    if (this.player.dashCooldownTicks > 0) this.player.dashCooldownTicks--;
    if (this.player.pulseCooldownTicks > 0) this.player.pulseCooldownTicks--;
    if (this.player.charmTicksLeft > 0) this.player.charmTicksLeft--;

    // TTL đom đóm rơi
    for (const m of this.motes) {
      if (m.active && m.ttl_ticks !== Infinity) {
        m.ttl_ticks--;
        if (m.ttl_ticks <= 0) m.active = false;
      }
    }

    // Hồi bùa
    for (const c of this.charms) {
      if (!c.available) {
        c.respawnTicks--;
        if (c.respawnTicks <= 0) c.available = true;
      }
    }

    // Thời gian choáng của Bóng Mực
    for (const s of this.shades) {
      if (s.state === 'stunned') {
        if (s.stateTicksLeft > 0) s.stateTicksLeft--;
        if (s.stateTicksLeft <= 0) s.state = 'chase';
      }
    }

    // Gió mạnh (Đêm 3)
    if (this.wind_enabled) {
      if (this.wind.active) {
        this.wind.ticksLeft--;
        if (this.wind.ticksLeft <= 0) this.wind.active = false;
      } else if (this.sim_tick >= this.wind.nextWindTick) {
        this.wind.active = true;
        this.wind.ticksLeft = 300; // 5s
        this.wind.dir_deg = round3(this.rng.nextFloat() * 360.0);
        this.wind.nextWindTick += 1800; // mỗi 30s
      }
    }

    // --- 3. DI CHUYỂN MÂY (NHẢY, LƯỚT, BỤC NHẢY, GIÓ, RƠI) ---
    if (this.player.fallWaitTicks > 0) {
      this.player.fallWaitTicks--;
      if (this.player.fallWaitTicks <= 0) {
        // Hồi sinh ở điểm xuất phát (0, 0, 0)
        this.player.pos = [0.0, 0.0, 0.0];
        this.player.vel = [0.0, 0.0, 0.0];
        this.player.grounded = true;
        this.player.invulnTicks = this.config.fall_invuln_ticks;
      }
    } else {
      const move = input.move || [0, 0];
      const camYawDeg = input.cam_yaw_deg || 0;
      const thetaRad = (camYawDeg * Math.PI) / 180.0;

      let mx = Math.max(-1.0, Math.min(1.0, move[0] || 0));
      let mz = Math.max(-1.0, Math.min(1.0, move[1] || 0));

      let worldX = mx * Math.cos(thetaRad) + mz * Math.sin(thetaRad);
      let worldZ = -mx * Math.sin(thetaRad) + mz * Math.cos(thetaRad);

      const moveMag = Math.hypot(worldX, worldZ);
      if (moveMag > 1.0) {
        worldX /= moveMag;
        worldZ /= moveMag;
      }

      if (moveMag > 0.001) {
        this.player.facingDeg = (Math.atan2(worldX, worldZ) * 180.0) / Math.PI;
      }

      // Xử lý Lướt (Dash)
      const dashTriggered = !!input.dash && !this.prevButtons.dash;
      const canDash = (this.player.charmTicksLeft > 0) ? (this.player.dashTicksLeft <= 0) : (this.player.dashCooldownTicks <= 0);

      if (dashTriggered && canDash) {
        this.player.dashTicksLeft = 12; // 0.2s = 12 ticks
        this.player.dashCooldownTicks = 90; // 1.5s = 90 ticks
        stepEvents.push({ type: 'event', tick: eventTick, name: 'dash', data: {} });
      }

      // Vận tốc di chuyển ngang
      let speed = (this.player.charmTicksLeft > 0) ? this.config.charm_speed : this.config.player_speed;
      let dirX = worldX;
      let dirZ = worldZ;

      if (this.player.dashTicksLeft > 0) {
        speed = this.config.dash_speed;
        this.player.dashTicksLeft--;
        // Nếu đứng yên thì hướng lướt là hướng nhân vật đang quay mặt
        if (moveMag <= 0.001) {
          const facingRad = ((this.player.facingDeg || 0) * Math.PI) / 180.0;
          dirX = Math.sin(facingRad);
          dirZ = Math.cos(facingRad);
        }
      }

      let vx = dirX * speed;
      let vz = dirZ * speed;

      // Nếu đang trong bục nhảy (launch velocity), giữ nguyên vận tốc phóng ngang tới khi chạm đất
      if (this.player.inLaunchPad) {
        vx = this.player.vel[0];
        vz = this.player.vel[2];
      }

      // Đẩy của gió
      if (this.wind.active) {
        const windRad = (this.wind.dir_deg * Math.PI) / 180.0;
        vx += 2.0 * Math.cos(windRad);
        vz += 2.0 * Math.sin(windRad);
      }

      this.player.vel[0] = round3(vx);
      this.player.vel[2] = round3(vz);

      // Nhảy (Jump)
      const jumpTriggered = !!input.jump && !this.prevButtons.jump;
      if (jumpTriggered && this.player.grounded && !this.player.inLaunchPad) {
        this.player.vel[1] = this.config.jump_velocity;
        this.player.grounded = false;
      }

      // Trọng lực (Lướt trên không giữ nguyên độ cao)
      if (!this.player.grounded && this.player.dashTicksLeft <= 0) {
        this.player.vel[1] += this.config.gravity * dt;
      }

      // Cập nhật vị trí
      let nextX = this.player.pos[0] + this.player.vel[0] * dt;
      let nextY = this.player.pos[1] + this.player.vel[1] * dt;
      let nextZ = this.player.pos[2] + this.player.vel[2] * dt;

      // Kiểm tra mặt đất & độ cao
      const groundH = this.getGroundHeight(nextX, nextZ);
      if (groundH !== null) {
        if (nextY <= groundH) {
          nextY = groundH;
          this.player.vel[1] = 0.0;
          this.player.grounded = true;
          this.player.inLaunchPad = false;
        } else {
          this.player.grounded = false;
        }
      } else {
        this.player.grounded = false;
      }

      this.player.pos = [round3(nextX), round3(nextY), round3(nextZ)];

      // Kiểm tra Bục Nhảy (Jump Pads)
      if (this.night === 2) {
        // Pad A: (20, 0, 18) -> bắn về B (70, 0, 0)
        if (Math.hypot(this.player.pos[0] - 20.0, this.player.pos[2] - 18.0) <= 1.0 && this.player.grounded) {
          const dirX = 70.0 - 20.0;
          const dirZ = 0.0 - 18.0;
          const len = Math.hypot(dirX, dirZ);
          this.player.vel = [round3((dirX / len) * 24.0), 14.0, round3((dirZ / len) * 24.0)];
          this.player.grounded = false;
          this.player.inLaunchPad = true;
        }
        // Pad B: (50, 0, -18) -> bắn về A (0, 0, 0)
        if (Math.hypot(this.player.pos[0] - 50.0, this.player.pos[2] - (-18.0)) <= 1.0 && this.player.grounded) {
          const dirX = 0.0 - 50.0;
          const dirZ = 0.0 - (-18.0);
          const len = Math.hypot(dirX, dirZ);
          this.player.vel = [round3((dirX / len) * 24.0), 14.0, round3((dirZ / len) * 24.0)];
          this.player.grounded = false;
          this.player.inLaunchPad = true;
        }
      } else if (this.night === 3) {
        // Pad: (0, 3, 13) -> phóng Y=12m/s, hướng -Z 8m/s lên Tier 2
        if (Math.hypot(this.player.pos[0] - 0.0, this.player.pos[2] - 13.0) <= 1.0 && this.player.pos[1] >= 2.5 && this.player.pos[1] <= 3.5) {
          this.player.vel = [0.0, 12.0, -8.0];
          this.player.grounded = false;
          this.player.inLaunchPad = true;
        }
      }

      // Kiểm tra Rơi Khỏi Đảo (Y < -10)
      if (this.player.pos[1] < this.config.fall_threshold_y) {
        this.player.flames--;
        const lostMotes = this.player.carried;
        this.player.carried = 0;
        this.player.fallWaitTicks = this.config.fall_respawn_wait_ticks;

        stepEvents.push({
          type: 'event',
          tick: eventTick,
          name: 'player_hit',
          data: {
            by: 'fall',
            flames: this.player.flames,
            dropped: 0,
            lost: lostMotes
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
        }
      }
    }

    // --- 4. NHẶT ĐOM ĐÓM VÀ BÙA ---
    if (this.state === 'playing' && this.player.fallWaitTicks <= 0) {
      // Nhặt đom đóm
      for (const m of this.motes) {
        if (m.active && this.player.carried < this.config.carry_capacity) {
          const dXZ = Math.hypot(m.pos[0] - this.player.pos[0], m.pos[2] - this.player.pos[2]);
          const dY = Math.abs(this.player.pos[1] - m.pos[1]);
          if (dXZ <= this.config.pickup_radius && dY <= 1.5) {
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

      // Nhặt Bùa Gió
      for (const c of this.charms) {
        if (c.available) {
          const dXZ = Math.hypot(c.pos[0] - this.player.pos[0], c.pos[2] - this.player.pos[2]);
          const dY = Math.abs(this.player.pos[1] - c.pos[1]);
          if (dXZ <= this.config.pickup_radius && dY <= 1.5) {
            c.available = false;
            c.respawnTicks = this.config.charm_respawn_ticks;
            this.player.charmTicksLeft = this.config.charm_duration_ticks;
            stepEvents.push({
              type: 'event',
              tick: eventTick,
              name: 'charm_picked',
              data: { charm_id: c.id, charm_ticks: this.config.charm_duration_ticks }
            });
          }
        }
      }
    }

    // --- 5. TƯƠNG TÁC VỚI ĐÈN ---
    const interactTriggered = !!input.interact && !this.prevButtons.interact;
    if (interactTriggered && this.player.carried > 0 && this.state === 'playing') {
      // Chọn đèn chưa sáng gần nhất trong bán kính 2.0m (bằng nhau chọn id nhỏ hơn)
      let candidates = [];
      for (const l of this.lanterns) {
        if (!l.lit) {
          const d = Math.hypot(l.pos[0] - this.player.pos[0], l.pos[2] - this.player.pos[2]);
          if (d <= this.config.interact_radius) {
            candidates.push({ lantern: l, dist: d });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => (a.dist - b.dist) || a.lantern.id.localeCompare(b.lantern.id));
        const chosen = candidates[0].lantern;
        const needed = this.config.lantern_cost - chosen.deposited;
        const depositAmount = Math.min(needed, this.player.carried);
        if (depositAmount > 0) {
          this.player.carried -= depositAmount;
          chosen.deposited += depositAmount;
          stepEvents.push({
            type: 'event',
            tick: eventTick,
            name: 'deposit',
            data: {
              lantern_id: chosen.id,
              amount: depositAmount,
              deposited: chosen.deposited
            }
          });

          if (chosen.deposited >= this.config.lantern_cost) {
            chosen.lit = true;
            chosen.pushTicks = 30; // Đẩy Bóng Mực ra mép trong 30 tick
            this.score += this.config.score.per_lantern;
            stepEvents.push({
              type: 'event',
              tick: eventTick,
              name: 'lantern_lit',
              data: { lantern_id: chosen.id }
            });

            // Kiểm tra thắng
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
            }
          }
        }
      }
    }

    // --- 6. CẬP NHẬT VÙNG AN TOÀN ---
    for (const l of this.lanterns) {
      if (l.lit && l.pushTicks > 0) {
        l.pushTicks--;
        for (const s of this.shades) {
          const d = Math.hypot(s.pos[0] - l.pos[0], s.pos[2] - l.pos[2]);
          if (d < this.config.safe_radius) {
            const pushDirX = (d > 0.001) ? ((s.pos[0] - l.pos[0]) / d) : 1.0;
            const pushDirZ = (d > 0.001) ? ((s.pos[2] - l.pos[2]) / d) : 0.0;
            s.pos[0] = round3(l.pos[0] + pushDirX * this.config.safe_radius);
            s.pos[2] = round3(l.pos[2] + pushDirZ * this.config.safe_radius);
          }
        }
      }
    }

    // --- 7. TỎA SÁNG (PULSE) ---
    const pulseTriggered = !!input.pulse && !this.prevButtons.pulse;
    if (pulseTriggered && this.player.pulseCooldownTicks <= 0 && this.player.carried >= this.config.pulse_cost && this.state === 'playing') {
      this.player.carried -= this.config.pulse_cost;
      this.player.pulseCooldownTicks = Math.round(this.config.pulse_cooldown_s * this.config.tickRate);

      const pulseCenter = [this.player.pos[0], this.player.pos[1] + 0.8, this.player.pos[2]];
      const stunnedIds = [];

      // Kiểm tra Bóng Mực trong khoảng cách 3D <= 5.0m
      for (const s of this.shades) {
        const d3D = Math.hypot(s.pos[0] - pulseCenter[0], (s.pos[1] || 0) - pulseCenter[1], s.pos[2] - pulseCenter[2]);
        if (d3D <= this.config.pulse_radius) {
          s.state = 'stunned';
          s.stateTicksLeft = this.config.pulse_stun_ticks;
          s.pushTicks = this.config.pulse_push_duration_ticks;
          const dXZ = Math.hypot(s.pos[0] - this.player.pos[0], s.pos[2] - this.player.pos[2]);
          s.pushDirX = (dXZ > 0.001) ? ((s.pos[0] - this.player.pos[0]) / dXZ) : 1.0;
          s.pushDirZ = (dXZ > 0.001) ? ((s.pos[2] - this.player.pos[2]) / dXZ) : 0.0;
          stunnedIds.push(s.id);
        }
      }

      // Kiểm tra Gió Lạc (Drifters)
      for (const d of this.drifters) {
        const d3D = Math.hypot(d.pos[0] - pulseCenter[0], (d.pos[1] || 0) - pulseCenter[1], d.pos[2] - pulseCenter[2]);
        if (d3D <= this.config.pulse_radius) {
          if (d.state === 'chase') {
            d.state = 'flee';
            d.fleeTicks = this.config.drifter_flee_ticks;
          } else if (d.state === 'flee' && d.stolen > 0) {
            // Thả lại toàn bộ đom đóm
            for (let i = 0; i < d.stolen; i++) {
              this.motes.push({
                id: `M${this.moteIdCounter++}`,
                pos: [round3(d.pos[0] + (this.rng.nextFloat() - 0.5) * 1.5), d.pos[1], round3(d.pos[2] + (this.rng.nextFloat() - 0.5) * 1.5)],
                kind: 'dropped',
                ttl_ticks: this.config.dropped_mote_ttl_ticks,
                active: true
              });
            }
            stepEvents.push({ type: 'event', tick: eventTick, name: 'drifter_drop', data: { drifter_id: d.id, amount: d.stolen } });
            d.stolen = 0;
            d.vanishTicks = this.config.drifter_drop_vanish_ticks;
          }
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

    // --- 8. DI CHUYỂN BÓNG MỰC VÀ GIÓ LẠC ---
    const shadeSpeed = (this.night === 3) ? this.config.shade_speed_night3 : this.config.shade_speed;
    for (const s of this.shades) {
      if (s.state === 'stunned') {
        if (s.pushTicks > 0) {
          s.pushTicks--;
          const pushStep = (this.config.pulse_push_m / this.config.pulse_push_duration_ticks);
          s.pos[0] = round3(s.pos[0] + (s.pushDirX || 1.0) * pushStep);
          s.pos[2] = round3(s.pos[2] + (s.pushDirZ || 0.0) * pushStep);
        }
      } else if (s.state === 'recoil') {
        s.recoilTicks--;
        if (s.recoilTicks <= 0) s.state = 'chase';
        else {
          const recoilStep = (this.config.shade_recoil_m / this.config.shade_recoil_ticks);
          s.pos[0] = round3(s.pos[0] + (s.recoilDirX || 0.0) * recoilStep);
          s.pos[2] = round3(s.pos[2] + (s.recoilDirZ || 0.0) * recoilStep);
        }
      } else {
        // AI Bóng Mực: phát hiện / đuổi Mây
        const dToPlayer = Math.hypot(this.player.pos[0] - s.pos[0], this.player.pos[2] - s.pos[2]);
        if (s.state === 'chase') {
          if (dToPlayer > this.config.shade_lose_radius) {
            s.state = 'wander';
          }
        } else {
          if (dToPlayer <= this.config.shade_detect_radius) {
            s.state = 'chase';
          }
        }

        if (s.state === 'chase' && dToPlayer > 0.001) {
          const stepDist = shadeSpeed * dt;
          let nx = s.pos[0] + ((this.player.pos[0] - s.pos[0]) / dToPlayer) * stepDist;
          let nz = s.pos[2] + ((this.player.pos[2] - s.pos[2]) / dToPlayer) * stepDist;

          // Chặn ở mép 6m của đèn lồng đã thắp sáng
          for (const l of this.lanterns) {
            if (l.lit) {
              const dToL = Math.hypot(nx - l.pos[0], nz - l.pos[2]);
              if (dToL < this.config.safe_radius) {
                const angle = Math.atan2(nz - l.pos[2], nx - l.pos[0]);
                nx = l.pos[0] + Math.cos(angle) * this.config.safe_radius;
                nz = l.pos[2] + Math.sin(angle) * this.config.safe_radius;
              }
            }
          }
          s.pos[0] = round3(nx);
          s.pos[2] = round3(nz);
        }
      }
    }

    // Di chuyển Gió Lạc (Drifters)
    for (const d of this.drifters) {
      if (d.vanishTicks > 0) {
        d.vanishTicks--;
        if (d.vanishTicks <= 0) d.state = 'removed';
      } else if (d.state === 'idle') {
        const dToPlayer = Math.hypot(this.player.pos[0] - d.pos[0], this.player.pos[2] - d.pos[2]);
        if (this.player.carried >= this.config.drifter_chase_min_carried && dToPlayer <= this.config.drifter_chase_detect_radius) {
          d.state = 'chase';
        }
      } else if (d.state === 'chase') {
        const dToPlayer = Math.hypot(this.player.pos[0] - d.pos[0], this.player.pos[2] - d.pos[2]);
        if (this.player.carried < this.config.drifter_chase_min_carried || dToPlayer > this.config.drifter_chase_detect_radius) {
          d.state = 'idle';
        } else if (dToPlayer > 0.001) {
          d.pos[0] = round3(d.pos[0] + ((this.player.pos[0] - d.pos[0]) / dToPlayer) * this.config.drifter_speed * dt);
          d.pos[2] = round3(d.pos[2] + ((this.player.pos[2] - d.pos[2]) / dToPlayer) * this.config.drifter_speed * dt);
        }
      } else if (d.state === 'flee') {
        d.fleeTicks--;
        if (d.fleeTicks <= 0) d.state = 'removed';
        else {
          const dToPlayer = Math.hypot(d.pos[0] - this.player.pos[0], d.pos[2] - this.player.pos[2]);
          const fleeDirX = (dToPlayer > 0.001) ? ((d.pos[0] - this.player.pos[0]) / dToPlayer) : 1.0;
          const fleeDirZ = (dToPlayer > 0.001) ? ((d.pos[2] - this.player.pos[2]) / dToPlayer) : 0.0;
          d.pos[0] = round3(d.pos[0] + fleeDirX * this.config.drifter_speed * dt);
          d.pos[2] = round3(d.pos[2] + fleeDirZ * this.config.drifter_speed * dt);
        }
      }
    }

    // --- 9. CHẠM (COLLISIONS): GIÓ LẠC TRƯỚC, RỒI BÓNG MỰC ---
    if (this.state === 'playing' && this.player.fallWaitTicks <= 0) {
      // Gió Lạc cướp đom đóm
      for (const d of this.drifters) {
        if (d.state === 'chase' && d.stolen === 0) {
          const dXZ = Math.hypot(this.player.pos[0] - d.pos[0], this.player.pos[2] - d.pos[2]);
          if (dXZ <= this.config.drifter_steal_radius) {
            const stealAmount = Math.min(3, this.player.carried);
            this.player.carried -= stealAmount;
            d.stolen = stealAmount;
            d.state = 'flee';
            d.fleeTicks = this.config.drifter_flee_ticks;
            stepEvents.push({
              type: 'event',
              tick: eventTick,
              name: 'drifter_steal',
              data: { drifter_id: d.id, amount: stealAmount, carried: this.player.carried }
            });
          }
        }
      }

      // Bóng Mực chạm Mây (xét theo ID tăng dần, tối đa 1 lần mất ngọn lửa mỗi tick)
      let playerHitThisTick = false;
      const sortedShades = [...this.shades].sort((a, b) => a.id.localeCompare(b.id));

      for (const s of sortedShades) {
        if (s.state !== 'stunned' && s.state !== 'recoil') {
          const dXZ = Math.hypot(this.player.pos[0] - s.pos[0], this.player.pos[2] - s.pos[2]);
          const dY = Math.abs(this.player.pos[1] - s.pos[1]);
          if (dXZ <= this.config.shade_hit_radius && dY <= 1.5) {
            // Bóng gây hit lùi 2m trong 60 tick (recoil)
            s.state = 'recoil';
            s.recoilTicks = this.config.shade_recoil_ticks;
            const recoilDir = (dXZ > 0.001) ? [(s.pos[0] - this.player.pos[0]) / dXZ, (s.pos[2] - this.player.pos[2]) / dXZ] : [1, 0];
            s.recoilDirX = recoilDir[0];
            s.recoilDirZ = recoilDir[1];

            if (!playerHitThisTick && this.player.invulnTicks <= 0) {
              playerHitThisTick = true;
              this.player.flames--;
              const droppedCount = Math.floor(this.player.carried * this.config.hit_drop_ratio);
              this.player.carried -= droppedCount;
              this.player.invulnTicks = 90; // 1.5s = 90 ticks

              // Rơi đom đóm ra vành 1.5-2.5m quanh Mây
              for (let i = 0; i < droppedCount; i++) {
                const angle = this.rng.nextFloat() * 2 * Math.PI;
                const r = 1.5 + this.rng.nextFloat() * 1.0;
                this.motes.push({
                  id: `M${this.moteIdCounter++}`,
                  pos: [round3(this.player.pos[0] + r * Math.cos(angle)), this.player.pos[1], round3(this.player.pos[2] + r * Math.sin(angle))],
                  kind: 'dropped',
                  ttl_ticks: this.config.dropped_mote_ttl_ticks,
                  active: true
                });
              }

              stepEvents.push({
                type: 'event',
                tick: eventTick,
                name: 'player_hit',
                data: {
                  by: 'shade',
                  flames: this.player.flames,
                  dropped: droppedCount
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

    // --- 10. SINH ĐOM ĐÓM, BÓNG MỰC, GIÓ LẠC THEO LỊCH ---
    if (this.state === 'playing') {
      // Sinh đom đóm định kỳ (tại 240, 480, ...)
      if (this.sim_tick % this.config.mote_spawn_interval_ticks === 0) {
        const activeCount = this.motes.filter(m => m.active).length;
        if (activeCount < this.config.mote_cap) {
          // Tìm điểm trống trong moteSpawnPoints
          for (const sp of this.moteSpawnPoints) {
            const occupied = this.motes.some(m => m.active && Math.hypot(m.pos[0] - sp[0], m.pos[2] - sp[2]) < 2.0);
            if (!occupied) {
              this.motes.push({
                id: `M${this.moteIdCounter++}`,
                pos: [sp[0], sp[1], sp[2]],
                kind: 'random',
                ttl_ticks: Infinity,
                active: true
              });
              break;
            }
          }
        }
      }

      // Sinh Bóng Mực theo lịch
      let shouldSpawnShade = false;
      let spawnCount = 0;
      let maxShades = 6;
      let intervalTicks = 480; // 8s

      if (this.night === 1) {
        maxShades = 6;
        intervalTicks = 480;
        if (this.sim_tick === 300) { shouldSpawnShade = true; spawnCount = 2; }
        else if (this.sim_tick > 300 && (this.sim_tick - 300) % intervalTicks === 0) { shouldSpawnShade = true; spawnCount = 1; }
      } else if (this.night === 2) {
        maxShades = 8;
        intervalTicks = 420; // 7s
        if (this.sim_tick % intervalTicks === 0) { shouldSpawnShade = true; spawnCount = 1; }
      } else if (this.night === 3) {
        maxShades = 10;
        intervalTicks = 360; // 6s
        if (this.sim_tick % intervalTicks === 0) { shouldSpawnShade = true; spawnCount = 1; }
      }

      if (shouldSpawnShade && this.shades.length < maxShades) {
        for (let k = 0; k < spawnCount; k++) {
          if (this.shades.length >= maxShades) break;
          // Tìm điểm cách người chơi >= 15m
          const validPoints = this.shadeSpawnPoints.filter(p => Math.hypot(p[0] - this.player.pos[0], p[2] - this.player.pos[2]) >= 15.0);
          if (validPoints.length > 0) {
            const sp = validPoints[this.shades.length % validPoints.length];
            const newShadeId = `S${this.shadeIdCounter++}`;
            this.shades.push({
              id: newShadeId,
              pos: [sp[0], sp[1] || 0.0, sp[2]],
              state: 'spawning',
              stateTicksLeft: 30, // 0.5s spawning
              recoilTicks: 0,
              pushTicks: 0
            });
            stepEvents.push({ type: 'event', tick: eventTick, name: 'shade_spawned', data: { id: newShadeId } });
          }
        }
      }

      // Sinh Gió Lạc (Đêm 2 & 3: tại tick 1200, 2400, ..., tối đa 2)
      if ((this.night === 2 || this.night === 3) && this.sim_tick % 1200 === 0) {
        const activeDrifters = this.drifters.filter(d => d.state !== 'removed').length;
        if (activeDrifters < 2) {
          const newDrifterId = `D${this.drifterIdCounter++}`;
          const angle = this.rng.nextFloat() * 2 * Math.PI;
          const r = 25.0;
          this.drifters.push({
            id: newDrifterId,
            pos: [round3(r * Math.cos(angle)), 0.0, round3(r * Math.sin(angle))],
            state: 'idle',
            stolen: 0,
            fleeTicks: 0,
            vanishTicks: 0
          });
        }
      }
    }

    // --- 11. XÉT THẮNG / THUA ---
    if (this.state === 'playing') {
      if (this.player.flames <= 0) {
        this.state = 'lost';
        stepEvents.push({ type: 'event', tick: eventTick, name: 'game_over', data: { result: 'lost', reason: 'no_flames' } });
      } else if (this.lanterns.every(l => l.lit)) {
        this.state = 'won';
        const timeBonus = Math.floor(this.time_left_s) * this.config.score.per_second_left;
        const flameBonus = this.player.flames * this.config.score.per_flame_left;
        this.score += timeBonus + flameBonus;
        stepEvents.push({ type: 'event', tick: eventTick, name: 'game_over', data: { result: 'won', reason: 'all_lit' } });
      } else if (this.time_left_s <= 0.0) {
        this.state = 'lost';
        stepEvents.push({ type: 'event', tick: eventTick, name: 'game_over', data: { result: 'lost', reason: 'dawn' } });
      }
    }

    // Lưu trạng thái nút cho frame sau
    this.prevButtons.interact = !!input.interact;
    this.prevButtons.pulse = !!input.pulse;
    this.prevButtons.jump = !!input.jump;
    this.prevButtons.dash = !!input.dash;
    this.prevButtons.pause = !!input.pause;

    this.events.push(...stepEvents);
    return stepEvents;
  }
}
