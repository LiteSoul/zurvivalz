// main.js
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { WaveManager } from "./WaveManager.js";
import { UI } from "./UI.js";

class Game {
  constructor() {
    // Scene, camera, renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // First-person controls
    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );
    this.scene.add(this.controls.object);
    this.camera.position.y = 1.6; // Eye level height

    // Movement states
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

    // Clock for smooth timing
    this.clock = new THREE.Clock();

    // Shooting states
    this.canShoot = true;
    this.shootCooldown = 0.5;
    this.score = 0;
    this.isGameOver = false;

    this.waveManager = new WaveManager(this.scene, this.controls.object);
    this.ui = new UI();

    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    this.scene.add(new THREE.AmbientLight(0x404040));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    this.setupEventListeners();

    // Start the game loop
    this.animate();
  }

  setupEventListeners() {
    document.addEventListener("click", () => this.controls.lock());
    document.addEventListener("mousedown", () => this.shoot());
  }

  shoot() {
    if (!this.controls.isLocked || !this.canShoot || this.isGameOver) return;
    this.canShoot = false;
    setTimeout(() => (this.canShoot = true), this.shootCooldown * 1000);

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
        this.waveManager.zombies = this.waveManager.zombies.filter(
          (z) => z !== zombie
        );
        this.score += 10;
      }
    }
  }

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

  update() {
    if (this.isGameOver) return;

    const delta = this.clock.getDelta();

    this.velocity.y += this.gravity * delta;
    this.controls.object.position.y += this.velocity.y * delta;
    if (this.controls.object.position.y < 1.6) {
      this.controls.object.position.y = 1.6;
      this.velocity.y = 0;
    }

    this.waveManager.update(delta);
    this.waveManager.zombies.forEach((zombie) => zombie.update(delta));

    this.ui.updateHealth(this.health);
    this.ui.updateScore(this.score);

    if (this.health <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.ui.showGameOver(() => this.restart());
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const game = new Game();
