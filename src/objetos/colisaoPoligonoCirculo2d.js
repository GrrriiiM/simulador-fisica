export class ColisaoPoligonoCirculo2d {
    static calcular(colisao) {
        let poligono = colisao.corpo1.forma;
        let circulo = colisao.corpo2.forma;

        let centro = circulo.corpo.posV
            .sub(poligono.corpo.posV)
            .mult(poligono.u.transp);
        
        let separacao = Number.NEGATIVE_INFINITY;
        let indiceNorma = 0;
        for(let i = 0; i < poligono.vsQtd; ++i) {
            let s = poligono.ns[i].pEsc(centro.sub(poligono.vs[i]));

            if(s > circulo.r)
                return;

            if(s > separacao) {
                separacao = s;
                indiceNorma = i;
            }
        }

        let v1 = poligono.vs[indiceNorma];
        let v2 = poligono.vs[(indiceNorma+1)%poligono.vsQtd];

        if(separacao < 0)
        {
            colisao.norma = poligono.ns[indiceNorma].mult(poligono.u).inv;
            colisao.contatos.push(colisao.norma.mult(circulo.r).adic(circulo.corpo.posV));
            colisao.penetracao = circulo.r;
            return;
        }

        let dot1 = centro.sub(v1).pEsc(v2.sub(v1));
        let dot2 = centro.sub(v2).pEsc(v1.sub(v2));
        colisao.penetracao = circulo.r - separacao;

        if(dot1 <= 0) {
            if(centro.distQ(v1) > circulo.r * circulo.r)
            return;

            colisao.norma = v1.sub(centro)
                .mult(poligono.u)
                .norm();

            colisao.contatos.push(v1.mult(poligono.u).adic(poligono.corpo.posV))
        } else if(dot2 <= 0) {
            if(centro.distQ(v2) > circulo.r * circulo.r)
            return;

            colisao.norma = v2.sub(centro)
                .mult(poligono.u)
                .norm();
                
            colisao.contatos.push(v2.mult(poligono.u).adic(poligono.corpo.posV));
        } else {
            let n = poligono.ns[indiceNorma];
            if(centro.sub(v1).pEsc(n) > circulo.r)
                return;

            colisao.norma = n.mult(poligono.u).inv;
            colisao.contatos.push(colisao.norma.mult(circulo.r).adic(circulo.corpo.posV))
        }
    }
}