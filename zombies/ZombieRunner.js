// zombies/ZombieRunner.js
import Zombie from "./Zombie.js";

export default class ZombieRunner extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      75,
      3.0,
      1.0,
      "public/images/zombies/runner.png",
      15
    );
  }
}
