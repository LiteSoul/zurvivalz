// zombies/ZombieJumper.js
import Zombie from "./Zombie.js";

export default class ZombieJumper extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      "public/images/zombies/jumper.png", // spritePath
      60, // health
      2.0, // speed
      0.9, // size
      20 // scoreValue
    );
  }
}
