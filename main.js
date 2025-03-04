import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
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
    this.shootCooldown = 0.5; // Seconds between shots

    // Set up environment and objects
    this.setupEnvironment();
    this.addTestObjects();

    // Set up audio for shooting
    this.setupAudio();

    // Set up crosshair
    this.setupCrosshair();

    // Event listeners
    this.setupEventListeners();

    // Start the game loop
    this.animate();
  }

  setupEnvironment() {
    // Sky color
    this.scene.background = new THREE.Color(0x87ceeb); // Light blue sky

    // Load and apply ground texture
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load("/ground.jpg");
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100); // Repeat texture for large ground

    // Create textured ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Lay flat
    ground.position.y = 0;
    this.scene.add(ground);

    // Add lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
    this.scene.add(ambientLight);
  }

  addTestObjects() {
    // Add red cubes for spatial reference and shooting targets
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

  setupEventListeners() {
    // Keyboard input
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));

    // Shooting input
    document.addEventListener("mousedown", () => this.shoot());

    // Pointer lock UI
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

    blocker.addEventListener("click", () => {
      this.controls.lock();
    });

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.controls.isLocked = true;
        blocker.style.display = "none";
      } else {
        this.controls.isLocked = false;
        blocker.style.display = "flex";
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

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

  shoot() {
    // Only shoot if pointer is locked and cooldown has expired
    if (!this.controls.isLocked || !this.canShoot) return;

    this.canShoot = false;
    setTimeout(() => {
      this.canShoot = true;
    }, this.shootCooldown * 1000);

    // Play shooting sound
    if (this.shootSound.isPlaying) this.shootSound.stop();
    this.shootSound.play();

    // Create raycaster from camera (center of screen)
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    // Detect intersections with scene objects
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      console.log("Hit:", intersects[0].object);
    }

    // Add muzzle flash
    const flash = new THREE.PointLight(0xffffff, 1, 50);
    flash.position.set(0, 0, -1); // Position in front of camera
    this.camera.add(flash);
    setTimeout(() => {
      this.camera.remove(flash);
    }, 50); // Remove after 50ms
  }

  update() {
    const delta = this.clock.getDelta(); // Time since last frame

    // Apply gravity
    this.velocity.y += this.gravity * delta;

    // Update player position
    const player = this.controls.object;
    player.position.y += this.velocity.y * delta;

    // Ground collision
    if (player.position.y < 1.6) {
      player.position.y = 1.6; // Reset to ground level
      this.velocity.y = 0;
      this.canJump = true; // Allow jumping again
    }

    // Horizontal movement relative to camera direction
    if (this.controls.isLocked) {
      if (this.moveForward) player.translateZ(-this.moveSpeed * delta);
      if (this.moveBackward) player.translateZ(this.moveSpeed * delta);
      if (this.moveLeft) player.translateX(-this.moveSpeed * delta);
      if (this.moveRight) player.translateX(this.moveSpeed * delta);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game
const game = new Game();
