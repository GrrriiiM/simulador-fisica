import { SAT } from "./SAT.js";
import { Vetor2d } from "./vetor2d.js";

export class Colisao2d {

    static criar(corpo1, corpo2) {
        let c = new Colisao2d();
        c._calcular(corpo1.forma, corpo2.forma);
        return c;
    }

    constructor() {
        this.contatos = [];
        this.colidiu = false;
        this.penetracao = 0;
        this.norma = Vetor2d.criarPos(0, 0);
    }

    _calcular(forma1, forma2) {

        let forma1Min = forma1.area[0].mult(forma1.u).adic(forma1.corpo.posV);
        let forma1max = forma1.area[1].mult(forma1.u).adic(forma1.corpo.posV);
        let forma2Min = forma2.area[0].mult(forma2.u).adic(forma2.corpo.posV);
        let forma2Max = forma2.area[1].mult(forma2.u).adic(forma2.corpo.posV);

        // if ((forma1max.x < forma2Min.x || forma1Min.x > forma2Max.x)) return;
        // if ((forma1max.y < forma2Min.y || forma1Min.y > forma2Max.y)) return;  

        let referencia;
        let incidente;
        
        let sat1 = SAT.calcular(forma1, forma2);
        let sat2 = SAT.calcular(forma2, forma1);

        const BIAS_RELATIVE = 0.95;
        const BIAS_ABSOLUTE = 0.01;

        if (sat1.dist >= 0 || sat2.dist >= 0) return;
		// Determine which shape contains reference face
		// if (penetrationA >=  penetrationB * BIAS_RELATIVE + penetrationA * BIAS_ABSOLUTE) {

        let virar = false;
        if (sat1.dist >= sat2.dist * BIAS_RELATIVE + sat1.dist * BIAS_ABSOLUTE) {
            referencia = new Face(forma1, forma2, sat1.indexV);
            let i = this._indiceNormaProxima(forma2, referencia.n);
            incidente = new Face(forma2, forma1, i);
        } else {
            referencia = new Face(forma2, forma1, sat2.indexV);
            let i = this._indiceNormaProxima(forma1, referencia.n);
            incidente = new Face(forma1, forma2, i);
            virar = true;
        }

        this.norma = referencia.perp;

        if (!incidente.cortar(referencia.plano.inv, referencia.ladoNeg)) return;

        if (!incidente.cortar(referencia.plano, referencia.ladoPosi)) return;

        

        let separacao = incidente.v1.pEsc(referencia.perp) - referencia.dist;
        if (separacao <= 0) {
            this.contatos.push(incidente.v1.copia);
            this.penetracao = -separacao;
        } else {
            this.penetracao = 0;
        }

        separacao = incidente.v2.pEsc(referencia.perp) - referencia.dist;
		if (separacao <= 0) {
            this.contatos.push(incidente.v2);
            this.penetracao += -separacao;
            this.penetracao /= this.contatos.length
		}
        
        this.referencia = referencia.forma;
        this.incidente = incidente.forma;
        this.colidiu = true;
        this.restituicao = Math.min(forma1.corpo.restituicao, forma2.corpo.restituicao);
        this.friccaoEstatica = Math.sqrt(forma1.corpo.friccaoEstatica*forma1.corpo.friccaoEstatica + forma2.corpo.friccaoEstatica*forma2.corpo.friccaoEstatica);
        this.friccaoDinamica = Math.sqrt(forma1.corpo.friccaoDinamica*forma1.corpo.friccaoDinamica + forma2.corpo.friccaoDinamica*forma2.corpo.friccaoDinamica);
    }

