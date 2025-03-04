import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Zombie } from "./Zombie.js";
import { WaveManager } from "./WaveManager.js"; // Ensure WaveManager is included
import { UI } from "./UI.js"; // Ensure UI is included

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

    // WaveManager and UI initialization (Phases 4, 5)
    this.waveManager = new WaveManager(this.scene, this.controls.object, this);
    this.ui = new UI();

    // Environment and objects (Phase 2)
    this.setupEnvironment();
    this.addTestObjects();

    // Audio for shooting (Phase 2)
    this.setupAudio();

    // Crosshair (Phase 2)
    this.setupCrosshair();

    // Event listeners (Phase 2)
    this.setupEventListeners();

    // Start game loop
    this.animate();
  }

  // Environment setup (Phase 2)
  setupEnvironment() {
    this.scene.background = new THREE.Color(0x87ceeb);
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load("/ground.jpg");
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
    audioLoader.load("/shoot.wav", (buffer) => {
      this.shootSound.setBuffer(buffer);
      this.shootSound.setVolume(0.5);
    });
  }

  // Crosshair (Phase 2)
  setupCrosshair() {
    const crosshair = document.createElement("div");
    crosshair.style.position = "absolute";
    crosshair.style.top = "50%";
    crosshair.style.left = "50%";
    crosshair.style.width = "10px";
    crosshair.style.height = "10px";
    crosshair.style.backgroundColor = "white";
    crosshair.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(crosshair);
  }

  // Event listeners (Phase 2)
  setupEventListeners() {
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
    document.addEventListener("mousedown", () => this.shoot());

    const blocker = document.createElement("div");
    blocker.id = "blocker";
    blocker.style.position = "absolute";
    blocker.style.width = "100%";
    blocker.style.height = "100%";
    blocker.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    blocker.style.display = "flex";
    blocker.style.justifyContent = "center";
    blocker.style.alignItems = "center";
    blocker.innerHTML =
      '<div style="color: white; font-size: 24px;">Click to Play</div>';
    document.body.appendChild(blocker);

    blocker.addEventListener("click", () => this.controls.lock());
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.controls.isLocked = true;
        blocker.style.display = "none";
      } else {
        this.controls.isLocked = false;
        blocker.style.display = "flex";
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
    if (!this.controls.isLocked || !this.canShoot || this.isGameOver) return;

    this.canShoot = false;
    setTimeout(() => (this.canShoot = true), this.shootCooldown * 1000);

    // Play shooting sound (Phase 2)
    if (this.shootSound.isPlaying) this.shootSound.stop();
    this.shootSound.play();

    // Raycasting to hit zombies (Phase 4)
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = raycaster.intersectObjects(
      this.waveManager.zombies.map((z) => z.model)
    );
    if (intersects.length > 0) {
      const zombie = this.waveManager.zombies.find(
        (z) => z.model === intersects[0].object
      );
      if (zombie && zombie.takeDamage(20)) {
        // Assume Zombie.js has takeDamage()
        this.waveManager.zombies = this.waveManager.zombies.filter(
          (z) => z !== zombie
        );
        this.scene.remove(zombie.model); // Remove from scene
        this.score += 10; // Increase score
        this.ui.updateScore(this.score); // Update UI immediately
      }
    }

    // Muzzle flash (Phase 2)
    const flash = new THREE.PointLight(0xffffff, 1, 50);
    flash.position.set(0, 0, -1);
    this.camera.add(flash);
    setTimeout(() => this.camera.remove(flash), 50);
  }

  // Game loop (Phases 2, 3, 4, 5)
  update() {
    if (this.isGameOver) return;

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

    // Update UI with health and score (Phase 5)
    this.ui.updateHealth(this.health);
    this.ui.updateScore(this.score);

    // Check for game over (Phase 5)
    if (this.health <= 0) {
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

  // Animation loop (Phase 2)
  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game
const game = new Game();
