import { Forma2d } from "./forma2d.js";
import { Vetor2d } from "./vetor2d.js";

Forma2d.criarPoligono = (vertices, op) => Poligono2d.criar(vertices, op);
Forma2d.criarPoligonoRandom = (maxNumV, minMag, maxMag, op) => {
    
}

export class Poligono2d extends Forma2d {

    static criar(vertices, op) {
        let p = new Poligono2d();
        Object.assign(p, op);
        p.montar(vertices.map(_ => {
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

    constructor() {
        super();
        this.vs = [];
        this.ns = [];
        this.area = [ new Vetor2d(), new Vetor2d() ];
        this.corrigirDeslocamento = true;
    }

    montar(vertices) {
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

        if (this.corrigirDeslocamento) {
            let deslocamento = maxV.sub(minV).div(2).adic(minV);

            for(let i in this.vs) {
                this.vs[i] = this.vs[i].sub(deslocamento);
            }
    
            this.area = [ minV.sub(deslocamento), maxV.sub(deslocamento) ];
        } else {
            this.area = [ minV, maxV ];
        }

        
    }

    get vsQtd() {
        return this.vs.length;
    }

    desenhar(pos, c, op) {
        op = op || {};
        let corL = op.corL || this.corL;
        let alfaL = op.alfaL || this.alfaL;
        let corP = op.corP || this.corP;
        let alfaP = op.alfaP || this.alfaP;
        let corVs = op.corVs || this.corVs || [];
        let ctx = c.ctx;
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

        if (corL) {
            ctx.strokeStyle = corL;
        } else {
            ctx.strokeStyle = "white";
        }
        if (alfaL) {
            ctx.globalAlpha = alfaL;
        } else {
            ctx.globalAlpha = 1;
        }
        ctx.stroke();

        if (corP) {
            ctx.fillStyle  = corP;
            if (alfaP) {
                ctx.globalAlpha = alfaP;
            } else {
                ctx.globalAlpha = 1;
            }
            ctx.fill();
        } 
        ctx.restore();

    }

    desenharArea(pos, c) {
        let ctx = c.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.area[0].x + pos.x, this.area[0].y + pos.y);
        ctx.lineTo(this.area[1].x + pos.x, this.area[0].y + pos.y);
        ctx.lineTo(this.area[1].x + pos.x, this.area[1].y + pos.y);
        ctx.lineTo(this.area[0].x + pos.x, this.area[1].y + pos.y);
        ctx.closePath();

        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.restore();
    }

    desenharNormas(pos, c) {
        let ctx = c.ctx;
        ctx.save();
        
        for(let i=0;i<this.vsQtd;i++) {
            let v1 = this.vs[(i+1)%this.vsQtd];
            let v2 = this.vs[i];
            let v = v1.adic(pos);
            v = v.adic(v2.sub(v1).div(2));
            // v = v.adic(pos);
            let n = this.ns[i].mult(20).adic(v);
            c.linha(v.x, v.y, n.x, n.y, { c: "green" })
        }
    }
}