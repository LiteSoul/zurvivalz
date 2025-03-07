// zombies/ZombieJumper.js
import Zombie from "./Zombie.js";

export default class ZombieJumper extends Zombie {
  constructor(scene, player, game) {
    super(scene, player, game, 60, 2.0, 0.9, "images/zombies/jumper.png");
  }
}
