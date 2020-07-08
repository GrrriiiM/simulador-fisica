import { Canvas2d } from "../../objetos/canvas2d.js";
import { Vetor2d } from "../../objetos/vetor2d.js";
import { Poligono2d } from "../../objetos/poligono2d.js";
import { Corpo2d } from "../../objetos/corpo2d.js"
import { Mundo2d } from "../../objetos/mundo2d.js";
import { Circulo2d } from "../../objetos/circulo2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});

let mundo = Mundo2d.criar(0, 0, canvas.w, canvas.h, { paredes: true, gravidade: 0.4 });


// mundo.adic(Vetor2d.criarPos(100, canvas.h-30), Circulo2d.criar(30), Corpo2d.elastico());
let corpos = []

let tq = 50
let x = 10;

mundo.adic(Vetor2d.criarPos(canvas.w-200, 100), Poligono2d.criarQuadrado(tq), Corpo2d.elastico());

// for(let i=0; i<x; i++) {
//     for(let j=0; j<3; j++) {
//         mundo.adic(Vetor2d.criarPos(canvas.w-200 - (j*tq) - i*0 , canvas.h - (i*tq) - tq/2 ), Poligono2d.criarQuadrado(tq), Corpo2d.madeira());
//     }
// }



// mundo.adic(Vetor2d.criarPos(100,100), Poligono2d.criarQuadrado(tq), { restituicao: 1});

// let bola = mundo.adic(Vetor2d.criarPos(100,700), Circulo2d.criar(tq), Corpo2d.metal());
// bola.adicForca(Vetor2d.criarAng(-20, 300000));

canvas.iniciarLoop();
canvas.loop = (c) => {
    mundo.frame();
    mundo.desenhar(c);
    //c.pararLoop();
}

canvas.mouseUp= ()=> {
    mundo.adic(Vetor2d.criarPos(canvas.w-200, 100), Poligono2d.criarQuadrado(tq), Corpo2d.elastico());
}

