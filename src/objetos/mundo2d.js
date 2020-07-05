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

    _colisoes() {
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
        return colisoes;
    }

    frame() {
        this._reset();
        this.colisoes = this._colisoes();
        
        for(let corpo of this.corpos) {
            this.integrarForca(corpo);
        }

        for(let colisao of this.colisoes) {
            colisao.corrigirRestituicao();
        }
        for(let i = 0; i < 10; i++) {
            for(let colisao of this.colisoes) {
                colisao.aplicarImpulso();
                //colisao.aplicarImpulsoTangente();
            }
        }
        for(let corpo of this.corpos) {
            this.integrarVelocidade(corpo);
        }
        
        for(let colisao of this.colisoes) {
            colisao.corrigirPenetracao();
        }

        // for(let i=0;i<10;i++) {
        //     for(let colisao of this._colisoes()) {
        //         colisao.corrigirPenetracao();
        //     }
        // }
        for(let corpo of this.corpos) {
            corpo.resetar();
        }
        
    }



    integrarForca(corpo, frameRate) {
        if (corpo.estatico) {
            return;
        }

		let dts = 0.5;

        if (!corpo.penetrado)
            corpo.velV = corpo.velV.adic(this.gravidade.mult(dts));
        corpo.velV = corpo.velV.adic(corpo.acelV.mult(dts));

		corpo.velAng += corpo.torque * corpo.inerciaInv * dts;
    }

    integrarVelocidade(corpo, frameRate) {

        if (corpo.estatico) {
            return;
        }

		corpo.posV = corpo.posV.adic(corpo.velV);
		corpo.orient += corpo.velAng/(Math.PI/180);;
		

		this.integrarForca(corpo, frameRate);
    }
    

    desenhar(c, op) {
        for(let corpo of this.corpos) {
            corpo.desenhar(c, op);
        }
    }

    
}