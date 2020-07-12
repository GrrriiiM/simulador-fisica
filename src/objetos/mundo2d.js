import { Vetor2d } from "./vetor2d";

export class Mundo2d {
    static obterCorpoId() {
        Mundo2d.ultimoCorpoId = Mundo2d.ultimoCorpoId || 0;
        Mundo2d.ultimoCorpoId += 1;
        return Mundo2d.ultimoCorpoId;
    }

    constructor(op) {
        this.largura = 500;
        this.altura = 500;
        this.posX = 0;
        this.posY = 0;
        this.paredes = [ true, true, true, true];
        Object.assign(this, op);
        this.corpos = [];
        if (this.paredes instanceof Boolean) {
            this.paredes = [ this.paredes, this.paredes, this.paredes, this.paredes ];
        }

        this._criarParedes(...this.paredes);
    }

    adicCorpo(pos, vertices, op) {
        let corpo  = new corpo(pos, vertices, op);
        this.corpos.push(corpo);
        return corpo;
    }

    _criarParedes(direita, baixo, esquerda, cima) {
        if (esquerda) {
            this.adicCorpo([ 25, this.altura/2 ], [50, this.altura], { massaInv: 0 });
        }
        if (direita) {
            this.adicCorpo([ this.largura - 25 , this.altura/2], [50, this.altura], { massaInv: 0 });
        }
        if (cima) {
            this.adicCorpo([ this.largura / 2, 25 ], [this.largura, 50], { massaInv: 0 });
        }
        if (baixo) {
            this.adicCorpo([ this.largura / 2, this.altura - 25 ], [50, this.altura], { massaInv: 0 });
        }
    }
}