// zombies/ZombieSpitter.js
import Zombie from "./Zombie.js";

export default class ZombieSpitter extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      "public/images/zombies/spitter.png", // spritePath
      40, // health
      1.8, // speed
      0.8, // size
      25 // scoreValue
    );
  }
}
