import { Corpo2d } from "./corpo2d.js";
import { Area2d } from "./area2d.js";
import { Vetor2d } from "./vetor2d.js";

export class Mundo2d {
    static obterCorpoId() {
        Mundo2d.ultimoCorpoId = Mundo2d.ultimoCorpoId || 0;
        Mundo2d.ultimoCorpoId += 1;
        return Mundo2d.ultimoCorpoId;
    }

    constructor(op) {
        this.largura = 500;
        this.altura = 500;
        this.posicaoX = 0;
        this.posicaoY = 0;
        this.tamanhoArea = 48;
        this.tempoEscala = 1;
        this.paredes = [ true, true, true, true];
        this.gravidade = new Vetor2d(0, 0.1);
        this.corpos = [];
        Object.assign(this, op);
        if (typeof(this.paredes) == "boolean") {
            this.paredes = [ this.paredes, this.paredes, this.paredes, this.paredes ];
        }
        this.areas = [];
        this._criarParedes(...this.paredes);
        this._criarAreas();
    }

    adicionarCorpo(pos, vertices, op) {
        let corpo  = new Corpo2d(pos, vertices, op);
        this.corpos.push(corpo);
        return corpo;
    }

    _criarParedes(direita, baixo, esquerda, cima) {
        if (esquerda) {
            this.adicionarCorpo([ 0, this.altura/2 ], [50, this.altura], { densidade: 0, nome: "paredeEsquerda" });
        }
        if (direita) {
            this.adicionarCorpo([ this.largura , this.altura/2], [50, this.altura], { densidade: 0, nome: "paredeDireita" });
        }
        if (cima) {
            this.adicionarCorpo([ this.largura / 2, 0 ], [this.largura, 50], { densidade: 0, nome: "paredeCima" });
        }
        if (baixo) {
            this.adicionarCorpo([ this.largura / 2, this.altura ], [this.largura, 50], { densidade: 0, nome: "paredeBaixo" });
        }
    }

    _criarAreas() {
        for(let linha=0; (linha*this.tamanhoArea) < this.largura; linha++) {
            for(let coluna=0; (coluna*this.tamanhoArea) < this.altura; coluna++) {
                this.areas.push(new Area2d(linha, coluna, this.tamanhoArea));
            }
        }
    }

    

    obterPathD() {
        return `
        M${this.posicaoX} ${this.posicaoY} 
        L${this.posicaoX + this.largura} ${this.posicaoY}
        L${this.posicaoX + this.largura} ${this.posicaoY + this.altura}
        L${this.posicaoX} ${this.posicaoY + this.altura} Z`;
    }
}