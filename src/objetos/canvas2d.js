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
        document.addEventListener("keydown", (ev) => c._keyDown(ev));
        document.addEventListener("keyup", (ev) => c._keyUp(ev));
        element.appendChild(canvas);
        return c;
    }

    constructor() {
        this.el = "body";
        this.h = 800;
        this.w = 800;
        this.bc = "#000000";
        this.fps = 60;
        this.animando = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePressionado = false;
        this._logs = [];
        this.tempoFrame = 0;
        this.tempoTotal = 0

        if (typeof window !== 'undefined') {
            this.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
    
            this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
        }
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

    _keyDown(ev) {
        this.shiftPressionado = ev.shiftKey;
    }

    _keyUp(ev) {
        this.shiftPressionado = ev.shiftKey;
    }

    mouseUp() {

    }


    frame(tempo) {
        let delta = 1000/(tempo ? tempo : 1000);
        this.ctx.fillStyle = this.bc;
        this.ctx.fillRect(0, 0, this.w, this.h);
        
        let fpsText = `fps: ${Math.round(delta)}`;
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#FFFFFF";
        let fpsMeasureText = this.ctx.measureText(fpsText).width;
        this.ctx.fillText(fpsText, this.w - fpsMeasureText, this.h - 10);
        this.desenharLog();
        if (this.loop) this.loop(this, delta);
        return delta;
    }

    iniciarLoop() {
        this.animando = true;
        this.render(0, this);
    }

    render(tempo, self) {
        if (this.animando) {
            this.tempoFrame = tempo - this.tempoTotal;
            this.tempoTotal = tempo;
            this.frame(this.tempoFrame);
            this.frameRequestId = window.requestAnimationFrame(this.render.bind(this));
        }
    }

    pararLoop() {
        this.animando = false;
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

    ponto(x, y, r, c) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, r || 5, 0, 2 * Math.PI, true);
        this.ctx.fillStyle = c || "white";
        this.ctx.fill();
        this.ctx.restore();
    }

    pontos(ps) {
        ps.forEach(_ => this.ponto(_.x, _.y, _.r, _.c))
    }
    
    log(t) {
        this._logs.push(t);
    }

    desenharLog() {
        for(let i=0;i<this._logs.length;i++) {
            this.ctx.font = "18px Arial";
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(this._logs[i], 10, 20 * (i + 1));
        }
        this._logs = [];
    }
}