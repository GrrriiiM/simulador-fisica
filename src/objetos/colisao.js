import { SAT } from "./SAT.js";

export class Colisao {

    static calcular(forma1, forma2, n) {
        let ret = {
            contatos: [],
            penetracao: 0,
            n: n
        };
        let sat1 = SAT.calcular(forma1, forma2);
        let sat2 = SAT.calcular(forma2, forma1);
        let formaRef;
        let formaInc;
        let faceRefI;
        let virar = false
        if (sat1.dist < 0 && sat2.dist < 0) {
            if (sat1.dist >= sat2.dist) {
                formaRef = forma1;
                formaInc = forma2;
                faceRefI = sat1.indexV;
                virar= false;
            } else {
                formaRef = forma2;
                formaInc = forma1;
                faceRefI = sat2.indexV;
                virar = true;
            }
        }

        let nRef = formaRef.ns[faceRefI];
		nRef = nRef.mult(formaRef.u);
		nRef = nRef.mult(formaInc.u.transp);

		let faceIncI;
		let minDot = Number.MAX_VALUE;
		for (let i = 0; i < formaInc.vsQtd; ++i) {
            let v = formaInc.ns[i];
			let dot = v.pEsc(nRef);
			if (dot < minDot) {
				minDot = dot;
				faceIncI = i;
			}
		}

		let vInc1 = formaInc.vs[faceIncI];
		vInc1 = vInc1.mult(formaInc.u);
		vInc1 = vInc1.adic(formaInc.corpo.posV);

		let vInc2 = formaInc.vs[(faceIncI+1)%formaInc.vsQtd].copia;
		vInc2 = vInc2.mult(formaInc.u);
        vInc2 = vInc2.adic(formaInc.corpo.posV);
        
        let vRef1 = formaRef.vs[faceRefI];
		vRef1 = vRef1.mult(formaRef.u);
		vRef1 = vRef1.adic(formaRef.corpo.posV);

		let vRef2 = formaRef.vs[(faceRefI+1)%formaRef.vsQtd].copia;
		vRef2 = vRef2.mult(formaRef.u);
		vRef2 = vRef2.adic(formaRef.corpo.posV);

        let nRefFaceL = vRef2.sub(vRef1).norm();

        let nRefFace = nRefFaceL.perp; 

        let refEsc = vRef1.pEsc(nRefFace);
        let refEscNeg = -vRef1.pEsc(nRefFaceL);
        let refEscPos = vRef2.pEsc(nRefFaceL);

        let corte = this.cortes(nRefFaceL.inv, refEscNeg, vInc1, vInc2);

        if (corte.cortes<2) return;

        corte = this.cortes(nRefFaceL, refEscPos, corte.f1, corte.f2);

        if (corte.cortes<2) return;

        ret.n = nRefFace;
		if (virar) {
			ret.n = ret.n.inv;
		}

        let separacao = corte.f1.pEsc(nRefFace) - refEsc;
        if (separacao <= 0) {
            ret.contatos.push(corte.f1);
            ret.penetracao += -separacao;
        } else {
            penetracao = 0;
        }

        separacao = corte.f2.pEsc(nRefFace) - refEsc;
		if (separacao <= 0) {
            ret.contatos.push(corte.f2);
            ret.penetracao += -separacao;
            ret.penetracao /= ret.contatos.length
		}
        
        return ret;
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