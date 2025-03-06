// Zombie.js
import * as THREE from "three";

export class Zombie {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.health = 100;
    this.speed = 2 + Math.random(); // Slight speed variation
    this.model = this.createModel();
    this.scene.add(this.model);
  }

  createModel() {
    // Simple green cube as zombie model
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const zombie = new THREE.Mesh(geometry, material);
    // Spawn randomly within 50 units of player
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 30;
    zombie.position.set(
      this.player.position.x + Math.cos(angle) * radius,
      1, // Center height
      this.player.position.z + Math.sin(angle) * radius
    );
    return zombie;
  }

  update(delta) {
    // Move toward player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.position, this.model.position).normalize();
    this.model.position.addScaledVector(direction, this.speed * delta);

    // Check collision with player
    const distance = this.model.position.distanceTo(this.player.position);
    if (distance < 1.5) {
      this.player.health -= 10 * delta; // Damage scaled by time
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.scene.remove(this.model);
      return true; // Indicate zombie is dead
    }
    return false;
  }
}
