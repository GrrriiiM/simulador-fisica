export class Canvas2d {
    static criar(h, w, el) {
        let c = new Canvas2d();
        c.h = h || 800;
        c.w = w || 800;
        c.el = "body";
        let element = document.querySelector(c.el);
        let canvas = document.createElement("canvas");
        c.ctx = canvas.getContext("2d");
        canvas.height = c.h;
        canvas.width = c.w;
        element.appendChild(canvas);
    }
}