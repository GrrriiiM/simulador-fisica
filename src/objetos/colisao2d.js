import { ColisaoPoligonoPoligono2d } from "./colisaoPoligonoPoligono2d.js"
import { Vetor2d } from "./vetor2d.js";
import { Poligono2d } from "./poligono2d.js";
import { Circulo2d } from "./circulo2d.js";
import { ColisaoPoligonoCirculo2d } from "./colisaoPoligonoCirculo2d.js";
import { ColisaoCirculoCirculo2d } from "./colisaoCirculoCirculo2d.js";

export class Colisao2d {

    static criar(mundo, corpo1, corpo2) {
        let c = new Colisao2d();
        c.mundo = mundo;
        c.corpo1 = corpo1;
        c.corpo2 = corpo2;
        if (corpo1.massaInv == 0 && corpo2.massaInv == 0) return c;
        c._calcular();
        // if (c.colidiu) {
        //     if (c.equilibrado(c.corpo1)) c.corpo1.penetrado = true;
        //     if (c.equilibrado(c.corpo2)) c.corpo2.penetrado = true;
        // }
        return c;
    }

    centroContato() {
        let contato = this.contatos[0];

        if (this.contatos.length>1)
            contato = this.contatos[1].sub(contato).div(2).adic(contato);

        return contato;
    }

    equilibrado(corpo) {
        let contato = this.centroContato();
        let r = contato.sub(corpo.posV);
        let e = r.norm().igual(this.mundo.gravidade.norm());
        return e;
    }

    constructor() {
        this.contatos = [];
        this.penetracao = 0;
        this.norma = Vetor2d.criarPos(0, 0);
    }

    get colidiu() { return this.contatos.length > 0}

    _calcular() {
        if (this.corpo1.forma instanceof Poligono2d && this.corpo2.forma instanceof Poligono2d) {
            ColisaoPoligonoPoligono2d.calcular(this);
        } else if (this.corpo1.forma instanceof Circulo2d && this.corpo2.forma instanceof Circulo2d) {
            ColisaoCirculoCirculo2d.calcular(this);
        } else if (this.corpo1.forma instanceof Poligono2d && this.corpo2.forma instanceof Circulo2d) {
            ColisaoPoligonoCirculo2d.calcular(this);
            this.norma = this.norma.inv;
        } else if (this.corpo1.forma instanceof Circulo2d && this.corpo2.forma instanceof Poligono2d) {
            [this.corpo1, this.corpo2] = [this.corpo2, this.corpo1];
            ColisaoPoligonoCirculo2d.calcular(this);
        }
        


        this.restituicao = Math.min(this.corpo1.restituicao, this.corpo2.restituicao);
        this.friccaoEstatica = Math.sqrt(this.corpo1.friccaoEstatica*this.corpo1.friccaoEstatica + this.corpo2.friccaoEstatica*this.corpo2.friccaoEstatica);
        this.friccaoDinamica = Math.sqrt(this.corpo1.friccaoDinamica*this.corpo1.friccaoDinamica + this.corpo2.friccaoDinamica*this.corpo2.friccaoDinamica);
    }

    

    corrigirRestituicao() {
        //this.restituicao = 0;
        if (this.mundo.gravidade) {
            for (let contato of this.contatos) {
                let ra = contato.sub(this.corpo1.posV);
                let rb = contato.sub(this.corpo2.posV);

                let vv = rb.pVet(-this.corpo2.velAng);
                let rv = this.corpo2.velV;
                rv = rv.adic(vv);
                rv = rv.sub(this.corpo1.velV);
                rv = rv.sub(ra.pVet(-this.corpo1.velAng));

                if (rv.magQ < this.mundo.gravidade.magQ)
                {
                    this.restituicao = 0;
                }
            }
		}
    }

