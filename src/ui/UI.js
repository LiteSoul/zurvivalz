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
    this.healthContainer.style.top = "10px";
    this.healthContainer.style.left = "10px";
    document.body.appendChild(this.healthContainer);

    // Health bar background
    this.healthBarBg = document.createElement("div");
    this.healthBarBg.style.cssText = `
      width: 200px;
      height: 20px;
      background-color: rgba(50, 50, 50, 0.8);
      border-radius: 10px;
      position: relative; /* For absolute positioning of the bar */
      overflow: hidden; /* Clip rounded corners */
    `;
    this.healthContainer.appendChild(this.healthBarBg);

    // Health bar
    this.healthBar = document.createElement("div");
    this.healthBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%; /* Initial width */
      background-color: green; /* Default color */
      border-radius: 10px;
      transition: background-color 0.3s, width 0.3s; /* Smooth transitions */
    `;
    this.healthBarBg.appendChild(this.healthBar);

    // Health text (number)
    this.healthTextElement = document.createElement("div");
    this.healthTextElement.style.cssText = `${uiStyle} position: absolute; top: -3px; left: 10px; font-size: 20px;`;
    this.healthContainer.appendChild(this.healthTextElement);

    // Kills display, below health
    this.killCountElement = document.createElement("div");
    this.killCountElement.style.cssText = uiStyle;
    this.killCountElement.style.top = "40px"; // Below health
    this.killCountElement.style.left = "10px";
    document.body.appendChild(this.killCountElement);

    // Score display, below kills
    this.scoreElement = document.createElement("div");
    this.scoreElement.style.cssText = uiStyle;
    this.scoreElement.style.top = "70px"; // Below kills
    this.scoreElement.style.left = "10px";
    document.body.appendChild(this.scoreElement);

    // Wave display, top right
    this.waveElement = document.createElement("div");
    this.waveElement.style.cssText = uiStyle;
    this.waveElement.style.top = "10px";
    this.waveElement.style.right = "10px";
    document.body.appendChild(this.waveElement);

    // Enemy count display, below wave
    this.enemyCountElement = document.createElement("div");
    this.enemyCountElement.style.cssText = uiStyle;
    this.enemyCountElement.style.top = "40px"; // Below wave
    this.enemyCountElement.style.right = "10px";
    document.body.appendChild(this.enemyCountElement);

    // Ammo display, bottom right
    this.ammoElement = document.createElement("div");
    this.ammoElement.style.cssText = uiStyle;
    this.ammoElement.style.bottom = "10px"; // Bottom right
    this.ammoElement.style.right = "10px"; // Bottom right
    document.body.appendChild(this.ammoElement);
  }

  updateHealthBar = (health) => {
    const healthPercentage = Math.max(0, health); // Ensure health is not negative
    const percentage = (healthPercentage / 100) * 200; // Calculate percentage for bar width
    this.healthBar.style.width = `${percentage}px`; // Update width based on health percentage
    this.healthTextElement.innerHTML = `Health: ${health}`; // Update health text

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
