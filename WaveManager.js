// WaveManager.js
import { Zombie } from "./Zombie.js";
import * as THREE from "three";

export class WaveManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.wave = 0;
    this.zombies = [];
    this.spawnInterval = 10000; // New wave every 10 seconds
    this.nextSpawnTime = Date.now() + this.spawnInterval;
  }

  update(delta) {
    if (Date.now() > this.nextSpawnTime && this.zombies.length === 0) {
      this.spawnWave();
      this.nextSpawnTime = Date.now() + this.spawnInterval;
    }
  }

  spawnWave() {
    this.wave++;
    const zombieCount = this.wave * 3; // Increase difficulty
    const spawnRadius = 50;

    for (let i = 0; i < zombieCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spawnPosition = new THREE.Vector3(
        Math.cos(angle) * spawnRadius,
        1,
        Math.sin(angle) * spawnRadius
      ).add(this.player.position);
      const zombie = new Zombie(this.scene, this.player, spawnPosition);
      this.zombies.push(zombie);
    }
  }
}
