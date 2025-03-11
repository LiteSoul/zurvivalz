// zombies/ZombieTank.js
import Zombie from "./Zombie.js";

export default class ZombieTank extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      200,
      1.0,
      1.5,
      "public/images/zombies/tank.png",
      30
    );
  }
}
