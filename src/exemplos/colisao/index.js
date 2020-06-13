import { Canvas2d } from "../../objetos/canvas2d.js";
import { Vetor2d } from "../../objetos/vetor2d.js";
import { Forma2d } from "../../objetos/forma2d.js";
import { Poligono2d } from "../../objetos/poligono2d.js";
import { Corpo2d } from "../../objetos/corpo2d.js"
import { SAT } from "../../objetos/SAT.js";
import { Colisao2d } from "../../objetos/colisao2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});

// let corpo1 = Corpo2d.criar(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criarRandom(50, 5, 100))
// let corpo2 = Corpo2d.criar(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criarRandom(50, 5, 100))

let corpo1 = Corpo2d.criar(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[100,-150] ], Corpo2d.estatico()));
// let corpo1 = Corpo2d.criar(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[200,200],[0,200] ]));
// let corpo2 = Corpo2d.criar(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criar([ [0,0],[200,0],[100,-150] ]));
let corpo2 = Corpo2d.criar(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criar([ [0,0],[200,0],[200,200],[0,200] ], Corpo2d.borracha()));
canvas.iniciarLoop();
canvas.loop = (c) => {
    let op1 = { desenharArea: true, desenharNormas: true };
    let op2 = { desenharArea: true, desenharNormas: true };
    corpo1.pos(c.mouseX, c.mouseY);

    let colisao = Colisao2d.calcular(corpo1.forma, corpo2.forma);
    if (colisao.contatos.length) {
        op1.corL = "blue";
        op2.corL = "blue";
        c.pontos(colisao.contatos);
    }

    corpo1.desenhar(c, op1);
    corpo2.desenhar(c, op2);
}