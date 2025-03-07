// Zombie.js
import * as THREE from "three";
import { Pathfinder } from "./Pathfinder.js";

export class Zombie {
  constructor(scene, player, game, obstacles) {
    this.scene = scene;
    this.player = player;
    this.game = game;
    this.obstacles = obstacles;
    this.health = 100;
    this.speed = 2 + Math.random(); // Slight speed variation
    this.model = this.createModel();
    this.scene.add(this.model);
    this.collided = false; // Flag to prevent continuous damage
    this.pathUpdateInterval = 20; // Update path every 20 frames
    this.pathUpdateCounter = 0;
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
    // Only update if counter reaches interval
    this.pathUpdateCounter += 1;
    if (this.pathUpdateCounter >= this.pathUpdateInterval) {
      this.pathUpdateCounter = 0;
      const pathfinder = new Pathfinder(
        this.scene,
        this.model.position,
        this.player.position,
        this.obstacles
      );
      const path = pathfinder.findPath();

      if (path.length > 1) {
        const nextPoint = path[1]; // 0 is current position, 1 is the next
        const direction = new THREE.Vector3();
        direction.subVectors(nextPoint, this.model.position).normalize();
        this.model.position.addScaledVector(direction, this.speed * delta);
      }
    }

    // Bounding box collision detection
    const playerPosition = this.player.position;
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
    const zombieBox = new THREE.Box3().setFromObject(this.model);
    if (playerBox.intersectsBox(zombieBox)) {
      if (!this.collided) {
        this.game.health -= 10; // Reduce health on collision
        this.collided = true; // Set flag
      }
    } else {
      this.collided = false; // Reset flag when no longer colliding
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
