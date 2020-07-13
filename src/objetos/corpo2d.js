import { Mundo2d } from "./mundo2d.js";
import { Vertice2d } from "./vertice2d.js";
import { Vetor2d } from "./vetor2d.js";
import { Eixo } from "./eixo2d.js";
import { Borda2d } from "./borda2d.js";

export class Corpo2d {
    constructor(pos, vertices, op) {
        this.id = Mundo2d.obterCorpoId();
        this.nome = `corpo${this.id}`;
        this.posicao = new Vetor2d(0, 0);
        if (pos instanceof Vetor2d) {
            this.posicao = pos.copia;
        } else if (pos instanceof Array) {
            this.posicao = new Vetor2d(pos[0], pos[1]);
        }

        let vs = Vetor2d.criarArray(vertices);
        this.eixos = [];
        this.bordas = { min: new Vetor2d(), max: new Vetor2d() };
        
        this.angulo = 0;
        this.velocidade = new Vetor2d();
        this.forca = new Vetor2d();
        this.velocidadeAngular = 0;
        this.aceleracao = new Vetor2d();
        this.pre = {
            posicao: this.posicao,
            angulo: this.angulo
        };
        this.impulso = {
            pos: new Vetor2d()
        };
        this.torque = 0;
        this.massa = 0;
        this.massaInv = 0;
        this.inercia = 0;
        this.inerciaInv = 0;
        this.densidade = 0.001;
        this.restituicao = 0;
        this.friccao = 0.1;
        this.friccaoEstatica = 0.5;
        this.friccaoAr = 0.01;
        this.despejo = 0.05;
        this.tempoEscala = 1;
        this.areas = [];
        
        Object.assign(this, op);
        this._montar(vs);
    }

    get estatico() { return this.massaInv == 0; }

    obterVerticeId() {
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

        this.vertices = ordernados.map(_ => new Vertice2d(this, _.adic(this.posicao)));
        this.eixos = Eixo.criar(this.vertices);
        this.bordas = Borda2d.criarComVertices(this.vertices);

    }

    _definirMassa() {
        let inercia = 0;
        let area = 0
        let k = 1/3;
        let centro = Vetor2d.criarPos(0, 0);
        for(let i = 0; i< this.vertices.length; i++) {
            let v1 = this.vertices[i].v;
            let v2 = this.vertices[(i+1)%this.vertices.length].v;
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

        this.vertices = this.vertices.map(_ => {
            _.v = _.v.sub(centro.sub(this.posicao));
            return _;
        });
        this.bordas.min = this.bordas.min.sub(centro.sub(this.posicao));
        this.bordas.max = this.bordas.max.sub(centro.sub(this.posicao));

        this.massa = this.densidade * area;
        this.massaInv = (this.massa != 0) ? 1 / this.massa : 0;
        this.inercia = inercia * this.densidade;
        this.inerciaInv = (this.inercia != 0) ? 1 / this.inercia : 0;
    }

    definirPosicao(pos) {
        this.pre.posicao = this.posicao.copia;
        this.posicao = pos;
        let dif = this.posicao.sub(this.pre.posicao);
        this.vertices = this.vertices.map(_ => {
            _.v = _.v.adic(dif);
            return _;
        });
        this.bordas.min = this.bordas.min.adic(dif);
        this.bordas.max = this.bordas.max.adic(dif);
    }

    definirVelocidade(vel) {
        this.velocidade = vel.copia;
        this.pre.posicao = this.posicao.sub(this.velocidade);
    }

    definirAngulo(ang) {
        this.pre.angulo = this.angulo;
        this.angulo = ang;
        let dif = this.angulo - this.pre.angulo;
        this.eixos = this.eixos.map(_ =>{
            _.v = _.v.rotR(dif);
            return _;
        });
        this.vertices = this.vertices = this.vertices.map(_ => {
            _.v = _.v.sub(this.posicao).rotR(dif).adic(this.posicao);
            return _;
        });
        this.bordas.min = this.bordas.min.sub(this.posicao).rotR(dif).adic(this.posicao);
        this.bordas.max = this.bordas.max.sub(this.posicao).rotR(dif).adic(this.posicao);
    }

    definirVelocidadeAngular(vel) {
        this.pre.angulo = this.angulo - vel;
        this.velocidadeAngular = vel;
    }

    adicionarForma(forca) {
        this.aceleracao = this.aceleracao.adic(forma.mult(this.massaInv));
    }

    atualizar(delta, tempoEscala, correcao) {
        var deltaQuadrado = Math.pow(delta * tempoEscala * this.tempoEscala, 2);

        let fricAr = 1 - this.friccaoAr * tempoEscala * this.tempoEscala;
        let preVel = this.posicao.sub(this.pre.posicao);

        let vel = preVel.mult(fricAr*correcao).adic(this.aceleracao);

        this.definirVelocidade(vel);
        this.definirPosicao(this.posicao.adic(vel));

        let velAng = ((this.angulo - this.pre.angulo) * fricAr * correcao) + (this.torque * this.inerciaInv) * deltaQuadrado;

        this.definirVelocidadeAngular(velAng);
        this.definirAngulo(this.angulo + velAng);
    }

    reiniciar() {
        this.aceleracao = new Vetor2d();
        this.torque = 0;
    }


    obterPathD() {
        let path = {
            posicao: "",
            vertices: "",
            eixos: [],
            borda: ""
        };
        path.posicao = `
            M${this.posicao.x-2} ${this.posicao.y-2}
            L${this.posicao.x-2} ${this.posicao.y+2}
            L${this.posicao.x+2} ${this.posicao.y+2}
            L${this.posicao.x+2} ${this.posicao.y-2}`;
        for(let [ i, v ] of this.vertices.map(_ => _.v).entries()) {
            path.vertices += i==0 ? "M" : "L";
            path.vertices += `${v.x} ${v.y} `;
        }
        path.vertices += " Z";
        return path;
    }
}