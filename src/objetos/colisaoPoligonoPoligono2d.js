import { Contato2d } from "./Contato2d.js";

export  class ColisaoPoligonoPoligono2d {
    static calcular(colisao) {

        let corpo1 = colisao.corpo1;
        let corpo2 = colisao.corpo2;
        let forma1 = corpo1.forma;
        let forma2 = corpo2.forma;

        let sat1 = this._SAT(forma1, forma2);

        if (sat1.sobreposicao <= 0) {
            return colisao;
        }

        let sat2 = this._SAT(forma2, forma1);

        if (sat2.sobreposicao <= 0) {
            return colisao;
        }

        let menorSat;

        if (sat1.sobreposicao < sat2.sobreposicao) {
            menorSat = sat1;
            colisao.corpoNorma = corpo1;
        } else {
            menorSat = sat2;
            colisao.corpoNorma = corpo2;
        }

        // important for reuse later
        colisao.indexV = menorSat.indexV;

        //collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
        //collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
        //collision.collided = true;
        colisao.sobreposicao = menorSat.sobreposicao;
        
        //bodyA = collision.bodyA;
        //bodyB = collision.bodyB;

        // ensure normal is facing away from bodyA
        if (menorSat.v.pEsc(corpo2.posV.sub(corpo1.posV)) < 0) {
            colisao.norma = menorSat.v.copia;
        } else {
            colisao.norma = menorSat.v.inv;
        }

        colisao.tangente = colisao.norma.perp;

        colisao.penetracao = colisao.norma.mult(colisao.sobreposicao);

        let contatos = [];
        let vs1 = this._econtrarContato(corpo1, corpo2, colisao.norma);
            

        // find the supports from bodyB that are inside bodyA
        if (this._contemPonto(corpo1, vs1[0]))
            contatos.push(vs1[0]);

        if (this._contemPonto(corpo1, vs1[1]))
            contatos.push(vs1[1]);

        
        if (contatos.length < 2) {
            var vs2 = this._econtrarContato(corpo2, corpo1, colisao.norma.inv);
            
            if (this._contemPonto(corpo2, vs2[0]))
                contatos.push(vs2[0]);

            if (contatos.length < 2 && this._contemPonto(corpo2, vs2[1]))
                contatos.push(vs2[1]);
        }

        if (contatos.length < 1)
            contatos = [vs1[0]];
        
        colisao.contatos = contatos;

        return colisao;
    }

    static _SAT(forma1, forma2) {

        let ret = {
            sobreposicao: Number.MAX_VALUE
        };

        for (let i = 0; i < forma1.vsQtd; i++) {

            let n = forma1.ns[i];
            n = n.mult(forma1.u);

            let projecao1 = this._projetarNorma(forma1, n);
            let projecao2 = this._projetarNorma(forma2, n);

            let sobreposicao = Math.min(projecao1.max - projecao2.min, projecao2.max - projecao1.min);

            if (sobreposicao <= 0) {
                ret.sobreposicao = sobreposicao;
                return ret;
            } else if(sobreposicao < ret.sobreposicao) {
                ret.sobreposicao = sobreposicao;
                ret.indexV = i;
                ret.v = n;
            }

            // let projecao = -Number.MAX_VALUE;
            // let v2 = null;

            // for (let j = 0; j < forma2.vsQtd; j++) {
            //     let v = forma2.vs[j];
            //     let p = v.pEsc(n.inv);

            //     if (p > projecao) {
            //         v2 = v;
            //         projecao = p;
            //     }
            // }

            // // if (!v2) return {
            // //     dist: 1
            // // };

            // let vm = v1.mult(forma1.u);
            // vm = vm.adic(forma1.corpo.posV);
            // vm = vm.sub(forma2.corpo.posV);
            // vm = vm.mult(forma2.u.transp);

            // let d = n.pEsc(v2.sub(vm));

            // if (d > dist) {
            //     dist = d;
            //     indexV = i;
            // }
        }

        return ret;
    }

