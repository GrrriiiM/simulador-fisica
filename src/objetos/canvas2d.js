export class Canvas2d {
    static criar(op) {
        let c = new Canvas2d();
        for(let p in op) {
            c[p] = op[p];
        }
        let element = document.querySelector(c.el);
        let canvas = document.createElement("canvas");
        c.ctx = canvas.getContext("2d");
        canvas.height = c.h;
        canvas.width = c.w;
        canvas.addEventListener("mousemove", (ev) => c._mouseMove(ev));
        canvas.addEventListener("mousedown", (ev) => c._mouseDown(ev));
        canvas.addEventListener("mouseup", (ev) => c._mouseUp(ev));
        element.appendChild(canvas);
        return c;
    }

    constructor() {
        this.el = "body";
        this.h = 800;
        this.w = 800;
        this.bc = "#000000";
        this.fps = 28;
        this.animando = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePressionado = false;
    }

    _mouseMove(ev) {
        this.mouseX = ev.pageX;
        this.mouseY = ev.pageY;
    }

    _mouseDown() {
        this.mousePressionado = true;
    }

    _mouseUp() {
        this.mousePressionado = false;
        this.mouseUp(this);
    }

    mouseUp() {

    }

    _loop(delta) {
        this.ctx.fillStyle = this.bc;
        this.ctx.fillRect(0, 0, this.w, this.h);
        
        let fpsText = `fps: ${Math.round(1000/delta)}`;
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#FFFFFF";
        let fpsMeasureText = this.ctx.measureText(fpsText).width;
        this.ctx.fillText(fpsText, this.w - fpsMeasureText, this.h - 10);
        
        if (this.loop) this.loop(this, delta);
    }

    async frame(delta) {
        let loop = new Promise((resolve) => {
            setTimeout(() => {
                this._loop(delta);
                resolve();
            }, 1);
        });
        let frame = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000/this.fps);
        });

        let inicio = Date.now();
        await Promise.all([loop, frame]);
        let fim = Date.now();

        let t = fim-inicio;
        return t;
    }

    iniciarLoop(delta) {
        delta = delta || 1000/this.fps;
        this.animando = true;
        setTimeout(async () => {
            delta = await this.frame(delta);
            this.iniciarLoop(delta);
        }, 1);
    }

    linha(x1, y1, x2, y2, op) {
        let o = {
            c: "#FFFFFF",
            l: 1
        }
        Object.keys(op).forEach(_ => o[_]=op[_]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = o.c;
        this.ctx.lineWidth = o.l;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    linhas(x, y, vs, op) {
        let o = {
            c: "#FFFFFF",
            l: 1
        }
        ctx.save();
        Object.assign(o, op);
        ctx.beginPath();
        ctx.strokeStyle = o.c;
        ctx.lineWidth = o.l;
        ctx.moveTo(x, y);
        for(let v of vs) {
            ctx.lineTo(v.x, v.y);
        }
        ctx.stroke();
        ctx.restore();
    }

    log(t) {
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillText(t, 10, 20);
    }
}