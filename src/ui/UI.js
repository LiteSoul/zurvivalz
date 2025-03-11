export class UI {
  constructor() {
    // Health display
    this.healthElement = document.createElement("div");
    this.healthElement.style.position = "absolute";
    this.healthElement.style.top = "10px";
    this.healthElement.style.left = "10px";
    this.healthElement.style.color = "white";
    this.healthElement.style.fontSize = "24px";
    document.body.appendChild(this.healthElement);

    // Score display
    this.scoreElement = document.createElement("div");
    this.scoreElement.style.position = "absolute";
    this.scoreElement.style.top = "10px";
    this.scoreElement.style.right = "10px";
    this.scoreElement.style.color = "white";
    this.scoreElement.style.fontSize = "24px";
    document.body.appendChild(this.scoreElement);

    // Game over screen
    this.gameOverElement = document.createElement("div");
    this.gameOverElement.style.position = "absolute";
    this.gameOverElement.style.top = "50%";
    this.gameOverElement.style.left = "50%";
    this.gameOverElement.style.transform = "translate(-50%, -50%)";
    this.gameOverElement.style.color = "red";
    this.gameOverElement.style.fontSize = "48px";
    this.gameOverElement.style.display = "none";
    this.gameOverElement.innerHTML =
      'Game Over<br><button id="restart">Restart</button>';
    document.body.appendChild(this.gameOverElement);

    // Ammo display
    this.ammoElement = document.createElement("div");
    this.ammoElement.style.position = "absolute";
    this.ammoElement.style.top = "40px"; // Position below health
    this.ammoElement.style.left = "10px";
    this.ammoElement.style.color = "white";
    this.ammoElement.style.fontSize = "24px";
    document.body.appendChild(this.ammoElement);

    // Wave display
    this.waveElement = document.createElement("div");
    this.waveElement.style.position = "absolute";
    this.waveElement.style.top = "40px"; // Position below score
    this.waveElement.style.right = "10px";
    this.waveElement.style.color = "white";
    this.waveElement.style.fontSize = "24px";
    document.body.appendChild(this.waveElement);

    // Enemy count display
    this.enemyCountElement = document.createElement("div");
    this.enemyCountElement.style.position = "absolute";
    this.enemyCountElement.style.top = "70px"; // Position below wave
    this.enemyCountElement.style.right = "10px";
    this.enemyCountElement.style.color = "white";
    this.enemyCountElement.style.fontSize = "24px";
    document.body.appendChild(this.enemyCountElement);

    // Kill count display
    this.killCountElement = document.createElement("div");
    this.killCountElement.style.position = "absolute";
    this.killCountElement.style.top = "70px"; // Position below ammo
    this.killCountElement.style.left = "10px";
    this.killCountElement.style.color = "white";
    this.killCountElement.style.fontSize = "24px";
    document.body.appendChild(this.killCountElement);
  }

  updateHealth(health) {
    this.healthElement.innerHTML = `Health: ${Math.max(0, health)}`;
  }

  updateScore(score) {
    this.scoreElement.innerHTML = `Score: ${score}`;
  }
  updateAmmo(ammo) {
    this.ammoElement.innerHTML = `Ammo: ${ammo}`;
  }

  updateWave(wave) {
    this.waveElement.innerHTML = `Wave: ${wave}`;
  }

  updateEnemyCount(enemyCount) {
    this.enemyCountElement.innerHTML = `Enemies: ${enemyCount}`;
  }

  updateKillCount(killCount) {
    this.killCountElement.innerHTML = `Kills: ${killCount}`;
  }

  showGameOver(callback) {
    this.gameOverElement.style.display = "block";
    document.getElementById("restart").addEventListener("click", callback);
  }

  hideGameOver() {
    this.gameOverElement.style.display = "none";
  }
}
