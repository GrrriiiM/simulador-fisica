import { Forma2d } from "./forma2d.js";
import { Vetor2d } from "./vetor2d.js";

Forma2d.criarPoligono = (vertices, op) => Poligono2d.criar(vertices, op);
Forma2d.criarPoligonoRandom = (maxNumV, minMag, maxMag, op) => {
    
}

export class Poligono2d extends Forma2d {

    static criar(vertices, op) {
        let p = new Poligono2d();
        Object.assign(p, op);
        p._montar(vertices.map(_ => {
            if (_ instanceof Vetor2d) return _;
            else if(_ instanceof Array) return Vetor2d.criarPos(_[0], _[1]);
        }));
        return p;
    }

    static criarRandom(maxNumV, minMag, maxMag, op) {
        let vs = [];
        let n = Math.floor(Math.random()*(maxNumV - 3) + 3);
        for(let i=0; i<n;i++) {
            vs.push(Vetor2d.criarAngRandom(maxMag, minMag));
        }
        return Poligono2d.criar(vs, op);
    }

    static criarCirculo(r, op) {
        let faces = 36;
        let vs = []
        for(let i = 0; i < faces; i++) {
            vs.push(Vetor2d.criarAng(i*(360/faces), r));
        }
        return Poligono2d.criar(vs, op);
    }

    static criarQuadrado(l, op) {
        return Poligono2d.criar([[0,0], [l,0], [0,l], [l,l]], op);
    }

    static criarRetangulo(l1, l2, op) {
        return Poligono2d.criar([[0,0], [l1,0], [0,l2], [l1,l2]], op);
    }

    static criarTrianguloReto(l1, l2, op) {
        return Poligono2d.criar([[0,0], [0,l2], [l1,l2]], op);
    }

    static criarTrianguloEquilatero(l, op) {
        return Poligono2d.criar([[0,0], [l,0], Vetor2d.criarAng(300,l)], op);
    }

    constructor() {
        super();
        this.vs = [];
        this.ns = [];
        this.area = [ new Vetor2d(), new Vetor2d() ];
        this.corrigirDeslocamento = true;
    }

    _montar(vertices) {
        if (vertices.length < 3) return;
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
            let v1 = this.vs[(i+1)%this.vsQtd];
            let v2 = this.vs[i];
            let v = v1.sub(v2);
            this.ns.push(v.perp.norm());
        }

        let minV = Vetor2d.criarPos(Math.min(...this.vs.map(_ => _.x)), Math.min(...this.vs.map(_ => _.y)));
        let maxV = Vetor2d.criarPos(Math.max(...this.vs.map(_ => _.x)), Math.max(...this.vs.map(_ => _.y)));

        let deslocamento = maxV.sub(minV).div(2).adic(minV);

        for(let i in this.vs) {
            this.vs[i] = this.vs[i].sub(deslocamento);
        }

        
    }

    _calcularBordas() {
        this.min = Vetor2d.criar(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.max = Vetor2d.criar(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        for(let v of this.vs) {
            if (v.x<this.min.x) this.min.x = v.x;
            if (v.x>this.max.x) this.max.x = v.x;
            if (v.y<this.min.y) this.min.y = v.y;
            if (v.y>this.max.y) this.max.y = v.y;
        }
    }

    set orient(a) {
        super.orient = a;
        this._calcularBordas();
    }

    get orient() { return super.orient; }

    _calcularMassa() {
        let inercia = 0;
        let area = 0
        let k = 1/3;
        let centro = Vetor2d.criarPos(0, 0);
        for(let i = 0; i< this.vsQtd; i++) {
            let v1 = this.vs[i];
            let v2 = this.vs[(i+1)%this.vsQtd];
            let d = v1.pVet(v2);
            let a = d / 2;
            area += a;
            let peso = a * k;
            centro = centro.adic(v1.mult(peso))
                .adic(v2.mult(peso));
        
            let x = v1.x * v1.x + v2.x * v1.x + v2.x * v2.x;
            let y = v1.y * v1.y + v2.y * v1.y + v2.y * v2.y;
            inercia += (0.25 * k * d) * (x+y);
        }

        centro = centro.mult(1/area);

        for (let i = 0; i < this.vsQtd; ++i) {
            let v = this.vs[i];
            this.vs[i] = v.sub(centro);
        }

        this.corpo.massa = this.corpo.densidade * area;
        this.corpo.massaInv = (this.corpo.massa != 0) ? 1 / this.corpo.massa : 0;
        this.corpo.inercia = inercia * this.corpo.densidade;
        this.corpo.inerciaInv = (this.corpo.inercia != 0) ? 1 / this.corpo.inercia : 0;
        
    }

    get vsQtd() {
        return this.vs.length;
    }

    desenhar(pos, c, op) {
        const ctx = c.ctx;
        ctx.save();
        ctx.beginPath();
        for(let i in this.vs) {
            let v = this.vs[i].mult(this.u).adic(pos);
            if (i == 0)
                ctx.moveTo(v.x, v.y);
            else
                ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.restore();
    }
}