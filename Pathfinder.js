import * as THREE from "three";

export class Pathfinder {
  constructor(scene, start, end, obstacles) {
    this.scene = scene;
    this.start = start.clone();
    this.end = end.clone();
    this.obstacles = obstacles; // Array of THREE.Box3 representing obstacles
    this.gridSize = 1; // Size of each grid cell
    this.grid = this.createGrid(); // The grid will be created dynamically
  }

  createGrid() {
    // console.log(
    //   "Obstacles in Pathfinder:",
    //   this.obstacles,
    //   typeof this.obstacles
    // );
    const grid = [];
    // For simplicity, we'll assume a fixed-size grid for now.  We can make this dynamic later.
    const minX = -50;
    const maxX = 50;
    const minZ = -50;
    const maxZ = 50;

    for (let x = minX; x < maxX; x += this.gridSize) {
      for (let z = minZ; z < maxZ; z += this.gridSize) {
        const cell = {
          x: Math.round(x / this.gridSize),
          z: Math.round(z / this.gridSize),
          walkable: true,
        };

        // Check if this cell is occupied by an obstacle
        for (const obstacle of this.obstacles) {
          const obstacleBox = new THREE.Box3().setFromObject(obstacle);
          const cellBox = new THREE.Box3(
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(x + this.gridSize, 2, z + this.gridSize)
          ); // Assuming obstacles are on y=0 and have some height.

          if (obstacleBox.intersectsBox(cellBox)) {
            cell.walkable = false;
            break; // No need to check other obstacles if this cell is occupied
          }
        }
        grid.push(cell);
      }
    }
    return grid;
  }

  isWalkable(x, z) {
    const cell = this.grid.find((c) => c.x === x && c.z === z);
    return cell ? cell.walkable : false; // Return false if cell is outside grid
  }

  findPath() {
    // Very basic A* implementation for a flat plane.
    const startNode = {
      x: Math.round(this.start.x / this.gridSize),
      z: Math.round(this.start.z / this.gridSize),
      g: 0,
      h: this.heuristic({
        x: Math.round(this.start.x / this.gridSize),
        z: Math.round(this.start.z / this.gridSize),
      }),
      parent: null,
    };

    const endNode = {
      x: Math.round(this.end.x / this.gridSize),
      z: Math.round(this.end.z / this.gridSize),
    };

    let openList = [startNode];
    let closedList = [];

    while (openList.length > 0) {
      // Find the node with the lowest f = g + h
      let currentNode = openList[0];
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].g + openList[i].h < currentNode.g + currentNode.h) {
          currentNode = openList[i];
          currentIndex = i;
        }
      }

      // Remove current node from open list and add to closed list
      openList.splice(currentIndex, 1);
      closedList.push(currentNode);

      // If we've reached the end, reconstruct and return the path
      if (currentNode.x === endNode.x && currentNode.z === endNode.z) {
        return this.reconstructPath(currentNode);
      }

      // Generate children (neighbors)
      const neighbors = this.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        // Check if neighbor is in closed list or not walkable
        if (
          closedList.some(
            (node) => node.x === neighbor.x && node.z === neighbor.z
          ) ||
          !this.isWalkable(neighbor.x, neighbor.z)
        ) {
          continue;
        }

        // Calculate tentative g score
        const gScore = currentNode.g + 1; // Assuming cost of 1 to move to adjacent cell

        // Check if neighbor is in open list
        const openNeighbor = openList.find(
          (node) => node.x === neighbor.x && node.z === neighbor.z
        );

        if (!openNeighbor || gScore < openNeighbor.g) {
          // Update or create neighbor
          if (openNeighbor) {
            openNeighbor.g = gScore;
            openNeighbor.h = this.heuristic(neighbor, endNode);
            openNeighbor.parent = currentNode;
          } else {
            neighbor.g = gScore;
            neighbor.h = this.heuristic(neighbor, endNode);
            neighbor.parent = currentNode;
            openList.push(neighbor);
          }
        }
      }
    }
    return []; // No path found
  }

  getNeighbors(node) {
    const neighbors = [];
    const { x, z } = node;
    // Check adjacent cells (up, down, left, right)

    if (this.isWalkable(x + 1, z)) neighbors.push({ x: x + 1, z: z });
    if (this.isWalkable(x - 1, z)) neighbors.push({ x: x - 1, z: z });
    if (this.isWalkable(x, z + 1)) neighbors.push({ x: x, z: z + 1 });
    if (this.isWalkable(x, z - 1)) neighbors.push({ x: x, z: z - 1 });

    return neighbors;
  }

  heuristic(node) {
    // Manhattan distance
    return (
      Math.abs(node.x - Math.round(this.end.x / this.gridSize)) +
      Math.abs(node.z - Math.round(this.end.z / this.gridSize))
    );
  }

  reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
      path.push(
        new THREE.Vector3(
          current.x * this.gridSize,
          1,
          current.z * this.gridSize
        )
      );
      current = current.parent;
    }
    return path.reverse();
  }
}
