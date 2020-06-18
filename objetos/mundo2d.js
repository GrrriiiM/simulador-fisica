import { Vetor2d } from "./vetor2d.js";
import { Corpo2d } from "./corpo2d.js";
import { Colisao2d } from "./colisao2d.js";

export class Mundo2d {
    static criar(x, y, w, h) {
        let mundo = new Mundo2d();
        mundo.posV = Vetor2d.criarPos(x, y);
        mundo.w = w;
        mundo.h = h;
        mundo.corpos = [];
        mundo.colisoes = [];
        return mundo;
    }

    adic(posV, forma, op) {
        let corpo = Corpo2d.criar(posV, forma, op);
        this.corpos.push(corpo);
        return corpo;
    }

    _reset() {
        this.colisoes = [];
    }

    _colisoes() {
        for(let i = 0; i<this.corpos.length; i++) {
            let corpo1 = this.corpos[i];
            for(let j = i+1;j<this.corpos.length;j++) {
                let corpo2 = this.corpos[j];
                if (corpo1.massaInv > 0 || corpo2.massaInv > 0) {
                    let colisao = Colisao2d.criar(corpo1, corpo2);
                    if (colisao.colidiu) {
                        this.colisoes.push(colisao);
                    }
                }
            }
        }
    }

    frame() {
        this._reset();
        this._colisoes();
        
        
        for(let corpo of this.corpos) {
            corpo.integrarForca();
        }
        for(let colisao of this.colisoes) {
            colisao.corrigirRestituicao();
        }
        for(let i = 0; i < 10; i++) {
            for(let colisao of this.colisoes) {
                colisao.aplicarImpulso()
            }
        }
        for(let corpo of this.corpos) {
            corpo.integrarVelocidade();
        }
        for(let colisao of this.colisoes) {
            colisao.corrigirPenetracao();
        }
        for(let corpo of this.corpos) {
            corpo.resetar();
        }
        
    }

    

    desenhar(c, op) {
        for(let corpo of this.corpos) {
            corpo.desenhar(c, op);
        }
    }

    adicForca(f) {
        for(let corpo of this.corpos) {
            corpo.adicForca(f);
        }
    }
}