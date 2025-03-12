export class UI {
  constructor() {
    const uiStyle = `
      position: absolute;
      color: #f0f090; /* Desaturated yellow/light gray */
      font-family: "Courier New", monospace;
      font-size: 24px;
      padding: 5px 10px;
      background-color: rgba(0, 0, 0, 0.5); /* Dark semi-transparent background */
      border-radius: 5px;
      text-shadow: 2px 2px 3px rgba(0,0,0,0.8); /* Text shadow for better readability */
    `;

    // Health container
    this.healthContainer = document.createElement("div");
    this.healthContainer.style.position = "absolute";
    this.healthContainer.style.top = "20px"; // Adjusted top position
    this.healthContainer.style.left = "20px"; // Adjusted left position
    document.body.appendChild(this.healthContainer);

    // Health bar background
    this.healthBarBg = document.createElement("div");
    this.healthBarBg.style.cssText = `
      left: 60px; /* Adjusted left to accommodate health number */
      width: 200px;
      height: 20px;
      background-color: rgba(50, 50, 50, 0.8);
      border-radius: 10px;
      position: relative;
      overflow: hidden;
    `;
    this.healthContainer.appendChild(this.healthBarBg);

    // Health bar
    this.healthBar = document.createElement("div");
    this.healthBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: green;
      border-radius: 10px;
      transition: background-color 0.3s, width 0.3s;
    `;
    this.healthBarBg.appendChild(this.healthBar);

    // Health text (number) - Left of health bar
    this.healthTextElement = document.createElement("div");
    this.healthTextElement.style.cssText = `${uiStyle} position: absolute; top: -3px; left: 0px; font-size: 20px; text-align: right;`;
    this.healthContainer.appendChild(this.healthTextElement);

    // Enemy count display, below wave
    this.enemyCountElement = document.createElement("div");
    this.enemyCountElement.style.cssText = uiStyle;
    this.enemyCountElement.style.top = "112px"; // Below Wave
    this.enemyCountElement.style.right = "20px"; // Adjusted right
    document.body.appendChild(this.enemyCountElement);

    // Kill count display, below enemies
    this.killCountElement = document.createElement("div");
    this.killCountElement.style.cssText = uiStyle;
    this.killCountElement.style.top = "158px"; // Below Enemy count
    this.killCountElement.style.right = "20px"; // Adjusted right
    document.body.appendChild(this.killCountElement);

    // Wave display, top right
    this.waveElement = document.createElement("div");
    this.waveElement.style.cssText = uiStyle;
    this.waveElement.style.top = "66px"; // Adjusted top
    this.waveElement.style.right = "20px"; // Adjusted right
    document.body.appendChild(this.waveElement);

    // Score display, above wave
    this.scoreElement = document.createElement("div");
    this.scoreElement.style.cssText = uiStyle;
    this.scoreElement.style.top = "20px"; // Adjusted top
    this.scoreElement.style.right = "20px"; // Adjusted right
    document.body.appendChild(this.scoreElement);

    // Ammo display, bottom right - No change in position
    this.ammoElement = document.createElement("div");
    this.ammoElement.style.cssText = uiStyle;
    this.ammoElement.style.bottom = "20px"; // Adjusted bottom
    this.ammoElement.style.right = "20px"; // Adjusted right
    document.body.appendChild(this.ammoElement);
  }

  updateHealthBar = (health) => {
    const healthPercentage = Math.max(0, health); // Ensure health is not negative
    const percentage = (healthPercentage / 100) * 200; // Calculate percentage for bar width
    this.healthBar.style.width = `${percentage}px`; // Update width based on health percentage
    this.healthTextElement.innerHTML = `${health}`; // Update health text

    // Change health bar color based on health percentage
    if (healthPercentage > 60) {
      this.healthBar.style.backgroundColor = "green";
    } else if (healthPercentage > 30) {
      this.healthBar.style.backgroundColor = "yellow";
    } else {
      this.healthBar.style.backgroundColor = "red";
    }
  };

  updateHealth = (health) => {
    this.updateHealthBar(health);
  };

  updateScore = (score) => {
    this.scoreElement.innerHTML = `Score: ${score}`;
  };

  updateAmmo = (ammo) => {
    this.ammoElement.innerHTML = `Ammo: ${ammo}`;
  };

  updateWave = (wave) => {
    this.waveElement.innerHTML = `Wave: ${wave}`;
  };

  updateEnemyCount = (enemyCount) => {
    this.enemyCountElement.innerHTML = `Enemies: ${enemyCount}`;
  };

  updateKillCount = (killCount) => {
    this.killCountElement.innerHTML = `Kills: ${killCount}`;
  };

  showGameOver = (callback) => {
    this.gameOverElement.style.display = "block";
    document.getElementById("restart").addEventListener("click", callback);
  };

  hideGameOver = () => {
    this.gameOverElement.style.display = "none";
  };
}
