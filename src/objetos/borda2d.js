import { Vetor2d } from "./vetor2d.js";

export class Borda2d {


    static criarComVertices(vertices) {
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;
        for(let vertice of vertices) {
            if (vertice.v.x < minX) minX = vertice.v.x;
            if (vertice.v.y < minY) minY = vertice.v.y;
            if (vertice.v.x > maxX) maxX = vertice.v.x;
            if (vertice.v.y > maxY) maxY = vertice.v.y;
        }

        return new Borda2d(minX, minY, maxX, maxY)
    }

    constructor(minX, minY, maxX, maxY) {
        this.min = new Vetor2d(minX, minY);
        this.max = new Vetor2d(maxX, maxY);
    }

    sobrepoem(borda) {
        if (this.min.x <= borda.max.x && borda.min.x <= this.max.x
            && this.min.y <= borda.max.y && borda.min.y <= this.max.y) {
            return true;
        }
        return false;
    }
}