import { Vetor2d } from "./vetor2d.js";
import { Corpo2d } from "./corpo2d.js";
import { Colisao2d } from "./colisao2d.js";
import { Poligono2d } from "./poligono2d.js";

export class Mundo2d {
    static criar(x, y, w, h, op) {
        let mundo = new Mundo2d();
        mundo.posV = Vetor2d.criarPos(x, y);
        mundo.w = w;
        mundo.h = h;
        mundo.corpos = [];
        mundo.colisoes = [];
        Object.assign(mundo, op);
        if (mundo.paredes instanceof Array) {
            mundo._adicParedes(...mundo.paredes)
        } else if(mundo.paredes) {
            mundo._adicParedes(true, true, true, true);
        }
        if (mundo.gravidade) {
            if (typeof(mundo.gravidade) == typeof(0)) {
                mundo.gravidade = Vetor2d.criarAng(90, mundo.gravidade);
            }
        }
        return mundo;
    }

    adic(posV, forma, op) {
        let corpo = Corpo2d.criar(posV, forma, op);
        this.corpos.push(corpo);
        return corpo;
    }

    _adicParedes(r,b,l,t) {
        if (r) this.adic(Vetor2d.criarPos(this.w+249, this.h/2), Poligono2d.criarRetangulo(500, this.h), Corpo2d.estatico({ corrigirDeslocamento: false }));
        if (b) this.adic(Vetor2d.criarPos(this.w/2, this.h+248), Poligono2d.criarRetangulo(this.w, 500), Corpo2d.estatico({ corrigirDeslocamento: false }));
        if (l) this.adic(Vetor2d.criarPos(-249, this.h/2), Poligono2d.criarRetangulo(500, this.h), Corpo2d.estatico({ corrigirDeslocamento: false }));
        if (t) this.adic(Vetor2d.criarPos(this.w/2, -249), Poligono2d.criarRetangulo(this.w, 500, { corrigirDeslocamento: false }), Corpo2d.estatico());
        
    }

    _reset() {
        this.colisoes = [];
    }

    

    frame() {
        this.aplicarGravidade();
        this.atualizarCorpos();

        this.colisoes = this._colisoes();

        this.prepararColisoes();

        this.solucionarColisoes();

        this.aplicarImpulso();

        
    }

    aplicarGravidade() {
        if (this.gravidade) {
            for(let corpo of this.corpos) {
                corpo.adicionarAceleracao(this.gravidade.div(corpo.massaInv));
            }
        }
    }

    atualizarCorpos() {
        for(let corpo of this.corpos) {
            corpo.atualizar();
        }
    }

    detectarColisoes() {
        let colisoes = [];
        for(let i = 0; i<this.corpos.length; i++) {
            let corpo1 = this.corpos[i];
            for(let j = i+1;j<this.corpos.length;j++) {
                let corpo2 = this.corpos[j];
                if (corpo1.massaInv > 0 || corpo2.massaInv > 0) {
                    let colisao = Colisao2d.criar(this, corpo1, corpo2);
                    if (colisao.colidiu) {
                        colisoes.push(colisao);
                    }
                }
            }
        }
        this.colisoes = colisoes;
    }

    prepararColisoes() {
        for(let colisao in this.colisoes) {
            colisao.preparar();   
        }
    }

    solucionarColisoes() {
        for(let i=0; i<10; i++) {
            for(let colisao in this.colisoes) {
                colisao.solucionar();   
            }
        }
    }

    aplicarImpulso() {
        for(let corpo of this.corpos) {
            corpo.aplicarImpulso();
        }
    }
    

    desenhar(c, op) {
        for(let corpo of this.corpos) {
            corpo.desenhar(c, op);
        }
    }

    
}