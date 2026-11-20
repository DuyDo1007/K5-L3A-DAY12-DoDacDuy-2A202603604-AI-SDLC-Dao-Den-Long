/**
 * Định nghĩa thực thể cho thế giới Đảo Đèn Lồng
 */

export class Player {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.carryingFireflies = 0;
    this.isAlive = true;
    this.hitCount = 0;
  }

  moveTo(x, z) {
    this.x = x;
    this.z = z;
  }
}

export class Firefly {
  constructor(id, x = 0, y = 0.5, z = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.collected = false;
  }
}

export class GreatLantern {
  constructor(id, x = 0, y = 0, z = 0, required = 3) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.required = required;
    this.fireflies = 0;
    this.isLit = false;
  }

  deposit(amount) {
    const needed = this.required - this.fireflies;
    const deposited = Math.min(needed, amount);
    this.fireflies += deposited;
    if (this.fireflies >= this.required) {
      this.isLit = true;
    }
    return deposited;
  }
}

export class InkShadow {
  constructor(id, x = 0, y = 0, z = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.state = 'patrol'; // 'patrol' | 'chase'
    this.patrolDirX = 1;
    this.patrolDirZ = 0;
  }
}
