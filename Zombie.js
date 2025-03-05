// Zombie.js
import * as THREE from "three";

export class Zombie {
  constructor(scene, player, spawnPosition) {
    this.scene = scene;
    this.player = player;
    this.health = 100;
    this.speed = 2 + Math.random(); // Slight variation for realism
    this.model = this.createModel(spawnPosition);
    this.scene.add(this.model);
  }

  createModel(spawnPosition) {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const zombie = new THREE.Mesh(geometry, material);
    zombie.position.copy(
      spawnPosition ||
        new THREE.Vector3(Math.random() * 100 - 50, 1, Math.random() * 100 - 50)
    );
    return zombie;
  }

  update(delta) {
    // Advanced movement (simplified A* substitute)
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.position, this.model.position).normalize();
    this.model.position.addScaledVector(direction, this.speed * delta);
    this.checkCollision();
  }

  checkCollision() {
    const distance = this.model.position.distanceTo(this.player.position);
    if (distance < 1.5) {
      this.player.health -= 10 * 0.016; // Consistent damage per frame
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.scene.remove(this.model);
      return true;
    }
    return false;
  }
}
