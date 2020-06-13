export class Matriz2d {

	static criarAng(a) {
        let r = a / (Math.PI/180);
		return this.criarRad(r);
    }

    static criarRad(r) {
		const c = Math.cos(r);
        const s = Math.sin(r);
        return this.criarPos(c, -s, s, c)
    }
    
    static criarPos(m00, m01, m10, m11) {
        let m2 = new Matriz2d();

		m2.m00 = m00;
		m2.m01 = m01;
		m2.m10 = m10;
        m2.m11 = m11;
        
        return m2;
    }

    constructor() {
        this.m00 = 0;
        this.m01 = 0;
        this.m10 = 0;
        this.m11 = 0;
    }

    get copia() {
        return Matriz2d.criarPos(this.m00, this.m01, this.m10, this.m11);
    }

    static abs(m) {
        let m1 = m.copia;
        m1.m00 = Math.abs(m.m00);
        m1.m01 = Math.abs(m.m01);
        m1.m10 = Math.abs(m.m10);
        m1.m01 = Math.abs(m.m01);
        return m;
    }
    abs() { return Matriz2d.abs(this); }

    get eixoX() {
        return new Vetor2(this.m00, this.m10);
    }

    get eixoY() {
        return new Vetor2(this.m01, this.m11);
    }

    static transp(m) {
        let m1 = m.copia;
        m1.m01 = m.m10;
        m1.m10 = m.m01;
        return m1;
    }
    get transp() { return Matriz2d.transp(this); }

    static mult(m1, m2) {
        let m = m1.copia;
        m.m00 = m1.m00 * m2.m00 + m1.m01 * m2.m10,
        m.m01 = m1.m00 * m2.m01 + m1.m01 * m2.m11,
        m.m10 = m1.m10 * m2.m00 + m1.m11 * m2.m10,
        m.m11 = m1.m10 * m2.m01 + m1.m11 * m2.m11;
    }
    mult(m) { return Matriz2d.mult(this, m); }
}