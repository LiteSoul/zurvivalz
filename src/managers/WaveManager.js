import { AmmoMagazine } from "../entities/items/AmmoMagazine.js";
import * as THREE from "three";
import ZombieWalker from "../entities/zombies/ZombieWalker.js";
import ZombieRunner from "../entities/zombies/ZombieRunner.js";
import ZombieTank from "../entities/zombies/ZombieTank.js";
import ZombieJumper from "../entities/zombies/ZombieJumper.js";
import ZombieSpitter from "../entities/zombies/ZombieSpitter.js";

export class WaveManager {
  constructor(scene, playerCamera, game) {
    this.scene = scene;
    this.playerCamera = playerCamera;
    this.game = game; // Reference to Game instance for health access
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
    const zombieCount = this.wave * 3; // Increasing difficulty, wave 1 = 3, wave 2 = 6...
    const zombieTypes = [
      ZombieWalker,
      ZombieRunner,
      ZombieTank,
      ZombieJumper,
      ZombieSpitter,
    ];
    for (let i = 0; i < zombieCount; i++) {
      const randomIndex = Math.floor(Math.random() * zombieTypes.length);
      const ZombieClass = zombieTypes[randomIndex];
      const zombie = new ZombieClass(this.scene, this.playerCamera, this.game);
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

    // Remove dead zombies from the array
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      if (this.zombies[i].health <= 0) {
        this.game.incrementKillCount(); // Increment kill count when zombie dies
        this.zombies.splice(i, 1);
      }
    }
  }
}
