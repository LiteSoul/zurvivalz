// WaveManager.js
import { Zombie } from "./Zombie.js";
import { AmmoMagazine } from "./AmmoMagazine.js";
import * as THREE from "three";

export class WaveManager {
  constructor(scene, playerCamera, game, obstacles) {
    this.scene = scene;
    this.playerCamera = playerCamera;
    this.game = game; // Reference to Game instance for health access
    this.obstacles = obstacles;
    this.wave = 0;
    this.zombies = [];
    this.spawnInterval = 10000; // New wave every 10 seconds
    this.nextSpawnTime = Date.now() + this.spawnInterval;
    this.spawnWave(); // Initial wave

    // Ammo spawning
    this.ammoMagazines = [];
    this.spawnAmmoInterval = 15000; // Spawn ammo every 15 seconds
    this.nextAmmoSpawnTime = Date.now() + this.spawnAmmoInterval;
    this.spawnAmmo(); // Initial ammo spawn
  }

  spawnWave() {
    this.wave++;
    const zombieCount = this.wave * 3; // Increasing difficulty
    for (let i = 0; i < zombieCount; i++) {
      const zombie = new Zombie(
        this.scene,
        this.playerCamera,
        this.game,
        this.obstacles
      );
      this.zombies.push(zombie);
    }
  }

  spawnAmmo() {
    const x = Math.random() * 40 - 20; // Random position between -20 and 20
    const z = Math.random() * 40 - 20;
    const position = new THREE.Vector3(x, 1, z); // Assuming ground is at y=0
    const ammoMagazine = new AmmoMagazine(this.scene, position);
    this.ammoMagazines.push(ammoMagazine);
  }

  update(delta) {
    // Update all zombies
    this.zombies.forEach((zombie) => zombie.update(delta));

    // Spawn new wave if all zombies are dead and time is up
    if (Date.now() > this.nextSpawnTime && this.zombies.length === 0) {
      this.spawnWave();
      this.nextSpawnTime = Date.now() + this.spawnInterval;
    }

    // Spawn ammo
    if (Date.now() > this.nextAmmoSpawnTime) {
      this.spawnAmmo();
      this.nextAmmoSpawnTime = Date.now() + this.spawnAmmoInterval;
    }
  }
}
