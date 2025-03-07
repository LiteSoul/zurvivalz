import * as THREE from "three";

export class Pathfinder {
  constructor(scene, start, end, grid) {
    this.scene = scene;
    this.start = start.clone();
    this.end = end.clone();
    this.grid = grid; // Receive the grid
    this.gridSize = 1;
  }

  setStart(start) {
    this.start = start.clone();
  }

  setEnd(end) {
    this.end = end.clone();
  }

  // No createGrid() method needed anymore

  isWalkable(x, z) {
    const cell = this.grid.find((c) => c.x === x && c.z === z);
    return cell ? cell.walkable : false; // Return false if cell is outside the grid or not walkable.
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
    //  Check adjacent cells (up, down, left, right)

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
