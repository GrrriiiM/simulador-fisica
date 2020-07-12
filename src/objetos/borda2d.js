import { Vetor2d } from "./vetor2d";

export class Borda2d {
    constructor(vertices) {
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;
        for(let vertice of vertices) {
            if (vertice.x < minX) minX = vertice.x;
            if (vertice.y < minY) minX = vertice.y;
            if (vertice.x > maxX) minX = vertice.x;
            if (vertice.y > maxY) minX = vertice.y;
        }

        this.min = new Vetor2d(minX, minY);
        this.max = new Vetor2d(maxX, maxY);
    }
}