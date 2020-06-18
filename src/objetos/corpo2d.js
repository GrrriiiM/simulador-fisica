import { Vetor2d } from "./vetor2d.js";

export class Corpo2d {

    static rocha() { return { densidade: 0.6, restituicao: 0.1 }; }
    static madeira() { return { densidade: 0.3, restituicao: 0.2 }; }
    static metal() { return { densidade: 1.2, restituicao: 0.05 }; }
    static borracha() { return { densidade: 0.3, restituicao: 0.8 }; }
    static elastico() { return { densidade: 0.3, restituicao: 0.95 }; }
    static almofada() { return { densidade: 0.1, restituicao: 0.2 }; }
    static estatico() { return { densidade: 0, restituicao: 0.4 }; }

    static criar(posV, forma, op) {
        let corpo = new Corpo2d();
        corpo.posV = posV;
        corpo.velV = Vetor2d.criarPos(0, 0);
        corpo.acelV = Vetor2d.criarPos(0, 0);
        corpo.forma = forma;
        forma.corpo = corpo;
        corpo.orient = 0;
        corpo.estatico = false;
        corpo.densidade = 0.5;
        corpo.restituicao = 0.1;
        corpo.friccaoEstatica = 0.5;
        corpo.friccaoDinamica = 0.3;
        corpo.velAng = 0;
        corpo.torque = 0
        Object.assign(corpo, op);
        
        corpo.calcularMassa()
        return corpo;
    }

    calcularMassa() {
        let inercia = 0;
        let area = 0
        let k = 1/3;
        let centro = Vetor2d.criarPos(0, 0);
        for(let i = 0; i< this.forma.vsQtd; i++) {
            let v1 = this.forma.vs[i];
            let v2 = this.forma.vs[(i+1)%this.forma.vsQtd];
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

        for (let i = 0; i < this.forma.vsQtd; ++i) {
            let v = this.forma.vs[i];
            this.forma.vs[i] = v.sub(centro);
        }

        this.forma.area[0] = this.forma.area[0].sub(centro);
        this.forma.area[1] = this.forma.area[1].sub(centro);

        if (this.densidade) {
            this.massa = this.densidade * area;
            this.massaInv = (this.massa != 0) ? 1 / this.massa : 0;
            this.inercia = inercia * this.densidade;
            this.inerciaInv = (this.inercia != 0) ? 1 / this.inercia : 0;
        } else {
            this.massa = Number.POSITIVE_INFINITY;
            this.massaInv = 0;
            this.inercia = Number.POSITIVE_INFINITY;
            this.inerciaInv = 0;
        }
        

    }

    pos(x, y) {
        this.posV.x = x;
        this.posV.y = y;
    }
    
    desenhar(c, op) {
        op = op || {};
        this.forma.desenhar(this.posV, c, op);
        if (op.desenharArea) this.forma.desenharArea(this.posV, c, op);
        if (op.desenharNormas) this.forma.desenharNormas(this.posV, c, op);
    }

    set orient(a) { this.forma.orient = a; }
    get orient() { return this.forma.orient; }

    adicForca(f) {
        this.acelV = this.acelV.adic(f.mult(this.massaInv));
    }

    integrarForca() {
        if (!this.massaInv) return;

        this.velV = this.velV.adic(this.acelV);
        this.velAng += this.torque * this.inerciaInv;
    }

    integrarVelocidade() {
        this.posV = this.posV.adic(this.velV);
        this.orient += this.velAng/(Math.PI/180);
        this.integrarForca();
    }

    aplicarImpulso(impulso, contato) {
        this.velV = this.velV.adic(impulso.mult(this.massaInv));
        this.velAng += this.inerciaInv * contato.pVet(impulso);
    }

    resetar() {
        this.acelV = this.acelV.mult(0);
        this.torque = 0
    }
}