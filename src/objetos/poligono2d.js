import { Forma2d } from "./forma2d";
import { Vetor2d } from "./vetor2d";

class Poligono2d extends Forma2d {

    static criar(vertices) {
        let p = new Poligono2d();
        p.montar(vertices.map(_ => {
            if (_ instanceof Vetor2d) return _;
            else if(_ instanceof Array) return Vetor2d.criarPos(_[0], _[1]);
        }));
        return p;
    }

    constructor() {
        super();
        this.vs = [];
        this.ns = [];
        this.area;
    }

    montar(vertices) {
        let verticeDireita = vertices.reduce((p,c) => {
            if (!p || c.x > p.x) return c;
            else if (c.x == p.x && c.y < c.y) return c;
            return p;
        });

        
        let ordernados = [ verticeDireita ];
        let linhaBase = Vetor2d.criarAng(0, 1).norm();
        
        
        while(true) {
            let melhorVertice;
            let verticeBase = ordernados.length ? ordernados[ordernados.length-1] : linhaBase;
            
            for(let vertice of vertices) {
                if (vertice == verticeBase) continue;
                if (!melhorVertice ) { melhorVertice = vertice; continue }
                let v1 = melhorVertice.sub(verticeBase);
                let v2 = vertice.sub(verticeBase);
                let pVet = v1.pVet(v2);
                if (pVet<0 || (pVet==0 && v2.magQ > v2.magQ)) {
                    melhorVertice = vertice;
                }
            }
            if (melhorVertice == verticeDireita) break;
            ordernados.push(melhorVertice);
        }

        this.vs = ordernados;
        this.ns = [];

        for(let i=0; i<this.vsQtd; i++) {
            let v1 = this.vs[i==0 ? this.vsQtd-1 : i-1];
            let v2 = this.vs[i]
            this.ns.push(v1.sub(v2));
        }
        this.area = Vetor2d.criarPos(Math.max(...this.vs.map(_ => _.x)), Math.max(...this.vs.map(_ => _.y)));
    }

    get vsQtd() {
        return this.vs.length;
    }
}