import { Contato2d } from "./Contato2d.js";

export  class ColisaoPoligonoPoligono2d {
    static calcular(colisao) {
        let forma1 = colisao.corpo1.forma;
        let forma2 = colisao.corpo2.forma;

        let min1 = forma1.min.adic(forma1.corpo.posV);
        let max1 = forma1.max.adic(forma1.corpo.posV);
        let min2 = forma2.min.adic(forma2.corpo.posV);
        let max2 = forma2.max.adic(forma2.corpo.posV);

        // if (!(min1.x < max2.x && min2.x < max1.x
        //     && min1.y < max2.y && min2.y < max1.y))
        //     return;

        let referencia;
        let incidente;
        
        let sat1 = this._SAT(forma1, forma2);   

        if (sat1.dist >= 0) return;

        let sat2 = this._SAT(forma2, forma1);

        if (sat1.dist >= 0) return;

        const BIAS_RELATIVE = 0.95;
        const BIAS_ABSOLUTE = 0.01;

        let virar = false;
        if (sat1.dist >= sat2.dist * BIAS_RELATIVE + sat1.dist * BIAS_ABSOLUTE) {
            referencia = new Face(forma1, forma2, sat1.indexV);
            let i = this._indiceNormaMaisProxima(forma2, referencia.n);
            incidente = new Face(forma2, forma1, i);
        } else {
            referencia = new Face(forma2, forma1, sat2.indexV);
            let i = this._indiceNormaMaisProxima(forma1, referencia.n);
            incidente = new Face(forma1, forma2, i);
            virar = true;
        }

        colisao.norma = referencia.perp;
        
        if (virar) colisao.norma = colisao.norma.inv;

        if (!incidente.cortar(referencia.plano.inv, referencia.ladoNeg)) return;

        if (!incidente.cortar(referencia.plano, referencia.ladoPosi)) return;

        

        let separacao = incidente.v1.pEsc(referencia.perp) - referencia.dist;
        if (separacao <= 0) {
            colisao.contatos.push(new Contato2d(incidente.v1.copia));
            colisao.penetracao = -separacao;
        } else {
            colisao.penetracao = 0;
        }

        separacao = incidente.v2.pEsc(referencia.perp) - referencia.dist;
		if (separacao <= 0) {
            colisao.contatos.push(new Contato2d(incidente.v2.copia));
            colisao.penetracao += -separacao;
            colisao.penetracao /= colisao.contatos.length
		}
        
    }

    static _SAT(forma1, forma2) {
        let dist = -Number.MAX_VALUE;
        let indexV = 0;

        for (let i = 0; i < forma1.vsQtd; i++) {
            let v1 = forma1.vs[i]
            let n = forma1.ns[i];
            n = n.mult(forma1.u);
            n = n.mult(forma2.u.transp);


            let projecao = -Number.MAX_VALUE;
            let v2 = null;

            for (let j = 0; j < forma2.vsQtd; j++) {
                let v = forma2.vs[j];
                let p = v.pEsc(n.inv);

                if (p > projecao) {
                    v2 = v;
                    projecao = p;
                }
            }

            // if (!v2) return {
            //     dist: 1
            // };

            let vm = v1.mult(forma1.u);
            vm = vm.adic(forma1.corpo.posV);
            vm = vm.sub(forma2.corpo.posV);
            vm = vm.mult(forma2.u.transp);

            let d = n.pEsc(v2.sub(vm));

            if (d > dist) {
                dist = d;
                indexV = i;
            }
        }

        return {
            dist: dist,
            indexV: indexV,
            v: forma1.vs[indexV]
        };
    }

    static _indiceNormaMaisProxima(forma, norma) {
        let i = 0;
        let minD = Number.MAX_VALUE;
		for (let j = 0; j < forma.vsQtd; ++j) {
            let n = forma.ns[j];
			let d = n.pEsc(norma);
			if (d < minD) {
				minD = d;
				i = j;
			}
        }
        return i;
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