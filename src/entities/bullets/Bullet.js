import * as THREE from "three";

export class Bullet {
  constructor(scene, position, velocity) {
    this.scene = scene;
    this.velocity = velocity;
    this.model = this.createModel();
    this.model.position.copy(position);
    this.scene.add(this.model);
    this.lifetime = 100; // Remove bullet after a certain distance/time
  }

  createModel() {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    return new THREE.Mesh(geometry, material);
  }

  update(delta) {
    this.model.position.add(this.velocity.clone().multiplyScalar(delta));
    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      return true; // Signal for removal
    }
    return false; // Signal that bullet is still active
  }
  checkCollision(zombies, game) {
    for (let i = zombies.length - 1; i >= 0; i--) {
      const zombie = zombies[i];
      const distance = this.model.position.distanceTo(zombie.model.position);
      if (distance < 0.5) {
        if (zombie.takeDamage(20)) {
          zombies.splice(i, 1);
          game.scene.remove(zombie.model);
          game.score += 10;
          game.ui.updateScore(game.score);
        }
        return true;
      }
    }
    return false;
  }
}
