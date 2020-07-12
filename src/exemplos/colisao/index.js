import { Canvas2d } from "../../objetos/canvas2d.js";
import { Vetor2d } from "../../objetos/vetor2d.js";
import { Forma2d } from "../../objetos/forma2d.js";
import { Poligono2d } from "../../objetos/poligono2d.js";
import { Corpo2d } from "../../objetos/corpo2d.js"
import { Mundo2d } from "../../objetos/mundo2d.js";
import { Colisao2d } from "../../objetos/colisao2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});

let mundo = Mundo2d.criar(0, 0, canvas.w, canvas.h);

let quadrado = [[0,0],[200,0],[200,200],[0,200]];
let triangulo = [ [0,0],[200,0],[100,-150] ];
let l = [];
for(let i=0;i<36;i++) l.push(i);
let circulo = l.map(_ => Vetor2d.criarAng(_*10, 100));
let poligono = Poligono2d.criarRandom(50, 5, 100).vs;

// let corpo1 = mundo.adic(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criarRandom(50, 5, 100), Corpo2d.estatico())
// mundo.adic(Vetor2d.criarPos(canvas.w/2, canvas.h/2), Poligono2d.criarRandom(50, 5, 100), Corpo2d.borracha())

// mundo.adic(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[100,-150] ], Corpo2d.metal()));
// mundo.adic(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[200,200],[0,200]], Corpo2d.rocha()));
// mundo.adic(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[100,-150]], Corpo2d.elastico()));
// mundo.adic(Vetor2d.criarRandom(canvas.w, canvas.h), Poligono2d.criar([ [0,0],[200,0],[200,200],[0,200] ], Corpo2d.madeira()));

let forma = poligono;

let corpo1 = mundo.adic(Vetor2d.criarPos(500, 500), Poligono2d.criarQuadrado(50), Corpo2d.estatico({ orient: 0 }));

mundo.adic(Vetor2d.criarPos(700, 500), Poligono2d.criarQuadrado(50), Corpo2d.rocha({ orient: 45 }));
mundo.adic(Vetor2d.criarPos(400, 500), Poligono2d.criarRandom(50, 5, 100), Corpo2d.rocha());


// mundo.adic(Vetor2d.criarPos(-40, canvas.h/2), Poligono2d.criar([[0, 0], [100,0], [0, canvas.h], [100, canvas.h]]), Corpo2d.estatico());
// mundo.adic(Vetor2d.criarPos(canvas.w+40, canvas.h/2), Poligono2d.criar([[0, 0], [100,0], [0, canvas.h], [100, canvas.h]]), Corpo2d.estatico());
// mundo.adic(Vetor2d.criarPos(canvas.w/2, canvas.h+40), Poligono2d.criar([[0, 0], [0,100], [canvas.w-25, 0], [canvas.w-25, 100]]), Corpo2d.estatico());

canvas.iniciarLoop();
canvas.loop = (c) => {
    let op = { desenharArea: true, desenharNormas: true };

    if (c.mouseX && c.mouseY) corpo1.pos(c.mouseX, c.mouseY);

    mundo.frame();

    for(let colisao of mundo.colisoes) {
        op.corL = "blue";
        c.pontos(colisao.contatos);
    }

    mundo.desenhar(c, op);
}