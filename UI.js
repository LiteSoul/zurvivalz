// UI.js
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
  }

  updateHealth(health) {
    this.healthElement.innerHTML = `Health: ${Math.max(0, health)}`;
  }

  updateScore(score) {
    this.scoreElement.innerHTML = `Score: ${score}`;
  }

  showGameOver(callback) {
    this.gameOverElement.style.display = "block";
    document.getElementById("restart").addEventListener("click", callback);
  }

  hideGameOver() {
    this.gameOverElement.style.display = "none";
  }
}
