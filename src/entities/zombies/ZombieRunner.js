import Zombie from "./Zombie.js";

export default class ZombieRunner extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      "runner.png", // spritePath
      75, // health
      3.0, // speed
      1.0, // size
      15 // scoreValue
    );
  }
}
