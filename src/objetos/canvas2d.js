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
            if (window.requestAnimationFrame) this.requisitarFrame = (render) => window.requestAnimationFrame(render)
            // this.requisitarFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
            //     || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
    
            // this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
            //     || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
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
        this.delta = 1000/(this.tempoFrame ? this.tempoFrame : 1000);
        
        if (this.loop) this.loop(this, this.delta);
        return this.delta;
    }

    iniciarLoop() {
        this.animando = true;
        this.render(0, this);
    }

    render(tempo, self) {
        if (this.animando) {
            this.tempoFrame = tempo - this.tempoTotal;
            this.tempoTotal = tempo;
            this.frame();
            this.frameRequestId = this.requisitarFrame(this.render.bind(this));
        }
    }

    pararLoop() {
        this.animando = false;
    }


    desenharLog() {
        for(let i=0;i<this._logs.length;i++) {
            this.ctx.font = "18px Arial";
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(this._logs[i], 10, 20 * (i + 1));
        }
        this._logs = [];
    }

    desenhar(simuladorPathD) {
        this._desenharMundo(simuladorPathD.mundo);
        simuladorPathD.areas.forEach(_ => this._desenharArea(_));
        simuladorPathD.corpos.forEach(_ => {
            this._desenharCorpoVertices(_.vertices);
            this._desenharCorpoPosicao(_.posicao);
        });
        this._desenharFPS(this.delta);
    }

    _desenharMundo(pathD) {
        this.ctx.fillStyle = "black";
        this.ctx.fill(new Path2D(pathD));
    }

    _desenharArea(pathD) {
        this.ctx.strokeStyle = "red";
        this.ctx.globalAlpha = 0.4;
        this.ctx.stroke(new Path2D(pathD));
        this.ctx.globalAlpha = 1;
    }

    _desenharCorpoVertices(pathD) {
        this.ctx.strokeStyle = "white";
        this.ctx.stroke(new Path2D(pathD));
    }

    _desenharCorpoPosicao(pathD) {
        this.ctx.fillStyle = "blue";
        this.ctx.fill(new Path2D(pathD));
    }

    _desenharFPS(delta) {
        let fpsText = `fps: ${Math.round(delta)}`;
        this.ctx.font = "18px Arial";
        this.ctx.fillStyle = "#FFFFFF";
        let fpsMeasureText = this.ctx.measureText(fpsText).width;
        this.ctx.fillText(fpsText, this.w - fpsMeasureText, this.h - 10);
    }
}