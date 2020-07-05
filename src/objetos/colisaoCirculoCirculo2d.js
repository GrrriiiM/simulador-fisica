import { Vetor2d } from "./vetor2d.js";

export class ColisaoCirculoCirculo2d {
    static calcular(colisao) {
        let forma1 = colisao.corpo1.forma;
		let forma2 = colisao.corpo2.forma;


		let n = forma2.corpo.posV.sub(forma1.corpo.posV);


		let distQ = n.magQ;
		let r = forma1.r + forma2.r;

		// Not in contact
		if (distQ >= r * r) return;

        let dist = Math.sqrt(distQ);
            
		if (dist == 0) {
			colisao.penetracao = forma1.r;
			colisao.norma = Vetor2d.criar(1, 0);
			colisao.contatos.push(forma1.corpo.posV);
		} else {
            colisao.penetracao = r - dist;
            colisao.norma = n.div(dist);
            colisao.contatos.push(colisao.norma.mult(forma1.r).adic(forma1.corpo.posV));
		}
    }
}