    aplicarImpulso() {
        

        let corpo1 = this.corpo1;
        let corpo2 = this.corpo2;

		if (corpo1.massaInv + corpo2.massaInv == 0) {
			this._corrigirPosicaoEstatico();
			return;
		}

        let impulsos = [];

        let contatos = this.contatos;
        if (this.restituicao > 0) {
            let contato = contatos[0];

            if (contatos.length>1)
                contato = contatos[1].sub(contato).div(2).adic(contato);

            contatos = [ contato ];
        }
        
		for (let contato of contatos) {

            let r1 = contato.sub(corpo1.posV);
            let r2 = contato.sub(corpo2.posV);

            let velRelativa = corpo2.velV
                .adic(r2.pVet(-corpo2.velAng))
                .sub(corpo1.velV)
                .sub(r1.pVet(-corpo1.velAng));
                
            let contatoVel = velRelativa.pEsc(this.norma);

            if (contatoVel >= 0) return;

            let r1VetNorma = r1.pVet(this.norma);
            let r2VetNorma = r2.pVet(this.norma);
            
            let massaInvTotal = corpo1.massaInv + corpo2.massaInv;
            massaInvTotal += r1VetNorma * r1VetNorma * corpo1.inerciaInv;
            massaInvTotal += r2VetNorma * r2VetNorma * corpo2.inerciaInv;

            let velMag = -(1 + this.restituicao);
            velMag *= contatoVel;
            velMag /= massaInvTotal;
            velMag /= contatos.length;

            let impulso = this.norma.mult(velMag);

            impulsos.push({ impulso, contato });

            // corpo1.aplicarImpulso(impulso.inv, r1);
            // corpo2.aplicarImpulso(impulso, r2);

            // velRelativa = corpo2.velV
            //     .adic(r2.pVet(-corpo2.velAng))
            //     .sub(corpo1.velV)
            //     .sub(r1.pVet(-corpo1.velAng));

            let tangente = velRelativa
                .sub(this.norma.mult(velRelativa.pEsc(this.norma)))
                .norm();
       
            let tangenteMag = -velRelativa.pEsc(tangente);
            tangenteMag /= massaInvTotal;
            tangenteMag /= contatos.length;


            if(Math.abs(tangenteMag) < velMag * this.friccaoEstatica)
                impulso = tangente.mult(tangenteMag);
            else
                impulso = tangente.mult(velMag).mult(-this.friccaoDinamica);


            //impulsos.push({ impulso, contato });

            // corpo1.aplicarImpulso(impulso.inv, r1);
            // corpo2.aplicarImpulso(impulso, r2);

            
        }

        // impulsos.forEach(_ => {
        //     corpo1.aplicarImpulso(_.impulso.inv, _.contato.sub(corpo1.posV));
        //     corpo2.aplicarImpulso(_.impulso, _.contato.sub(corpo2.posV));
        // });

        //impulsos = [];
        //contatos = this.contatos;
        for (let contato of contatos) {

            let r1 = contato.sub(corpo1.posV);
            let r2 = contato.sub(corpo2.posV);

            let velRelativa = corpo2.velV
                .adic(r2.pVet(-corpo2.velAng))
                .sub(corpo1.velV)
                .sub(r1.pVet(-corpo1.velAng));
                
            let contatoVel = velRelativa.pEsc(this.norma);

            //if (contatoVel >= 0) return;

            let r1VetNorma = r1.pVet(this.norma);
            let r2VetNorma = r2.pVet(this.norma);
            
            let massaInvTotal = corpo1.massaInv + corpo2.massaInv;
            massaInvTotal += r1VetNorma * r1VetNorma * corpo1.inerciaInv;
            massaInvTotal += r2VetNorma * r2VetNorma * corpo2.inerciaInv;

            let velMag = -(1 + this.restituicao);
            velMag *= contatoVel;
            velMag /= massaInvTotal;
            velMag /= contatos.length;

            //let impulso = this.norma.mult(velMag);

            //impulsos.push({ impulso, contato });

            // corpo1.aplicarImpulso(impulso.inv, r1);
            // corpo2.aplicarImpulso(impulso, r2);

            // velRelativa = corpo2.velV
            //     .adic(r2.pVet(-corpo2.velAng))
            //     .sub(corpo1.velV)
            //     .sub(r1.pVet(-corpo1.velAng));

            let tangente = velRelativa
                .sub(this.norma.mult(velRelativa.pEsc(this.norma)))
                .norm();
       
            let tangenteMag = -velRelativa.pEsc(tangente);
            tangenteMag /= massaInvTotal;
            tangenteMag /= contatos.length;

            let impulso;
            if(Math.abs(tangenteMag) < velMag * this.friccaoEstatica)
                impulso = tangente.mult(tangenteMag);
            else
                impulso = tangente.mult(velMag).mult(-this.friccaoDinamica);


            impulsos.push({ impulso, contato });

            // corpo1.aplicarImpulso(impulso.inv, r1);
            // corpo2.aplicarImpulso(impulso, r2);

            
        }

        impulsos.forEach(_ => {
            corpo1.aplicarImpulso(_.impulso.inv, _.contato.sub(corpo1.posV));
            corpo2.aplicarImpulso(_.impulso, _.contato.sub(corpo2.posV));
        });
    }