    _indiceNormaProxima(forma, norma) {
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

    corrigirRestituicao() {
        //this.restituicao = 0;
        // for (let contato of this.contatos) {
		// 	//let ra = contato.sub(this.referencia.forma.corpo.posV);
		// 	//let rb = contato.sub(this.incidente.forma.corpo.posV);

		// 	//let vv = Vetor2.vetorial(rb, -this.B.velocidadeAngular);
		// 	let rv = this.incidente.corpo.velV;
		// 	//rv.adic(vv);
        //     rv.sub(this.referencia.corpo.velV);
        //     //rv.sub(Vetor2.vetorial(ra, -this.A.velocidadeAngular));

        //     if (rv.magQ < 1)
        //     {
        //     	this.restituicao = 0;
        //     }
		// }
    }

    aplicarImpulso() {
        let corpo1 = this.referencia.corpo;
        let corpo2 = this.incidente.corpo;

		if (corpo1.massaInv + corpo2.massaInv == 0) {
			this._corrigirPosicaoEstatico();
			return;
		}

		for (let contato of this.contatos) {
            
			let ra = contato.sub(corpo1.posV);
			let rb = contato.sub(corpo2.posV);

            let rv = corpo2.velV
                .adic(rb.pVet(-corpo2.velAng))
                .sub(corpo1.velV)
                .sub(ra.pVet(-corpo1.velAng));

			let contatoVel = rv.pEsc(this.norma);

			if (contatoVel > 0)
			{
				return;
			}
			let raCrossN = ra.pVet(this.norma);
			let rbCrossN = rb.pVet(this.norma);
			let invMassSum = corpo1.massaInv + corpo2.massaInv + (raCrossN * raCrossN) * corpo1.inerciaInv + (rbCrossN * rbCrossN) * corpo2.inerciaInv;

			// Calculate impulse scalar
			let j = -(1 + this.restituicao) * contatoVel;
			j /= invMassSum;
			j /= this.contatos.length;

			// Apply impulse
			let impulse = this.norma.mult(j);
			corpo1.aplicarImpulso(impulse.inv, ra);
			corpo2.aplicarImpulso(impulse, rb);

			// Friction impulse
			// rv = B->velocity + Cross( B->angularVelocity, rb ) -
			// A->velocity - Cross( A->angularVelocity, ra );
            rv = corpo2.velV
                .adic(rb.pVet(-corpo2.velAng))
                .sub(corpo1.velV)
                .sub(ra.pVet(-corpo1.velAng));

			// Vec2 t = rv - (normal * Dot( rv, normal ));
			// t.Normalize( );
            let t = rv
                .adic(this.norma.mult(rv.pEsc(this.norma)))
			    .norm();

			// j tangent magnitude
			let jt = -rv.pEsc(t);
			jt /= invMassSum;
			jt /= this.contatos.length;

			// Don't apply tiny friction impulses
			if (jt == 0) {
				return;
			}

            let tangentImpulse;
            
			if (Math.abs(jt) < j * this.friccaoEstatica) {
				tangentImpulse = t.mult(jt);
			} else {
				tangentImpulse = t.mult(j).mult(-this.friccaoDinamica);
			}

			corpo1.aplicarImpulso(tangentImpulse.inv, ra);
			corpo2.aplicarImpulso(tangentImpulse, rb);
		}
    }
    
    _corrigirPosicaoEstatico(){
        this.referencia.velV.x = 0;
        this.referencia.velV.y = 0;
		this.incidente.velV.x = 0;
        this.incidente.velV.y = 0;
    }

    corrigirPenetracao() {
        let corpo1 = this.referencia.corpo;
        let corpo2 = this.incidente.corpo;
        const penetracaoPermitida = 0.05;
        const penetracaoCorrecao = 0.4;
        let correcao = Math.max(this.penetracao - penetracaoPermitida, 0) / (corpo1.massaInv + corpo2.massaInv) * penetracaoCorrecao;

        corpo1.posV = corpo1.posV.adic(this.norma.mult(-corpo1.massaInv * correcao));
        corpo2.posV = corpo2.posV.adic(this.norma.mult(corpo2.massaInv * correcao));
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