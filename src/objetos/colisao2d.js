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
        let dist = this.corpo2.posVimpulso.adic(this.corpo2.posV)
            .sub(this.corpo1.posVimpulso.adic(this.corpo1.posV))
            .sub(this.penetracao);

        let separacao = Vector.dot(this.norma.pEsc, dist);

        let impulso = (separacao - this.restituicao);

        if (this.corpo1.estatico || this.corpo2.estatico)
            impulso *= 2;
        
        let _positionDampen = 0.9;

        if (!(this.corpo1.estatico)) {
            let compartilhado = _positionDampen / this.corpo1.qtdContatos;
            this.corpo1.posVimpulso = this.corpo1.posVimpulso.adic(this.norma.mult(impulso * compartilhado));
        }

        if (!(this.corpo1)) {
            let compartilhado = _positionDampen / this.corpo2.qtdContatos;
            this.corpo2.posVimpulso = this.corpo2.posVimpulso.sub(this.norma.mult(impulso * compartilhado));
        }
    }

    prepararVelocidade() {
        let corpo1 = this.corpo1;
        let corpo2 = this.corpo2;
        let tangente = this.norma.perp;
        let impulsoNorma = 0;
        let tangentImpulse = 0;
        let impulso = Vetor2d.criar();
            
        for (let contato of this.contatos) {

            let contatoV = contato.v;
            impulsoNorma = contato.impulsoNorma;
            tangentImpulse = contato.tangentImpulse;

            if (impulsoNorma !== 0 || impulsoNorma !== 0) {
                // total impulse from contact
                impulso = this.norma.mult(impulsoNorma)
                    .adic(tangente.mult(tangentImpulse));

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

                    let contatoV = contato.V;
                    let offset1 = contatoV.sub(corpo1.posV);
                    let offset2 = contatoV.sub(corpo2.posV);
                    let velocidade1 = corpo1.velV.adic(offset1.perp.mult(corpo1.velAng));
                    let velocidade2 = corpo2.velV.adic(offset2.perp.mult(corpo2.velAng));
                    let velRelativa = velocidade1.sub(velocidade2);
                    let velNorma = norma.pEsc(velRelativa);

                    let velTangente = tangent.pEsc(velRelativa);

                    tangentVelocityDirection = Common.sign(tangentVelocity);

                // raw impulses
                let impulsoNorma = (1 + this.restituicao) * velNorma;
                let forcaNorma = 
                let normalForce = Common.clamp(pair.separation + normalVelocity, 0, 1) * Resolver._frictionNormalMultiplier;

                // coulomb friction
                var tangentImpulse = tangentVelocity,
                    maxFriction = Infinity;

                if (tangentSpeed > pair.friction * pair.frictionStatic * normalForce * timeScaleSquared) {
                    maxFriction = tangentSpeed;
                    tangentImpulse = Common.clamp(
                        pair.friction * tangentVelocityDirection * timeScaleSquared,
                        -maxFriction, maxFriction
                    );
                }

                // modify impulses accounting for mass, inertia and offset
                var oAcN = Vector.cross(offsetA, normal),
                    oBcN = Vector.cross(offsetB, normal),
                    share = contactShare / (bodyA.inverseMass + bodyB.inverseMass + bodyA.inverseInertia * oAcN * oAcN  + bodyB.inverseInertia * oBcN * oBcN);

                normalImpulse *= share;
                tangentImpulse *= share;

                // handle high velocity and resting collisions separately
                if (normalVelocity < 0 && normalVelocity * normalVelocity > Resolver._restingThresh * timeScaleSquared) {
                    // high normal velocity so clear cached contact normal impulse
                    contact.normalImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // impulse constraint tends to 0
                    var contactNormalImpulse = contact.normalImpulse;
                    contact.normalImpulse = Math.min(contact.normalImpulse + normalImpulse, 0);
                    normalImpulse = contact.normalImpulse - contactNormalImpulse;
                }

                // handle high velocity and resting collisions separately
                if (tangentVelocity * tangentVelocity > Resolver._restingThreshTangent * timeScaleSquared) {
                    // high tangent velocity so clear cached contact tangent impulse
                    contact.tangentImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // tangent impulse tends to -tangentSpeed or +tangentSpeed
                    var contactTangentImpulse = contact.tangentImpulse;
                    contact.tangentImpulse = Common.clamp(contact.tangentImpulse + tangentImpulse, -maxFriction, maxFriction);
                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                }

                // total impulse from contact
                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offsetA, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offsetB, impulse) * bodyB.inverseInertia;
                }
            }
        }
    }
}
