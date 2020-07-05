import { Vetor2d } from "./vetor2d.js";

export class Corpo2d {

    static rocha(op) { return Object.assign({ densidade: 0.6, restituicao: 0.1 }, op); }
    static madeira(op) { return Object.assign({ densidade: 0.3, restituicao: 0.2 }, op); }
    static metal(op) { return Object.assign({ densidade: 1.2, restituicao: 0.05 }, op); }
    static borracha(op) { return Object.assign({ densidade: 0.3, restituicao: 0.8 }, op); }
    static elastico(op) { return Object.assign({ densidade: 0.3, restituicao: 0.95 }, op); }
    static almofada(op) { return Object.assign({ densidade: 0.1, restituicao: 0.2 }, op); }
    static estatico(op) { return Object.assign({ densidade: 0, restituicao: 0.4 }, op); }

    static criar(posV, forma, op) {
        let corpo = new Corpo2d();
        corpo.posV = posV;
        corpo.velV = Vetor2d.criarPos(0, 0);
        corpo.acelV = Vetor2d.criarPos(0, 0);
        corpo.forma = forma;
        forma.corpo = corpo;
        corpo.orient = 0;
        corpo.densidade = 0.5;
        corpo.restituicao = 0.1;
        corpo.friccaoEstatica = 0.5;
        corpo.friccaoDinamica = 0.3;
        corpo.velAng = 0;
        corpo.torque = 0
        Object.assign(corpo, op);
        
        corpo.forma._calcularMassa()
        return corpo;
    }

    

    pos(x, y) {
        this.posV.x = x;
        this.posV.y = y;
    }
    
    desenhar(c, op) {
        op = op || {};
        this.forma.desenhar(this.posV, c, op);
    }

    set orient(a) { this.forma.orient = a; }
    get orient() { return this.forma.orient; }

    get estatico() { return this.massaInv == 0; }

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
        this.penetrado = false;
    }
}