import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js"; // Keep this import here for now, in case we need it later for scene-related controls
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

export class SceneManager {
  constructor(game) {
    this.game = game;
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

    this.camera.position.y = 1.6; // Eye level

    //Placeholder for controls, to be removed or modified later
    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );
    this.scene.add(this.controls.object);

    this.setupEnvironment();
    this.addTestObjects();

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupEnvironment() {
    this.scene.background = new THREE.Color(0x87ceeb);
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load("images/ground.jpg");
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

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  getRenderer() {
    return this.renderer;
  }
}
