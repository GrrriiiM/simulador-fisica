import { Canvas2d } from "../../objetos/canvas2d.js";
import { Vetor2d } from "../../objetos/vetor2d.js";
import { Forma2d } from "../../objetos/forma2d.js";
import { Poligono2d } from "../../objetos/poligono2d.js";
import { Corpo2d } from "../../objetos/corpo2d.js"
import { SAT } from "../../objetos/SAT.js";
import { Colisao } from "../../objetos/colisao.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});

let corpo1 = Corpo2d.criar(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criarRandom(50, 5, 100))
let corpo2 = Corpo2d.criar(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criarRandom(50, 5, 100))

// let corpo1 = Corpo2d.criar(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[100,-150] ]));
// let corpo1 = Corpo2d.criar(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[200,200],[0,200] ]));
// let corpo2 = Corpo2d.criar(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criar([ [0,0],[200,0],[100,-150] ]));
// let corpo2 = Corpo2d.criar(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criar([ [0,0],[200,0],[200,200],[0,200] ]));
canvas.iniciarLoop();
canvas.loop = (c) => {
    let op1 = { desenharArea: true, desenharNormas: true };
    let op2 = { desenharArea: true, desenharNormas: true };
    corpo1.pos(c.mouseX, c.mouseY);
    let sat1 = SAT.calcular(corpo1.forma, corpo2.forma);
    let sat2 = SAT.calcular(corpo2.forma, corpo1.forma);
    
    if (sat1.dist<=0 && sat2.dist<=0) {
        op1.corL = "blue";
        op2.corL = "blue";
        let colisao = Colisao.calcular(corpo1.forma, corpo2.forma);
    }

    op1.corVs=[{ i: sat1.indexV, cor: "blue" }];
    op2.corVs=[{ i: sat2.indexV, cor: "blue" }];

    c.log(`sat1: ${sat1.dist}
    sat2: ${sat2.dist}`);

    corpo1.desenhar(c, op1);
    corpo2.desenhar(c, op2);
}