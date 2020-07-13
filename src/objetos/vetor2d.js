export class Vetor2d {
    static criarPos(x, y) {
        let v = new Vetor2d();
        v.x = x;
        v.y = y;
        return v;
    }

    static criar(x, y) {
        return this.criarPos(0,0);
    }

    static criarAng(angulo, magnitude) {
        return this.criarRad(angulo*(Math.PI/180), magnitude);
    }

    static criarRad(rad, magnitude) {
        let v = new Vetor2d();
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let x = c * magnitude;
        let y = s * magnitude;
        return this.criarPos(x, y);
    }

    static criarAngRandom(magMax, magMin) {
        let _magMin = magMin || 0; 
        let ang = Math.ceil(Math.random() * 360)
        let mag = Math.ceil(Math.random() * (magMax - _magMin)) + _magMin;
        return this.criarAng(ang, mag);
    }

    static criarRandom(maxX, maxY) {
        return this.criarPos(Math.ceil(Math.random()*maxX), Math.ceil(Math.random()*maxY));
    }

    static criarVec(v) {
        let v1 = new Vetor2d();
        v1.x = v.x;
        v1.y = v.y;
        return v1;
    }

    static criarArray(x) {
        let vs = [];
        if (x instanceof Array) {
            if (!Number.isNaN(x[0]) && !Number.isNaN(x[1])) {
                vs.push(new Vetor2d(0, 0));
                vs.push(new Vetor2d(0, x[1]));
                vs.push(new Vetor2d(x[0], 0));
                vs.push(new Vetor2d(x[0], x[1]));
            } else {
                for(let v of x) {
                    if (v instanceof Array) {
                        vs.push(new Vetor2d(v[0], v[1]));
                    }
                }
            }
        } else if(!Number.isNaN(x)) {
            return this.criarArray([x, x]);
        }
        return vs;
    }

    //sin = oposto / hipotenusa
    //cos = adjacente / hipotenusa
    //toa = oposto / adjacente
    //sohcahtoa

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
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
        if (m == 0) return this.criarPos(0, 0);
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
        if (n instanceof Vetor2d) {
            v.x *= n.x;
            v.y *= n.y;
        } else {
            v.x *= n;
            v.y *= n;
        }
        return v;
    }
    mult(n) { return Vetor2d.mult(this, n); }

    static div(v1, n) {
        let v = v1.copia;
        v.x /= n;
        v.y /= n;
        return v;
    }
    div(n) { return Vetor2d.div(this, n); }

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

    static pVet(v1, n) {
        if (n instanceof Vetor2d) {
            return v1.x * n.y - v1.y * n.x;
        } else {
            let v = v1.copia;
            v.x = v1.y * n;
            v.y = v1.x * -n;
            return v;    
        }
    }
    pVet(v) { return Vetor2d.pVet(this, v); }


    static area(v1, v2) {
        return Math.abs(this.pVet(v1, v2)) / 2;
    }
    area(v) { return Vetor2d.area(this, v); }

    static perp(v) {
        return this.criarPos(v.y, -v.x);
    }
    get perp() { return Vetor2d.perp(this); }

    static limit(v, n) {
        let mag = this.mag(v);
        if (mag > n) {
            return v.norm(n);
        }
        return v.copia;
    }
    limit(n) { return Vetor2d.limit(this, n); }

    static distQ(v1, v2) {
        let v = v1.sub(v2);
        v = v.mult(v);
        return v.x + v.y
    }
    distQ(v) { return Vetor2d.distQ(this, v); }

    static dist(v1, v2) {
        return Math.sqrt(this.dist(v1, v2));
    }
    dist(v) { return Vetor2d.dist(this, v); }

    static igual(v1, v2) {
        return Math.abs(v1.x - v2.x) <= 0.000001 && Math.abs(v1.y - v2.y) <= 0.000001;
    }
    igual(v) { return Vetor2d.igual(this, v); }
}