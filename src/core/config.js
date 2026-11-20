/**
 * Cấu hình tham số mô phỏng lõi cho Đảo Đèn Lồng (Phase 1: Test Contract v1.0)
 */
export const DEFAULT_CONFIG = {
  // Bản đồ & Màn chơi
  islandRadius: 35.0,
  night1_duration_s: 300,
  lantern_count_night1: 5,

  // Nhân vật Mây (Player)
  player_speed: 5.0, // mét/giây
  carry_capacity: 5,
  pickup_radius: 1.5,
  interact_radius: 2.5,
  flames: 3,
  invuln_s: 1.5,
  hit_drop_ratio: 0.5,

  // Tỏa sáng (Pulse)
  pulse_cost: 1, // tiêu tốn 1 đom đóm
  pulse_radius: 6.0,
  pulse_stun_s: 3.0,
  pulse_push_m: 4.0,
  pulse_cooldown_s: 2.0,

  // Đèn Lồng Lớn (Lanterns)
  lantern_cost: 3, // số đom đóm cần nạp để thắp sáng
  safe_radius: 4.0, // vùng an toàn quanh đèn lồng đã thắp hoặc đang thắp

  // Bóng Mực (Shades)
  shade_speed: 2.5,
  shade_hit_radius: 1.0,
  fall_enabled: false,

  // Điểm số (Score)
  score: {
    per_mote: 10,
    per_lantern: 100,
    per_stun: 20,
    per_second_left: 2,
    per_flame_left: 50
  },

  // Fixed Timestep: 60 ticks / giây (1/60s = 0.016666667s)
  tickRate: 60
};
