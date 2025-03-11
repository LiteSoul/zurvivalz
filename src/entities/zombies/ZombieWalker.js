// zombies/ZombieWalker.js
import Zombie from "./Zombie.js";

export default class ZombieWalker extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      50,
      1.5,
      0.8,
      "public/images/zombies/walker.png",
      10
    );
  }
}
