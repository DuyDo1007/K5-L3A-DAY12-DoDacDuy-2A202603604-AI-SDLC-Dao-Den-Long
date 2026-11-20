/**
 * Cấu hình tham số mô phỏng chuẩn hóa cho Đảo Đèn Lồng (Phase 2: Test Contract v1.1)
 */
export const DEFAULT_CONFIG = {
  // Bản đồ & Thời lượng các Đêm
  islandRadius_night1: 40.0,
  night1_duration_s: 300,
  night2_duration_s: 330,
  night3_duration_s: 360,

  // Di chuyển Mây
  player_speed: 6.0,          // 6.0 m/s
  jump_velocity: 7.0,         // 7.0 m/s
  gravity: -20.0,             // -20 m/s²
  dash_speed: 14.0,           // 14.0 m/s
  dash_duration_s: 0.2,       // 12 ticks
  dash_cooldown_s: 1.5,       // 90 ticks

  // Đom đóm (Motes)
  carry_capacity: 10,
  pickup_radius: 1.0,         // XZ <= 1.0m, |dY| <= 1.5m
  mote_start_count: 20,
  mote_cap: 30,
  mote_spawn_interval_ticks: 240,
  dropped_mote_ttl_ticks: 480,

  // Đèn lồng (Lanterns)
  lantern_cost: 10,
  interact_radius: 2.0,
  safe_radius: 6.0,

  // Tỏa Sáng (Pulse)
  pulse_cost: 3,
  pulse_radius: 5.0,
  pulse_cooldown_s: 3.0,      // 180 ticks
  pulse_stun_ticks: 120,
  pulse_push_duration_ticks: 15,
  pulse_push_m: 4.0,

  // Bóng Mực (Shades)
  shade_speed: 4.0,           // Đêm 3 là 4.5 m/s
  shade_speed_night3: 4.5,
  shade_detect_radius: 12.0,
  shade_lose_radius: 18.0,
  shade_hit_radius: 1.0,
  shade_recoil_ticks: 60,
  shade_recoil_m: 2.0,
  invuln_s: 1.5,              // 90 ticks
  hit_drop_ratio: 0.5,

  // Rơi khỏi đảo (Y < -10)
  fall_enabled: true,
  fall_threshold_y: -10.0,
  fall_respawn_wait_ticks: 60,
  fall_invuln_ticks: 90,

  // Gió Lạc (Drifters - Đêm 2 & 3)
  drifter_speed: 7.0,
  drifter_idle_speed: 2.0,
  drifter_steal_radius: 1.2,
  drifter_chase_detect_radius: 15.0,
  drifter_chase_min_carried: 5,
  drifter_flee_ticks: 240,
  drifter_drop_vanish_ticks: 120,

  // Bùa Gió (Wind Charm)
  charm_duration_ticks: 600,
  charm_speed: 7.2,
  charm_respawn_ticks: 2700,

  // Máu & Điểm số
  flames: 3,
  score: {
    per_mote: 10,
    per_lantern: 100,
    per_stun: 5,
    per_second_left: 2,
    per_flame_left: 50
  },

  // Tần số mô phỏng
  tickRate: 60
};
