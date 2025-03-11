import * as THREE from "three";

export class AudioManager {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.shootSound = new THREE.Audio(this.listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/shoot.wav", (buffer) => {
      this.shootSound.setBuffer(buffer);
      this.shootSound.setVolume(0.5);
    });
  }

  playShootSound() {
    if (this.shootSound.isPlaying) this.shootSound.stop();
    this.shootSound.play();
  }
}
