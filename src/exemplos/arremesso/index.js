import { Canvas2d } from "../../objetos/canvas2d.js";
import { Mundo2d } from "../../objetos/mundo2d.js";
import { Simulador2d } from "../../objetos/simulador2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});

let mundo = new Mundo2d({ largura: canvas.w, altura: canvas.h, paredes: false });
let simulador = new Simulador2d(mundo);


canvas.iniciarLoop();
canvas.loop = (c) => {
    simulador.frame(c.delta);
    c.desenhar(simulador.obterPathD());
    //c.pararLoop();
}

canvas.mouseUp= (c)=> {
    mundo.adicionarCorpo([ c.mouseX, c.mouseY ], 100);
}

