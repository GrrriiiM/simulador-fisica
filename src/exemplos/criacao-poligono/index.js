


import { Canvas2d } from "../../objetos/canvas2d.js";
import { Vetor2d } from "../../objetos/vetor2d.js";
import { Forma2d } from "../../objetos/forma2d.js";
import { Poligono2d } from "../../objetos/poligono2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});
let vs = [];
let poligono = Forma2d.criarPoligono([], { corrigirDeslocamento: false, corL: "blue", corP: "white", alfaP: 0.2});

canvas.iniciarLoop();
canvas.loop = (c) => {
    c.linha(0, c.h/2, 
        c.w, c.h/2, 
        { c: "#FFFFFF", l: 0.5 });

    c.linha(c.w/2, 0, 
        c.w/2, c.h, 
        { c: "#FFFFFF", l: 0.5 });

    for(let v of vs) {
        c.linha(c.w/2, c.h/2, 
            v.x, v.y, 
            { c: "#FFFFFF", l: 1 });
    }
    
    poligono.desenhar(new Vetor2d(), c, c.ctx);
    poligono.desenharArea(new Vetor2d(), c, c.ctx);

    if (c.mousePressionado) {
        c.linha(c.w/2, c.h/2, 
            c.mouseX, c.mouseY, 
            { c: "#FFFFFF", l: 1 });
    }
}

canvas.mouseUp = (c) => {
    let v = Vetor2d.criarPos(c.mouseX, c.mouseY);
    vs.push(v.copia);
    poligono = Forma2d.criarPoligono(vs, poligono);
}