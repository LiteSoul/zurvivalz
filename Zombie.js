// Zombie.js
import * as THREE from "three";

export class Zombie {
  constructor(scene, player, game) {
    this.scene = scene;
    this.player = player;
    this.game = game;
    this.health = 100;
    this.speed = 2 + Math.random(); // Slight speed variation
    this.model = this.createModel();
    this.scene.add(this.model);
    this.collided = false; // Flag to prevent continuous damage
  }

  createModel() {
    // Load the zombie sprite texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/zombie.png");

    // Create the sprite material
    const material = new THREE.SpriteMaterial({ map: texture });

    // Create the sprite
    const sprite = new THREE.Sprite(material);

    // Scale the sprite (adjust as needed)
    sprite.scale.set(0.01 * 128, 0.01 * 168, 1);

    // Spawn randomly within 50 units of player
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 30;
    sprite.position.set(
      this.player.position.x + Math.cos(angle) * radius,
      0.84, // Center height to align with ground:  y = 1.68 / 2 = 0.84.
      this.player.position.z + Math.sin(angle) * radius
    );
    return sprite;
  }

  update(delta) {
    // Move toward player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.position, this.model.position).normalize();
    this.model.position.addScaledVector(direction, this.speed * delta);

    // Simplified collision detection (distance-based)
    const distance = this.model.position.distanceTo(this.player.position);
    if (distance < 1) {
      // Adjust collision distance as needed
      if (!this.collided) {
        this.game.health -= 10;
        this.collided = true;
      }
    } else {
      this.collided = false;
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
