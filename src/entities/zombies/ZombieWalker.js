import Zombie from "./Zombie.js";

export default class ZombieWalker extends Zombie {
  constructor(scene, player, game) {
    super(
      scene,
      player,
      game,
      "walker.png", // spritePath
      50, // health
      1.5, // speed
      0.8, // size
      10 // scoreValue
    );
  }
}
