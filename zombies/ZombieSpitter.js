// zombies/ZombieSpitter.js
import Zombie from "./Zombie.js";

export default class ZombieSpitter extends Zombie {
  constructor(scene, player, game) {
    super(scene, player, game, 40, 1.8, 0.8, "images/zombies/spitter.png");
  }
}