    static _projetarNorma = function(forma, n) {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let v of forma.vs) {
            
            var dot = v.adic(forma.corpo.posV)
                .mult(forma.u)
                .pEsc(n);

            if (dot > max) { 
                max = dot; 
            } else if (dot < min) { 
                min = dot; 
            }
        }

        return { min, max };
    };

    static _econtrarContato(corpo1, corpo2, n) {
        let distanciaProxima = Number.MAX_VALUE;
        let indexV1;
        let indexV2;

        for(let i = 0; i < corpo2.forma.vsQtd; i++) {
            let v = corpo2.forma.vs[i]
                .adic(corpo2.posV)
                .mult(corpo2.forma.u)
                .sub(corpo1.posV);
            let dist = -n.pEsc(v);

            if (dist < distanciaProxima) {
                distanciaProxima = dist;
                indexV1 = i;
            }

        }

        let antIndexV = indexV1 - 1 >= 0 ? indexV1 - 1 : corpo2.forma.vsQtd - 1;
        let antV = corpo2.forma.vs[antIndexV]
            .adic(corpo2.posV)
            .mult(corpo2.forma.u)
            .sub(corpo1.posV);
        let antDist = -n.pEsc(antV);
        

        let proxIndexV = (indexV1 + 1) % corpo2.forma.vsQtd;
        let proxV = corpo2.forma.vs[proxIndexV]
            .adic(corpo2.posV)
            .mult(corpo2.forma.u)
            .sub(corpo1.posV);
        let proxDist = -n.pEsc(proxV);
        
        
        if (proxDist < antDist) {
            indexV2 = proxIndexV;
        } else {
            indexV2 = antIndexV;
        }

        return [
            corpo2.forma.vs[indexV1].adic(corpo2.posV).mult(corpo2.forma.u),
            corpo2.forma.vs[indexV2].adic(corpo2.posV).mult(corpo2.forma.u)
        ];
    }

    static _contemPonto(corpo, p) {
        for (let i = 0; i<corpo.forma.vsQtd; i++) {
            let v1 = corpo.forma.vs[i]
                .adic(corpo.posV)
                .mult(corpo.forma.u);
            let v2 = corpo.forma.vs[(i+1) % corpo.forma.vsQtd]
                .adic(corpo.posV)
                .mult(corpo.forma.u);
            if ((p.x - v1.x) * (v2.y - v1.y) + (p.y - v1.y) * (v1.x - v2.x) > 0) {
                return false;
            }
        }

        return true;
    }
}


class Face {
    constructor(forma1, forma2, i) {
        this.forma = forma1;
        this.i = i;
        this.n = this.forma.ns[i]
            .mult(this.forma.u)
            .mult(forma2.u.transp);

        this.v1 = this.forma.vs[i]
            .mult(this.forma.u)
            .adic(this.forma.corpo.posV);
            
        this.v2 = this.forma.vs[(i+1)%this.forma.vsQtd]
            .mult(this.forma.u)
            .adic(this.forma.corpo.posV);

        this.plano = this.v2.sub(this.v1).norm();
        this.perp = this.plano.perp;
        this.dist = this.v1.pEsc(this.perp)
        this.ladoNeg = -this.v1.pEsc(this.plano);
        this.ladoPosi = this.v2.pEsc(this.plano);
    }

    cortar(plano, lado) {
		let vs = [];

		let d1 = this.v1.pEsc(plano) - lado;
		let d2 = this.v2.pEsc(plano) - lado;

		if (d1 <= 0) vs.push(this.v1);
		if (d2 <= 0) vs.push(this.v2);

		if (d1 * d2 < 0)
		{
			let a = d1 / (d1 - d2);
            let v = this.v2.sub(this.v1)
                .mult(a)
                .adic(this.v1);
            vs.push(v);
		}

        if (vs.length<2) return false;
        
        this.v1 = vs[0];
        this.v2 = vs[1];

        return true;
    }
}