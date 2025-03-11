// WaveManager.js
import { AmmoMagazine } from "./AmmoMagazine.js";
import * as THREE from "three";
import ZombieWalker from "./zombies/ZombieWalker.js";
import ZombieRunner from "./zombies/ZombieRunner.js";
import ZombieTank from "./zombies/ZombieTank.js";
import ZombieJumper from "./zombies/ZombieJumper.js";
import ZombieSpitter from "./zombies/ZombieSpitter.js";

export class WaveManager {
  constructor(scene, camera, game) {
    this.scene = scene;
    this.camera = camera;
    this.game = game; //Game instance needed for score and ammo
    this.zombies = [];
    this.ammoMagazines = [];
    this.wave = 0;
    this.spawnInterval = 5000; //Milliseconds
    this.nextSpawnTime = Date.now() + this.spawnInterval;
    this.zombieTypes = [
      ZombieWalker,
      ZombieRunner,
      ZombieTank,
      ZombieJumper,
      ZombieSpitter,
    ]; // Array of zombie classes.
  }
  spawnWave() {
    this.wave++;
    const numZombies = Math.floor(this.wave * 1.5);
    for (let i = 0; i < numZombies; i++) {
      const randomZombieType =
        this.zombieTypes[Math.floor(Math.random() * this.zombieTypes.length)];
      const zombie = new randomZombieType(this.scene, this.camera);
      zombie.createModel();
      this.zombies.push(zombie);
    }
  }

  spawnAmmo() {
    const x = Math.random() * 40 - 20; // Random position between -20 and 20
    const z = Math.random() * 40 - 20;
    const position = new THREE.Vector3(x, 1, z); // Assuming ground is at y=0
    const ammoMagazine = new AmmoMagazine(this.scene, position);
    ammoMagazine.createModel();
    this.ammoMagazines.push(ammoMagazine);
  }

  setUI(ui) {
    this.ui = ui;
  }

  update(delta) {
    const currentTime = Date.now();
    if (currentTime > this.nextSpawnTime) {
      this.spawnWave();
      this.spawnAmmo();
      this.nextSpawnTime = currentTime + this.spawnInterval;
    }
    this.zombies.forEach((zombie) => zombie.update(delta));

    // Check for dead zombies, update score, and remove them.
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      if (this.zombies[i].isDead()) {
        this.game.score += this.zombies[i].scoreValue; // Access score through game instance
        this.scene.remove(this.zombies[i].model);
        this.zombies.splice(i, 1);
      }
    }

    if (this.ammoMagazines) {
      //Removed this.waveManager since it doesn't exist
      const playerPosition = this.camera.position;
      const playerSize = 1; // Approximate player size
      const playerBox = new THREE.Box3(
        new THREE.Vector3(
          playerPosition.x - playerSize / 2,
          playerPosition.y - playerSize / 2,
          playerPosition.z - playerSize / 2
        ),
        new THREE.Vector3(
          playerPosition.x + playerSize / 2,
          playerPosition.y + playerSize / 2,
          playerPosition.z + playerSize / 2
        )
      );

      this.ammoMagazines.forEach((magazine) => {
        //Removed this.waveManager
        if (!magazine.collected) {
          const magazineBox = new THREE.Box3().setFromObject(magazine.model);
          if (playerBox.intersectsBox(magazineBox)) {
            this.game.ammo += 10;
            this.ui.updateAmmo(this.game.ammo);
            this.ammoMagazines.splice(
              //Removed this.waveManager
              this.ammoMagazines.indexOf(magazine), //Removed this.waveManager
              1
            );
            this.scene.remove(magazine.model);
            magazine.collected = true;
          }
        }
      });
    }
  }
}
