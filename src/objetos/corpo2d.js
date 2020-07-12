import { Mundo2d } from "./mundo2d.js";
import { Vertice2d } from "./vertice2d.js";
import { Vetor2d } from "./vetor2d.js";
import { Eixo } from "./eixo.js";
import { Borda2d } from "./borda2d.js";

export class Corpo2d {
    constructor(pos, vertices, op) {
        this.id = Mundo2d.obterCorpoId();
        this.nome = `corpo${this.id}`;
        this.pos = new Vetor2d(0, 0);
        if (pos instanceof Vetor2d) {
            this.pos = pos.copia;
        } else if (pos instanceof Array) {
            this.pos = new Vetor2d(pos[0], pos[1]);
        }
        let vertices = Vetor2d.criarArray(vertices);

        this.vertices = [];
        this.eixos = [];
        this.bordas = { min: new Vetor2d(), max: new Vetor2d() };
        
        this.ang = 0;
        this.vel = new Vetor2d();
        this.forca = new Vetor2d();
        this.velAng = 0;
        this.pre = {
            pos: new Vetor2d(),
            ang: 0
        };
        this.imp = {
            pos: new Vetor2d()
        };
        this.densidade = 0.001;
        this.rest = 0;
        this.fric = 0.1;
        this.fricEst = 0.5;
        this.fricAr = 0.01;
        this.desp = 0.05;
        this.tempoEscala = 1;
        
        Object.assign(this, op);
        this._montar(vertices);
    }

    static obterVerticeId() {
        this.ultimoVerticeId = this.ultimoVerticeId || 0;
        this.ultimoVerticeId += 1;
        return `${this.id}_${this.ultimoVerticeId}`;
    }

    _montar(vertices) {
        this._definirVertices(vertices);
        this._definirMassa();
    }

    _definirVertices(vertices) {
        if (vertices.length < 3) {
            this.vertices = vertices;
            return;
        }
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

        this.vertices = ordernados.map(_ => new Vertice2d(this, _.adic(this.pos)));
        this.eixos = Eixo.criar(this.vertices);
        this.bordas = new Borda2d(this.vertices);

    }

    _definirMassa() {
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

        this.vertices = this.vertices.map(_ => _.sub(centro));
        this.bordas.min = this.bordas.min.sub(dif);
        this.bordas.max = this.bordas.max.sub(dif);

        this.massa = this.densidade * area;
        this.massaInv = (this.massa != 0) ? 1 / this.massa : 0;
        this.inercia = inercia * this.densidade;
        this.inerciaInv = (this.inercia != 0) ? 1 / this.inercia : 0;
    }

    setPos(pos) {
        this.pre.pos = this.pos.copia;
        this.pos = pos;
        let dif = this.pos.sub(this.pre.pos);
        this.vertices = this.vertices.map(_ => _.adic(dif));
        this.bordas.min = this.bordas.min.adic(dif);
        this.bordas.max = this.bordas.max.adic(dif);
    }

    setVel(vel) {
        this.vel = vel.copia;
        this.pre.pos = this.pos.sub(this.vel);
    }

    setAng(ang) {
        this.pre.ang = this.ang;
        this.ang = ang;
        let dif = this.ang - this.pre.ang;
        this.eixos = this.eixos.map(_ => _.rotR(dif));
        this.vertices = this.vertices.map(_ => _.sub(this.pos).rotR(dif).adic(this.pos));
        this.bordas = new Borda2d(this.vertices);
    }

    setAngVel(vel) {
        this.pre.ang = this.ang - vel;
        this.velAng = vel;
    }

    atualizar(delta, tempoEscala, correcao) {
        var deltaQuadrado = Math.pow(delta * tempoEscala * this.tempoEscala, 2);

        let fricAr = 1 - this.fricAr * tempoEscala * this.tempoEscala;
        let preVel = this.pos.sub(this.pre.pos);

        let vel = preVel.mult(fricAr*correcao).adic(this.acel);

        this.setVel(vel);
        this.setPos(this.pos.adic(vel));

        let angVel = ((this.ang - this.pre.ang) * fricAr * correcao) + (this.torque * this.inerciaInv) * deltaQuadrado;

        this.setAngVel(angVel);
        this.setAng(this.ang.adic(angVel));

    }


}