import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export class InputManager {
  constructor(camera, domElement, game) {
    this.controls = new PointerLockControls(camera, domElement);
    this._moveForward = false; // Use _ for private properties.
    this._moveBackward = false;
    this._moveLeft = false;
    this._moveRight = false;
    this.canJump = false; //For now
    this.game = game;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));

    // Handle pointer lock changes (e.g., ESC key)
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === document.body) {
        this.game.togglePause(false);
      } else {
        this.game.togglePause(true);
      }
    });
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        this._moveForward = true;
        break;
      case "KeyS":
        this._moveBackward = true;
        break;
      case "KeyA":
        this._moveLeft = true;
        break;
      case "KeyD":
        this._moveRight = true;
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
        this._moveForward = false;
        break;
      case "KeyS":
        this._moveBackward = false;
        break;
      case "KeyA":
        this._moveLeft = false;
        break;
      case "KeyD":
        this._moveRight = false;
        break;
    }
  }

  getControls() {
    return this.controls;
  }

  get moveForward() {
    return this._moveForward;
  }
  get moveBackward() {
    return this._moveBackward;
  }
  get moveLeft() {
    return this._moveLeft;
  }
  get moveRight() {
    return this._moveRight;
  }

  isLocked() {
    return document.pointerLockElement === this.controls.domElement;
  }
}
