import * as THREE from "three";

export class PhysicsManager {
  constructor(controls, inputManager) {
    this.controls = controls;
    this.inputManager = inputManager;
    this.moveSpeed = 10; // Units per second
    this.jumpSpeed = 10; // Initial jump velocity
    this.gravity = -30; // Gravity acceleration
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.canJump = false;
  }

  update(delta) {
    this.velocity.y += this.gravity * delta;
    const player = this.controls.object;
    player.position.y += this.velocity.y * delta;
    if (player.position.y < 1.6) {
      player.position.y = 1.6;
      this.velocity.y = 0;
      this.canJump = true;
    }
    if (this.controls.isLocked) {
      if (this.inputManager.moveForward)
        player.translateZ(-this.moveSpeed * delta);
      if (this.inputManager.moveBackward)
        player.translateZ(this.moveSpeed * delta);
      if (this.inputManager.moveLeft)
        player.translateX(-this.moveSpeed * delta);
      if (this.inputManager.moveRight)
        player.translateX(this.moveSpeed * delta);
    }
  }
}
