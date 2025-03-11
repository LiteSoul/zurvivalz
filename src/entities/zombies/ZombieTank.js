// zombies/ZombieTank.js
import Zombie from "./Zombie.js";

export default class ZombieTank extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      "tank.png", // spritePath
      200, // health
      1.0, // speed
      1.5, // size
      30 // scoreValue
    );
  }
}
