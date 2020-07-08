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

    
    preparar() {
        this.corpo1.qtdContatos += this.contatos.length;
        this.corpo2.qtdContatos += this.contatos.length;
    }

    solucionar() {
        let corpo1 = this.corpo1;
        let corpo2 = this.corpo2;
        let dist = Vetor2d.sub(Vetor2d.adic(corpo1.posVimpulso, corpo1.posV), 
            Vetor2d.adic(corpo2.posVimpulso, 
                Vetor2d.sub(corpo1.posV, this.penetracao)));

        let separacao = this.norma.pEsc(dist);

        let impulso = (separacao - 0.05);

        if (this.corpo1.estatico || this.corpo2.estatico)
            impulso *= 2;
        
        let _positionDampen = 0.9;

        if (!(this.corpo1.estatico)) {
            let compartilhado = _positionDampen / this.corpo1.qtdContatos;
            this.corpo1.posVimpulso = this.corpo1.posVimpulso.adic(this.norma.mult(impulso * compartilhado));
        }

        if (!(this.corpo2.estatico)) {
            let compartilhado = _positionDampen / this.corpo2.qtdContatos;
            this.corpo2.posVimpulso = this.corpo2.posVimpulso.sub(this.norma.mult(impulso * compartilhado));
        }
    }

    prepararVelocidade() {
        let corpo1 = this.corpo1;
        let corpo2 = this.corpo2;
        let tangente = this.norma.perp;
        let impulsoNorma = 0;
        let impulsoTangente = 0;
        let impulso = Vetor2d.criar();
            
        for (let contato of this.contatos) {

            let contatoV = contato.v;
            impulsoNorma = contato.impulsoNorma;
            impulsoTangente = contato.impulsoTangente;

            if (impulsoNorma !== 0 || impulsoNorma !== 0) {
                impulso = this.norma.mult(impulsoNorma)
                    .adic(tangente.mult(impulsoTangente));

                if (!(corpo1.estatico)) {
                    let offset = contatoV.sub(corpo1.posV);
                    corpo1.posVprev = corpo1.posVprev.adic(impulso.mult(corpo1.massaInv));
                    corpo1.orientPrev += offset.pVet(impulso).mult(corpo1.inerciaInv);
                }

                if (!(corpo2.estatico)) {
                    let offset = contatoV.sub(corpo2.posV);
                    corpo2.posVprev = corpo2.posVprev.adic(impulso.mult(corpo2.massaInv));
                    corpo2.orientPrev += offset.pVet(impulso).mult(corpo2.inerciaInv);
                }
            }
        }
    }
    

    resolverVelocidade() {
            
        let corpo1 = this.corpo1;
        let corpo2 = this.corpo2;
        let norma = this.norma;
        let tangente = this.norma.perp;
        let contatos = this.contatos;
        let contatosCompartilhados = 1 / this.contatos.length;

        corpo1.velV = corpo1.posV.sub(corpo1.posVprev);
        corpo2.velV = corpo2.posV.sub(corpo2.posVprev);
        corpo1.velAng = corpo1.orient - corpo1.orientPrev;
        corpo2.velAng = corpo2.orient - corpo2.orientPrev;

        // resolve each contact
        for (let contato of contatos) {

            let contatoV = contato.v;
            let offset1 = contatoV.sub(corpo1.posV);
            let offset2 = contatoV.sub(corpo2.posV);
            let velocidade1 = corpo1.velV.adic(offset1.perp.mult(corpo1.velAng));
            let velocidade2 = corpo2.velV.adic(offset2.perp.mult(corpo2.velAng));
            let velRelativa = velocidade1.sub(velocidade2);
            let velNorma = norma.pEsc(velRelativa);

            let velTangente = tangente.pEsc(velRelativa);

            let velTangenteDirecao = velTangente < 0 ? -1 : 1;

            
            let impulsoNorma = (1 + this.restituicao) * velNorma;
            let forcaNorma = this.separacao + velNorma;
            forcaNorma = forcaNorma < 0 ? 0 : forcaNorma;
            forcaNorma = forcaNorma > 1 ? 1 : forcaNorma;
            forcaNorma *= 5;

            let impulsoTangente = velTangente;
            let friccaoMax = Number.POSITIVE_INFINITY;

            if (Math.abs(velTangente) > this.friccaoDinamica * this.friccaoEstatica * forcaNorma) {
                friccaoMax = Math.abs(velTangente);
                impulsoTangente = this.friccaoDinamica * velTangenteDirecao;
                impulsoTangente = impulsoTangente < -friccaoMax ? -friccaoMax : 0;
                impulsoTangente = impulsoTangente > friccaoMax ? friccaoMax : 0;
            }

            let oAcN = offset1.pVet(norma);
            let oBcN = offset2.pVet(norma);;
            let compartilhado = contatosCompartilhados / (corpo1.massaInv + corpo2.massaInv + corpo1.inerciaInv * oAcN * oAcN  + corpo2.inerciaInv * oBcN * oBcN);

            impulsoNorma *= compartilhado;
            impulsoTangente *= compartilhado;

            
            if (velNorma < 0 && velNorma * velNorma > 4) {
                contato.impulsoNorma = 0;
            } else {

                var contatoImpulsoNorma = contato.impulsoNorma;
                contato.impulsoNorma = Math.min(contato.impulsoNorma + impulsoNorma, 0);
                impulsoNorma = contato.impulsoNorma - contatoImpulsoNorma;
            }

            if (velTangente * velTangente > 6) {
                contato.impulsoTangente = 0;
            } else {
                var contatoImpulsoTangente = contato.impulsoTangente;
                contato.impulsoTangente = contato.impulsoTangente + impulsoTangente;
                contato.impulsoTangente = contato.impulsoTangente < -friccaoMax ? -friccaoMax : contato.impulsoTangente;
                contato.impulsoTangente = contato.impulsoTangente > friccaoMax ? friccaoMax : contato.impulsoTangente;
                impulsoTangente = contato.impulsoTangente - contatoImpulsoTangente
            }

            let impulso = norma.mult(impulsoNorma).adic(tangente.mult(impulsoTangente));
            
            if (!(corpo1.estatico)) {
                corpo1.posVprev = corpo1.posVprev.adic(impulso.mult(corpo1.massaInv));
                corpo1.orientPrev += offset1.pVet(impulso) * corpo1.inerciaInv;
            }

            if (!(corpo2.estatico)) {
                corpo2.posVprev = corpo2.posVprev.adic(impulso.mult(corpo2.massaInv));
                corpo2.orientPrev += offset2.pVet(impulso) *corpo2.inerciaInv;
            }
        }
    }
}
