/**
 * Deterministic Seeded PRNG (Mulberry32)
 * Đảm bảo tính tất định 100%: cùng seed -> cùng dãy số ngẫu nhiên.
 */
export class SeededRNG {
  constructor(seed = 123456789) {
    this.seed = (seed >>> 0);
  }

  /**
   * Sinh số thực trong khoảng [0, 1)
   */
  nextFloat() {
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Sinh số nguyên trong khoảng [min, max]
   */
  nextInt(min, max) {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }
}
