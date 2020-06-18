export class SAT {
    static calcular(forma1, forma2) {

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

    // static calcMinMax(n, vs) {
    //     let pMin = Number.MAX_VALUE;
    //     let pMax = -Number.MAX_VALUE;

    //     for (let v of vs) {
    //         let p = v.pEsc(n);

    //         if (p < pMin) pMin = p;
    //         if (p > pMax) pMax = p;
    //     }
    //     return {
    //         min: pMin,
    //         max: pMax
    //     };
    // }

    // static calcular(forma1, forma2) {
    // 	for (let n of forma1.ns.concat(forma2.ns.map(_ => _.inv))) {

    //         let p1 = this.calcMinMax(n, forma1.vs.map(_ => _.adic(forma1.corpo.posV)));
    //         let p2 = this.calcMinMax(n, forma2.vs.map(_ => _.adic(forma2.corpo.posV)));

    //         if (!(((p1.min <= p2.max) && (p1.max >= p2.min)) ||
    //             (p2.min >= p1.max) && (p2.max >= p1.min))) {
    //                 return false;
    //             }

    //     }

    // 	return true;
    // }


}