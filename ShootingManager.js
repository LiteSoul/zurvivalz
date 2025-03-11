import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { AudioManager } from "./AudioManager.js";

export class ShootingManager {
  constructor(camera, scene, waveManager, ui, audioManager, game) {
    this.camera = camera;
    this.scene = scene;
    this.waveManager = waveManager;
    this.ui = ui;
    this.game = game;
    this.audioManager = audioManager; // Store the AudioManager instance
    this.canShoot = true;
    this.shootCooldown = 0.5;
    this.crosshairRaycaster = new THREE.Raycaster();
    //this.ammo = ammo; // Initialize ammo, NO NEED, its in the game instance
    this.setupGunModel();
    console.log("ShootingManager constructor:", this.audioManager); // Debug log
  }

  setupGunModel() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
    this.gun = new THREE.Mesh(geometry, material);
    this.gun.position.set(0.3, -0.3, -0.5); // Position relative to camera
    this.camera.add(this.gun); // Add as child of camera
  }

  shoot() {
    console.log("ShootingManager shoot:", this.audioManager); // Debug log

    if (!this.canShoot || !this.game.hasAmmo()) return;

    this.game.decreaseAmmo();
    this.ui.updateAmmo(this.game.ammo);
    this.canShoot = false;
    setTimeout(() => (this.canShoot = true), this.shootCooldown * 200);

    // Play shooting sound using AudioManager
    this.audioManager.playShootSound();

    // Raycasting for hit detection
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    raycaster.set(this.camera.position, direction);
    raycaster.camera = this.camera; // Set the camera property for sprite raycasting

    const intersects = raycaster.intersectObjects(
      this.waveManager.zombies.map((zombie) => zombie.model),
      true
    ); // Check for intersections with zombie models.

    if (intersects.length > 0) {
      const intersectedZombie = this.waveManager.zombies.find(
        (zombie) => zombie.model.uuid === intersects[0].object.uuid
      );

      if (intersectedZombie) {
        intersectedZombie.takeDamage(25); // Adjust damage to 25
      }

      // Draw a line to represent the shot
      const material = new LineMaterial({ color: 0xffff00, linewidth: 2 }); // Yellow, thicker line.  Use linewidth in world units
      const points = [];
      const startPoint = this.gun.getWorldPosition(new THREE.Vector3());
      const endPoint = intersects[0].point.clone(); // Clone to avoid modifying the original
      points.push(startPoint.x, startPoint.y, startPoint.z);
      points.push(endPoint.x, endPoint.y, endPoint.z); // Start at the correct end point

      const geometry = new LineGeometry();
      geometry.setPositions(points);
      const line = new Line2(geometry, material);
      this.scene.add(line);

      // Animate the line's opacity
      const startTime = Date.now();
      const duration = 100; // Animation duration in milliseconds
      const animateShot = () => {
        const elapsed = Date.now() - startTime;
        const fraction = Math.min(elapsed / duration, 1); // Clamp to 1

        // Fade out the line
        material.opacity = 1 - fraction;
        material.transparent = true; // Need this for opacity to work
        material.needsUpdate = true;

        if (fraction < 1) {
          requestAnimationFrame(animateShot);
        } else {
          this.scene.remove(line); // Remove the line when animation is complete
        }
      };
      animateShot();
    } else {
      // If no intersection, draw a line to a reasonable distance and animate
      const material = new LineMaterial({ color: 0xffff00, linewidth: 2 }); // Yellow, thicker line
      const points = [];
      const startPoint = this.gun.getWorldPosition(new THREE.Vector3());
      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      const endPoint = startPoint.clone().add(direction.multiplyScalar(50)); // Extend 50 units
      points.push(startPoint.x, startPoint.y, startPoint.z);
      points.push(endPoint.x, endPoint.y, endPoint.z);

      const geometry = new LineGeometry();
      geometry.setPositions(points);

      const line = new Line2(geometry, material);
      this.scene.add(line);

      // Animate the line's  opacity
      const startTime = Date.now();
      const duration = 100; // Animation duration in milliseconds

      const animateShot = () => {
        const elapsed = Date.now() - startTime;
        const fraction = Math.min(elapsed / duration, 1);

        material.opacity = 1 - fraction;
        material.transparent = true;
        material.needsUpdate = true;

        if (fraction < 1) {
          requestAnimationFrame(animateShot);
        } else {
          this.scene.remove(line);
        }
      };
      animateShot();
    }

    // Muzzle flash
    const flash = new THREE.PointLight(0xffffff, 1, 50);
    flash.position.set(0, 0, -1);
    this.camera.add(flash);
    setTimeout(() => this.camera.remove(flash), 50);

    // Shooting animation
    const originalGunPosition = this.gun.position.clone();
    const recoilDistance = 0.1;
    this.gun.position.z += recoilDistance;
    setTimeout(() => {
      this.gun.position.copy(originalGunPosition);
    }, 150);
  }

  updateCrosshair() {
    const crosshairDirection = new THREE.Vector3();
    this.camera.getWorldDirection(crosshairDirection);
    this.crosshairRaycaster.set(this.camera.position, crosshairDirection);
    this.crosshairRaycaster.camera = this.camera;

    const crosshairIntersects = this.crosshairRaycaster.intersectObjects(
      this.waveManager.zombies.map((zombie) => zombie.model),
      true
    );
    const crosshair = document.getElementById("crosshair"); // Get the crosshair element by ID
    if (crosshairIntersects.length > 0) {
      crosshair.style.backgroundColor = "red";
    } else {
      crosshair.style.backgroundColor = "green";
    }
  }
}
