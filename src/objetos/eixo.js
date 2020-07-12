export class Eixo {
    static criar(vertices) {
        let eixos = []
        for(let { i, v1 } of vertices.entries()) {
            let v2 = vertices[(i+1) % vertices.length];
            eixos.push(new Eixo(v1, v2));
        }
        return eixos;
    }

    constructor(vertice1, vertice2) {
        this.verticeId1 = vertice1.id;
        this.verticeId2 = vertice2.id;
        this.n = vertice1.sub(vertice2).norm();
    }
}