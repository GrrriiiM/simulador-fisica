import { Forma2d } from "./forma2d.js";
import { Vetor2d } from "./vetor2d.js";


export class Circulo2d extends Forma2d {
    static criar(r, op) {
        let c = new Circulo2d();
        Object.assign(c, op);
        c.r = r;
        return c;
    }

    constructor() {
        super();
    }

    desenhar(posV, c, op) {
        const ctx = c.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(posV.x, posV.y, this.r, 0, 2 * Math.PI, true);
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.restore();
    }

    _calcularMassa() {
        this.corpo.massa = Math.PI * this.r * this.r * this.corpo.densidade;
        this.corpo.massaInv = (this.corpo.massa != 0) ? 1 / this.corpo.massa : 0;
        this.corpo.inercia = this.corpo.massa * this.r * this.r;
        this.corpo.inerciaInv = (this.corpo.inercia != 0) ? 1 / this.corpo.inercia : 0;
    }

}