export class Corpo2d {
    static criar(posV, forma, op) {
        let corpo = new Corpo2d();
        Object.assign(corpo, op);
        corpo.posV = posV;
        corpo.forma = forma;
        forma.corpo = corpo;
        corpo.orient = 0;
        return corpo;
    }

    pos(x, y) {
        this.posV.x = x;
        this.posV.y = y;
    }
    
    desenhar(c, op) {
        this.forma.desenhar(this.posV, c, op);
        if (op.desenharArea) this.forma.desenharArea(this.posV, c, op);
        if (op.desenharNormas) this.forma.desenharNormas(this.posV, c, op);
    }

    set orient(a) { this.forma.orient = a; }
    get orient() { return this.forma.orient; }
}