    // aplicarImpulsoTangente() {
    //     let corpo1 = this.corpo1;
    //     let corpo2 = this.corpo2;

	// 	if (corpo1.massaInv + corpo2.massaInv == 0) {
	// 		this._corrigirPosicaoEstatico();
	// 		return;
	// 	}

    //     let impulsos = [];

    //     let contatos = this.contatos;
    //     if (this.restituicao > 0) {
    //         let contato = contatos[0];

    //         if (contatos.length>1)
    //             contato = contatos[1].sub(contato).div(2).adic(contato);

    //         contatos = [ contato ];
    //     }
        
	// 	for (let contato of contatos) {

    //         let r1 = contato.sub(corpo1.posV);
    //         let r2 = contato.sub(corpo2.posV);

    //         let velRelativa = corpo2.velV
    //             .adic(r2.pVet(-corpo2.velAng))
    //             .sub(corpo1.velV)
    //             .sub(r1.pVet(-corpo1.velAng));
                
    //         let contatoVel = velRelativa.pEsc(this.norma);

    //         if (contatoVel >= 0) return;

    //         let r1VetNorma = r1.pVet(this.norma);
    //         let r2VetNorma = r2.pVet(this.norma);
            
    //         let massaInvTotal = corpo1.massaInv + corpo2.massaInv;
    //         massaInvTotal += r1VetNorma * r1VetNorma * corpo1.inerciaInv;
    //         massaInvTotal += r2VetNorma * r2VetNorma * corpo2.inerciaInv;

    //         let velMag = -(1 + this.restituicao);
    //         velMag *= contatoVel;
    //         velMag /= massaInvTotal;
    //         velMag /= contatos.length;

    //         velRelativa = corpo2.velV
    //             .adic(r2.pVet(-corpo2.velAng))
    //             .sub(corpo1.velV)
    //             .sub(r1.pVet(-corpo1.velAng));

    //         let tangente = velRelativa
    //             .sub(this.norma.mult(velRelativa.pEsc(this.norma)))
    //             .norm();
       
    //         let tangenteMag = -velRelativa.pEsc(tangente);
    //         tangenteMag /= massaInvTotal;
    //         tangenteMag /= contatos.length;

    //         if(tangente >= -1 && tangente <= 1)
    //             return;
    //         let impulso;
    //         if(Math.abs(tangenteMag) < velMag * this.friccaoEstatica)
    //             impulso = tangente.mult(tangenteMag);
    //         else
    //             impulso = tangente.mult(velMag).mult(-this.friccaoDinamica);

    //         impulsos.push({ impulso: impulso.copia, contato: contato.copia });
    //     }

    //     impulsos.forEach(_ => {
    //         corpo1.aplicarImpulso(_.impulso.inv, _.contato.sub(corpo1.posV));
    //         corpo2.aplicarImpulso(_.impulso, _.contato.sub(corpo2.posV));
    //     })
        
    // }
    
    _corrigirPosicaoEstatico(){
        this.corpo1.velV.x = 0;
        this.corpo1.velV.y = 0;
		this.corpo2.velV.x = 0;
        this.corpo2.velV.y = 0;
    }

    corrigirPenetracao() {
        let corpo1 = this.corpo1;
        let corpo2 = this.corpo2;
        const penetracaoPermitida = 0.05;
        const penetracaoCorrecao = 0.4;
        let correcao = Math.max(this.penetracao - penetracaoPermitida, 0) / (corpo1.massaInv + corpo2.massaInv) * penetracaoCorrecao;
        //let correcao = this.penetracao / (corpo1.massaInv + corpo2.massaInv);

        corpo1.posV = corpo1.posV.adic(this.norma.mult(-corpo1.massaInv * correcao));
        corpo2.posV = corpo2.posV.adic(this.norma.mult(corpo2.massaInv * correcao));
    }

    
}
