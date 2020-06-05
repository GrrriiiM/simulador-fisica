import { Canvas2d } from "../../objetos/canvas2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});
canvas.iniciarAnimacao();
canvas.desenhar = (c) => {
    c.linha(0, c.h/2, 
        c.w, c.h/2, 
        { c: "#FFFFFF", l: 0.5 });

        c.linha(c.w/2, 0, 
            c.w/2, c.h, 
            { c: "#FFFFFF", l: 0.5 });
}