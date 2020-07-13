import { Borda2d } from "./borda2d.js";

export class Area2d {
    constructor(linha, coluna, tamanho) {
        this.id = `${linha}_${coluna}`;
        this.linha = linha;
        this.coluna = coluna;
        this.corpos = [];
        this.colisoes = [];
        this.bordas = new Borda2d(linha*tamanho, coluna*tamanho, (linha+1)*tamanho, (coluna+1)*tamanho);
    }
    
    atualizar(corpo) {
        if (this.bordas.sobrepoem(corpo.bordas)) {
            if (!corpo.areas.includes(this.id)) {
                this.corpos.push(corpo);
                corpo.areas.push(this.id);
            }
        } else {
            if (this.corpos.includes(corpo)) {
                this.corpos.splice(this.corpos.indexOf(corpo), 1);
                corpo.areas.splice(corpo.areas.indexOf(this.id), 1);
            }
        }
    }

    ativa() {
        return this.corpos.length > 1;
    }

    obterPathD() {
        return `
            M${this.bordas.min.x} ${this.bordas.min.y}
            L${this.bordas.max.x} ${this.bordas.min.y}
            L${this.bordas.max.x} ${this.bordas.max.y}
            L${this.bordas.min.x} ${this.bordas.max.y} Z`
    }
}