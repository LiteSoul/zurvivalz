import * as THREE from "three";
import { WaveManager } from "./WaveManager.js"; // Manages zombie spawning and updates
import { UI } from "./UI.js"; // Handles health, score, and game over UI
import { AudioManager } from "./AudioManager.js";
import { InputManager } from "./InputManager.js";
import { PhysicsManager } from "./PhysicsManager.js";
import { ShootingManager } from "./ShootingManager.js";
import { SceneManager } from "./SceneManager.js";

class Game {
  constructor() {
    // Scene Manager (Phase 2)
    this.sceneManager = new SceneManager(this);
    this.camera = this.sceneManager.getCamera(); // Get the camera from SceneManager
    this.camera.position.y = 1.6; // Eye level height

    // Input Manager (Phase 2)
    this.inputManager = new InputManager(this.camera, document.body, this); // Pass camera and renderer domElement and game instance
    this.controls = this.inputManager.getControls(); // Get controls from InputManager
    this.scene = this.sceneManager.getScene();
    this.scene.add(this.controls.object);
    this.renderer = this.sceneManager.getRenderer();

    // Clock for smooth timing (Phase 2)
    this.clock = new THREE.Clock();

    // Player properties (Phases 3, 4, 5)
    this.health = 100;
    this.score = 0;
    this.isGameOver = false;
    this.isStarted = false;
    this.isPaused = false;

    // Ammo System
    this._ammo = 20;

    // WaveManager and UI initialization (Phases 4, 5)
    this.waveManager = new WaveManager(this.scene, this.camera, this);
    this.ui = new UI(this); // Pass the Game instance to UI
    this.waveManager.setUI(this.ui); //Pass UI to waveManager

    // Physics Manager
    this.physicsManager = new PhysicsManager(this.controls, this.inputManager);

    // Audio Manager (Phase 2)
    this.audioManager = new AudioManager(this.camera);

    // Shooting Manager, now receives the game instance
    this.shootingManager = new ShootingManager(
      this.camera,
      this.scene,
      this.waveManager,
      this.ui,
      this.audioManager,
      this //passing the game instance
    );

    // Crosshair (Phase 2)
    this.setupCrosshair();

    // Event listeners (Phase 2)
    this.setupEventListeners();

    // Start game loop
    this.animate();

    // Bullets array (Phase 2)
    this.bullets = [];
  }

  // Method to check if there's ammo
  hasAmmo() {
    return this._ammo > 0;
  }

  // Method to decrease ammo
  decreaseAmmo() {
    if (this._ammo > 0) {
      this._ammo--;
    }
  }

  // Method to increase ammo
  increaseAmmo(amount) {
    this._ammo += amount;
  }

  // Crosshair (Phase 2)
  setupCrosshair() {
    const crosshair = document.createElement("div");
    crosshair.id = "crosshair"; // Add an ID
    crosshair.style.position = "absolute";
    crosshair.style.top = "50%";
    crosshair.style.left = "50%";
    crosshair.style.width = "4px";
    crosshair.style.height = "4px";
    crosshair.style.backgroundColor = "red";
    crosshair.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(crosshair);
  }

  // Event listeners (Phase 2, modified for Start/Resume button)
  setupEventListeners() {
    document.addEventListener("mousedown", () => this.shootingManager.shoot());

    // Add Start button instead of full-screen blocker
    const startButton = document.createElement("button");
    startButton.id = "startButton";
    startButton.innerText = "Start"; // Initial text
    startButton.style.position = "absolute";
    startButton.style.top = "50%";
    startButton.style.left = "50%";
    startButton.style.transform = "translate(-50%, -50%)";
    startButton.style.padding = "15px 30px";
    startButton.style.fontSize = "24px";
    startButton.style.backgroundColor = "#4CAF50"; // Green
    startButton.style.color = "white";
    startButton.style.border = "none";
    startButton.style.borderRadius = "5px";
    startButton.style.cursor = "pointer";
    document.body.appendChild(startButton);

    startButton.addEventListener("click", () => {
      this.controls.lock(); // Lock pointer to start game
      startButton.style.display = "none"; // Hide button
      if (!this.isStarted) {
        this.isStarted = true;
        this.animate(); // Start the game loop
      } else if (this.isPaused) {
        this.isPaused = false; // Resume if paused
        this.animate(); // Restart the animation loop
      }
    });
  }

  // Game loop (Phases 2, 3, 4, 5)
  update() {
    if (this.isGameOver || this.isPaused) return; // Skip updates if paused or game over

    const delta = this.clock.getDelta();

    this.physicsManager.update(delta); // Add this line to update physics

    // Update WaveManager for zombie spawning and movement (Phases 3, 4)
    this.waveManager.update(delta);

    // Ammo collection
    if (this.waveManager && this.waveManager.ammoMagazines) {
      const playerPosition = this.controls.object.position;
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

      this.waveManager.ammoMagazines.forEach((magazine) => {
        if (!magazine.collected) {
          const magazineBox = new THREE.Box3().setFromObject(magazine.model);
          if (playerBox.intersectsBox(magazineBox)) {
            this.ammo += 10;
            this.ui.updateAmmo(this.ammo);
            this.waveManager.ammoMagazines.splice(
              this.waveManager.ammoMagazines.indexOf(magazine),
              1
            );
            this.scene.remove(magazine.model);
            magazine.collected = true;
          }
        }
      });
    }

    // Update UI with health and score (Phase 5)
    this.ui.updateHealth(this.health);
    this.ui.updateScore(this.score);
    //this.ui.updateAmmo(this.ammo); //REMOVED

    this.shootingManager.updateCrosshair();

    // Check for game over (Phase 5)
    if (this.health <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.ui.showGameOver(() => this.restart());
    }
  }

  // Restart game (Phase 5)
  restart() {
    this.health = 100;
    this.score = 0;
    this.isGameOver = false;
    this.waveManager.zombies.forEach((zombie) =>
      this.scene.remove(zombie.model)
    );
    this.waveManager.zombies = [];
    this.waveManager.wave = 0;
    this.waveManager.nextSpawnTime =
      Date.now() + this.waveManager.spawnInterval;
    this.ui.hideGameOver();
  }

  // Method to toggle pause state and update UI
  togglePause(isPaused) {
    this.isPaused = isPaused;
    if (this.isPaused) {
      this.ui.showStartButton(this.isStarted); // Show "Resume" if game started
      this.clock.stop();
    } else {
      this.ui.hideStartButton();
      this.clock.start();
      this.animate(); // Restart the animation loop when unpausing
    }
  }

  // Animation loop (Phase 2, modified for start and pause)
  animate() {
    if (!this.isStarted || this.isPaused) return; // Exit if not started or paused
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game
const game = new Game();
