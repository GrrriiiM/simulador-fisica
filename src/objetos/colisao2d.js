import { SAT } from "./SAT.js";

export class Colisao2d {

    static calcular(forma1, forma2) {
        let ret = {
            contatos: [],
            penetracao: 0
        };

        let forma1Min = forma1.area[0].adic(forma1.corpo.posV);
        let forma1max = forma1.area[1].adic(forma1.corpo.posV);
        let forma2Min = forma2.area[0].adic(forma2.corpo.posV);
        let forma2Max = forma2.area[1].adic(forma2.corpo.posV);

        if ((forma1max.x < forma2Min.x || forma1Min.x > forma2Max.x)) return ret;
        if ((forma1max.y < forma2Min.y || forma1Min.y > forma2Max.y)) return ret;  

        let referencia;
        let incidente;
        
        let sat1 = SAT.calcular(forma1, forma2);
        let sat2 = SAT.calcular(forma2, forma1);
        let virar = false;
        if (sat1.dist <= 0 && sat2.dist <= 0) {
            if (sat1.dist > sat2.dist) {
                referencia = new Face(forma1, sat1.indexV);
                let i = this.indiceNormaProxima(forma2, referencia.n);
                incidente = new Face(forma2, i);
            } else {
                referencia = new Face(forma2, sat2.indexV);
                let i = this.indiceNormaProxima(forma1, referencia.n);
                incidente = new Face(forma1, i);
                virar = true;
            }
        }
        else
        {
            return ret;
        }

        ret.n = referencia.n;
		if (virar) {
			ret.n = ret.n.inv;
        }
        
        // ret.contatos.push(incidente.v1);
        // ret.contatos.push(incidente.v2);
        // ret.contatos.push(referencia.v1);
        // ret.contatos.push(referencia.v2);

        if (!incidente.cortar(referencia.plano.inv, referencia.ladoNeg)) return ret;

        if (!incidente.cortar(referencia.plano, referencia.ladoPosi)) return ret;

        

        let separacao = incidente.v1.pEsc(referencia.perp) - referencia.dist;
        if (separacao <= 0) {
            ret.contatos.push(incidente.v1.copia);
            ret.penetracao = -separacao;
        } else {
            ret.penetracao = 0;
        }

        separacao = incidente.v2.pEsc(referencia.perp) - referencia.dist;
		if (separacao <= 0) {
            ret.contatos.push(incidente.v2);
            ret.penetracao += -separacao;
            ret.penetracao /= ret.contatos.length
		}
        
        return ret;
    }

    static indiceNormaProxima(forma, norma) {
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

    static cortes(n, neg, f1, f2) {
        let ret = {
            cortes: 0,
            f1: f1,
            f2: f2
        }

		let d1 =  f1.pEsc(n) - neg;
		let d2 = f2.pEsc(n) - neg;

		if (d1 <= 0) {
            ret.cortes += 1;
            if (ret.cortes==1) {
                ret.f1 = f1;
            }
        }
        if (d2 <= 0) {
            ret.cortes += 1;
            if (ret.cortes==1) {
                ret.f1 = f2;
            }
        }

		if (d1 * d2 < 0) {
            let a = d1 / (d1 - d2);
            ret.cortes += 1;
            ret.f2 = f2;
            ret.f2 = ret.f2.sub(f1);
            ret.f2 = ret.f2.mult(a);
            ret.f2 = ret.f2.adic(f1);
		}

		return ret;
    }

    
}

class Face {
    constructor(forma, i) {
        this.forma = forma;
        this.i = i;
        this.n = this.forma.ns[i]
            .mult(this.forma.u)
            .mult(this.forma.u.transp);

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