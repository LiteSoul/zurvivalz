import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { WaveManager } from "../managers/WaveManager.js"; // Manages zombie spawning and updates
import { UI } from "../ui/UI.js"; // Handles health, score, and game over UI

class Game {
  constructor() {
    // Scene, camera, renderer (Phase 2)
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // First-person controls (Phase 2)
    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );
    this.scene.add(this.controls.object);
    this.camera.position.y = 1.6; // Eye level height

    // Movement states (Phase 2)
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.moveSpeed = 10; // Units per second
    this.jumpSpeed = 10; // Initial jump velocity
    this.gravity = -30; // Gravity acceleration
    // Velocity for jumping
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Clock for smooth timing (Phase 2)
    this.clock = new THREE.Clock();

    // Shooting states (Phase 2)
    this.canShoot = true;
    this.shootCooldown = 0.5;

    // Player properties (Phases 3, 4, 5)
    this.health = 100;
    this.score = 0;
    this.isGameOver = false;
    this.isStarted = false;
    this.isPaused = false;

    // Kill count
    this.killCount = 0;

    // Method to increment kill count
    this.incrementKillCount = () => {
      this.killCount++;
    };

    // Ammo System
    this.ammo = 20;

    // WaveManager and UI initialization (Phases 4, 5)
    this.waveManager = new WaveManager(this.scene, this.camera, this);
    this.ui = new UI(this); // Pass the Game instance to UI

    // Environment and objects (Phase 2)
    this.setupEnvironment();
    this.addTestObjects();

    // Audio for shooting (Phase 2)
    this.setupAudio();

    // Crosshair (Phase 2)
    this.setupCrosshair();

    // Raycaster for crosshair color change
    this.crosshairRaycaster = new THREE.Raycaster();

    // Gun Model (Phase 2)
    this.setupGunModel();

    // Event listeners (Phase 2)
    this.setupEventListeners();

    // Start game loop
    this.animate();

    // Bullets array (Phase 2)
    this.bullets = [];
  }

  // Environment setup (Phase 2)
  setupEnvironment() {
    this.scene.background = new THREE.Color(0x87ceeb);
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load(
      "assets/images/environment/textures/ground.jpg"
    );
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100);
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  // Test objects (Phase 2)
  addTestObjects() {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const positions = [
      [0, 0.5, 0],
      [5, 0.5, 0],
      [0, 0.5, 5],
      [-5, 0.5, -5],
    ];
    positions.forEach((pos) => {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(pos[0], pos[1], pos[2]);
      this.scene.add(cube);
    });
  }

  // Audio setup (Phase 2)
  setupAudio() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    this.shootSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("assets/audio/weapons/shoot.wav", (buffer) => {
      this.shootSound.setBuffer(buffer);
      this.shootSound.setVolume(0.5);
    });
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
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
    document.addEventListener("mousedown", () => this.shoot());

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

    // Handle pointer lock changes (e.g., ESC key)
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.isPaused = false; // Resume on lock
        this.clock.start(); // Resume clock
      } else {
        // If pointer unlocks (e.g., via ESC), pause and show Start/Resume button unless game over
        if (!this.isGameOver) {
          this.isPaused = true;
          this.clock.stop(); // Stop clock to prevent delta accumulation
          startButton.innerText = this.isStarted ? "Resume" : "Start"; // Toggle text
          startButton.style.display = "block";
        }
      }
    });

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Keyboard controls (Phase 2)
  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
      case "KeyA":
        this.moveLeft = true;
        break;
      case "KeyD":
        this.moveRight = true;
        break;
      case "Space":
        if (this.canJump) {
          this.velocity.y = this.jumpSpeed;
          this.canJump = false;
        }
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      case "KeyA":
        this.moveLeft = false;
        break;
      case "KeyD":
        this.moveRight = false;
        break;
    }
  }

  // Shooting with zombie damage (Phases 2 and 4)
  shoot() {
    if (
      !this.controls.isLocked ||
      !this.canShoot ||
      this.isGameOver ||
      this.ammo <= 0
    )
      return;

    this.ammo--;
    this.ui.updateAmmo(this.ammo);
    this.canShoot = false;
    setTimeout(() => (this.canShoot = true), this.shootCooldown * 200);

    // Play shooting sound
    if (this.shootSound.isPlaying) this.shootSound.stop();
    this.shootSound.play();

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
      const material = new LineMaterial({ color: 0xffff00, linewidth: 2 }); // Yellow, thicker line. Use linewidth in world units
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

  // Gun Model Setup (Phase 2)
  setupGunModel() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
    this.gun = new THREE.Mesh(geometry, material);
    this.gun.position.set(0.3, -0.3, -0.5); // Position relative to camera
    this.camera.add(this.gun); // Add as child of camera
  }

  // Game loop (Phases 2, 3, 4, 5)
  update() {
    if (this.isGameOver || this.isPaused) return; // Skip updates if paused or game over

    const delta = this.clock.getDelta();

    // Player movement and physics (Phase 2)
    this.velocity.y += this.gravity * delta;
    const player = this.controls.object;
    player.position.y += this.velocity.y * delta;
    if (player.position.y < 1.6) {
      player.position.y = 1.6;
      this.velocity.y = 0;
      this.canJump = true;
    }
    if (this.controls.isLocked) {
      if (this.moveForward) player.translateZ(-this.moveSpeed * delta);
      if (this.moveBackward) player.translateZ(this.moveSpeed * delta);
      if (this.moveLeft) player.translateX(-this.moveSpeed * delta);
      if (this.moveRight) player.translateX(this.moveSpeed * delta);
    }

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
    this.ui.updateAmmo(this.ammo);
    this.ui.updateWave(this.waveManager.wave); // Update wave display
    this.ui.updateEnemyCount(this.waveManager.zombies.length); // Update enemy count
    this.ui.updateKillCount(this.killCount); // Update kill count

    // Raycast for crosshair color change
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
