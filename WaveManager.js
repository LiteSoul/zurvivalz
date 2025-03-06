// WaveManager.js
import { Zombie } from "./Zombie.js";

export class WaveManager {
  constructor(scene, player, game) {
    this.scene = scene;
    this.player = player;
    this.game = game; // Reference to Game instance for health access
    this.wave = 0;
    this.zombies = [];
    this.spawnInterval = 10000; // New wave every 10 seconds
    this.nextSpawnTime = Date.now() + this.spawnInterval;
    this.spawnWave(); // Initial wave
  }

  spawnWave() {
    this.wave++;
    const zombieCount = this.wave * 3; // Increasing difficulty
    for (let i = 0; i < zombieCount; i++) {
      const zombie = new Zombie(this.scene, this.player);
      this.zombies.push(zombie);
    }
  }

  update(delta) {
    // Update all zombies
    this.zombies.forEach((zombie) => zombie.update(delta));

    // Spawn new wave if all zombies are dead and time is up
    if (Date.now() > this.nextSpawnTime && this.zombies.length === 0) {
      this.spawnWave();
      this.nextSpawnTime = Date.now() + this.spawnInterval;
    }
  }
}
