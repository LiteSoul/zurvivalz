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
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff }); // Blue color
    const magazine = new THREE.Mesh(geometry, material);
    return magazine;
  }
}
