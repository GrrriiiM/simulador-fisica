export class Vetor2d {
    static criarPos(x, y) {
        let v = new Vetor2d();
        v.x = x;
        v.y = y;
        return v;
    }

    static criarAng(angulo, magnitude) {
        let v = new Vetor2d();
        let s = Math.sin(angulo);
        let c = Math.cos(angulo);
        let x = c * magnitude;
        let y = s * magnitude;
        return this.criarPos(x, y);
    }

    static criarVec(v) {
        let v1 = new Vetor2d();
        v1.x = v.x;
        v1.y = v.y;
        return v1;
    }

    //sin = oposto / hipotenusa
    //cos = adjacente / hipotenusa
    //toa = oposto / adjacente
    //sohcahtoa

    constructor() {
        this.x = 0;
        this.y = 0;
    }

    static magQ(v) { return Math.pow(v.x, 2) + Math.pow(v.y, 2); }
    get magQ() { return Vetor2d.magQ(this); }

    static mag(v) { return Math.sqrt(this.magQ(v)); }
    get mag() { return Vetor2d.mag(this); }

    static copia(v) { return this.criarVec(v); }
    get copia() { return Vetor2d.copia(this); }

    static norm(v, n) {
        n = n || 1;
        let m = v.mag;
        return this.criarPos(v.x/m, v.y/m).mult(n);
    }
    norm(n) { return Vetor2d.norm(this, n); }

    static adic(v1, v2) {
        let v = v1.copia;
        v.x += v2.x;
        v.y += v2.y;
        return v;
    }
    adic(v) { return Vetor2d.adic(this, v); }


    static mult(v1, n) {
        let v = v1.copia;
        v.x *= n;
        v.y *= n;
        return v;
    }
    mult(n) { return Vetor2d.mult(this, n); }

    static sub(v1, v2) {
        let v = v1.copia;
        v.x -= v2.x;
        v.y -= v2.y;
        return v;
    }
    sub(v) { return Vetor2d.sub(this, v); }

    static pEsc(v1, v2) {
        return v1.x*v2.x + v1.y*v2.y;
    }
    pEsc(v) { return Vetor2d.pEsc(this, v); }

    static cos(v1, v2) {
        return this.pEsc(v1, v2) / (v1.mag * v2.mag);
    }
    cos(v) { return Vetor2d.cos(this, v); }

    static angR(v1, v2) {
        let a = Math.acos(this.cos(v1, v2));
        a = v1.pVet(v2) < 0 ? (Math.PI*2) - a  : a;
        
        return  a;
    }
    angR(v) { return Vetor2d.angR(this, v); }

    static angG(v1, v2) {
        return this.angR(v1, v2) * (180/Math.PI);
    }
    angG(v) { return Vetor2d.angG(this, v); }

    static inv(v) {
        let v1 = v.copia;
        v1.x *= -1;
        v1.y *= -1;
        return v1;
    }
    get inv() { return Vetor2d.inv(this); }

    static rotR(v, r) {
        let c = Math.cos(r);
        let s = Math.sin(r);
        let v1 = v.copia;
        v1.x = v.x*c - v.y*s;
        v1.y = v.x*s + v.y*c;
        return v1
    }
    rotR(r) {
        return Vetor2d.rotR(this, r);
    }

    static rotG(v, g) {
        let r = g / (180/Math.PI);
        return this.rotR(v, r);
    }
    rotG(g) { return Vetor2d.rotG(this, g); }

    static pVet(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }
    pVet(v) { return Vetor2d.pVet(this, v); }

    static pVet2(v1, n) {
        return this.criarVec(v1.y * n, - v1.x * -n);
    }
    pVet2(n) { return Vetor2d.pVet2(this, n); }
}