import * as THREE from "three";

export class AmmoMagazine {
  constructor(scene, position) {
    this.scene = scene;
    this.model = this.createModel();
    this.model.position.copy(position);
    this.scene.add(this.model);
    this.collected = false;
  }

  createModel() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("images/ammo.png");
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.32, 0.32, 1); // Assuming 32x32 pixels
    sprite.position.y += 0.16; // Adjust to place bottom on ground
    return sprite;
  }
}
