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
        corpo.posV = posV.copia;
        corpo.posVprev = posV.copia;
        corpo.posVimpulso = Vetor2d.criarPos(0, 0);
        corpo.velV = Vetor2d.criarPos(0, 0);
        corpo.acelV = Vetor2d.criarPos(0, 0);
        corpo.forma = forma;
        forma.corpo = corpo;
        corpo.orient = 0;
        corpo.orientPrev = 0;
        corpo.densidade = 0.5;
        corpo.restituicao = 0.1;
        corpo.friccaoEstatica = 0.5;
        corpo.friccaoDinamica = 0.3;
        corpo.friccaoAr = 0.5;
        corpo.velAng = 0;
        corpo.torque = 0;
        corpo.qtdContatos = 0;
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

    adicionarAceleracao(a) {
        if (this.estatico) return;
        this.acelV = this.acelV.adic(a);
    }

    atualizar() {
        if (this.estatico) return;

        let friccaoAr = 1 - this.friccaoAr;
        let posVprev = this.posV.sub(this.posVprev);

        this.velV = posVprev.mult(friccaoAr).adic(this.acelV.mult(this.massaInv))
        
        this.posVprev = this.posV.copia;
        this.posV = this.posV.adic(this.velV);

        this.velAng = ((this.orient - this.orientPrev) * friccaoAr) + (this.torque * this.inerciaInv);
        this.orientPrev = this.orient;
        //this.orient += this.velAng;
        
    }

    aplicarImpulso() {
        this.qtdContatos = 0;

        let _positionWarming = 0.8;

        if (this.posVimpulso.x !== 0 || this.posVimpulso.y !== 0) {

            this.posVprev = this.posVprev.adic(this.posVimpulso)

            if (this.posVimpulso.pEsc(this.velV)<0) {
                this.posVimpulso = Vetor2d.criar();
            } else {
                this.posVimpulso = this.posVimpulso.mult(_positionWarming);
            }
        }
    }

    resetar() {
        this.acelV = this.acelV.mult(0);
        this.torque = 0
        this.penetrado = false;
    }
}