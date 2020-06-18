import { Canvas2d } from "../../objetos/canvas2d.js";
import { Vetor2d } from "../../objetos/vetor2d.js";
import { Poligono2d } from "../../objetos/poligono2d.js";
import { Corpo2d } from "../../objetos/corpo2d.js"
import { Mundo2d } from "../../objetos/mundo2d.js";

let canvas = Canvas2d.criar({
    w: window.innerWidth,
    h: window.innerHeight
});

let mundo = Mundo2d.criar(0, 0, canvas.w, canvas.h);

let grav = Vetor2d.criarPos(0, 10);


let quadrado = [[0,0],[200,0],[200,200],[0,200]];
let triangulo = [ [0,0],[200,0],[100,-150] ];
let l = [];
for(let i=0;i<36;i++) l.push(i);
let circulo = l.map(_ => Vetor2d.criarAng(_*10, 100));
let poligono = Poligono2d.criarRandom(50, 5, 100).vs;

//let corpo1 = mundo.adic(Vetor2d.criarPos(canvas.w/2, 0), Poligono2d.criar(triangulo), Object.assign(Corpo2d.elastico(), { orient: 200 }));

for(let i=0;i<10;i++) {
    mundo.adic(Vetor2d.criarRandom(canvas.w, canvas.h-300), Poligono2d.criarRandom(50, 3, 50, 100), Corpo2d.elastico());
}

mundo.adic(Vetor2d.criarPos(-40, canvas.h/2), Poligono2d.criar([[0, 0], [100,0], [0, canvas.h], [100, canvas.h]]), Corpo2d.estatico());
mundo.adic(Vetor2d.criarPos(canvas.w+40, canvas.h/2), Poligono2d.criar([[0, 0], [100,0], [0, canvas.h], [100, canvas.h]]), Corpo2d.estatico());
mundo.adic(Vetor2d.criarPos(canvas.w/2, canvas.h+40), Poligono2d.criar([[0, 0], [0,100], [canvas.w-25, 0], [canvas.w-25, 100]]), Corpo2d.estatico());

mundo.adic(Vetor2d.criarPos(176, (canvas.h/2)+ 200), Poligono2d.criar([[0, 0], [500,500], [0, 500]]), Object.assign(Corpo2d.estatico(), { corrigirDeslocamento: false }));
mundo.adic(Vetor2d.criarPos(canvas.w - 176, (canvas.h/2)+ 200), Poligono2d.criar([[0, 0], [-500,500], [0, 500]]), Object.assign(Corpo2d.estatico(), { corrigirDeslocamento: false }));



canvas.iniciarLoop();
canvas.loop = (c) => {
    // if (c.mouseX && c.mouseY) corpo1.pos(c.mouseX, c.mouseY);

    mundo.corpos.filter(_ => _.massaInv > 0).forEach(_ => _.adicForca(grav.div(canvas.fps).div(_.massaInv)))
    mundo.frame();
    for(let colisao of mundo.colisoes) {
        c.pontos(colisao.contatos, { cor: "blue" });
    }
    mundo.desenhar(c);
}

canvas.mouseUp = (c) => {
    if (c.shiftPressionado) {
        mundo.adic(Vetor2d.criarPos(c.mouseX, c.mouseY), Poligono2d.criar(circulo), Corpo2d.elastico());
    } else {
        mundo.adic(Vetor2d.criarPos(c.mouseX, c.mouseY), Poligono2d.criarRandom(50, 3, 100, 200), Corpo2d.elastico());
    }
    
}