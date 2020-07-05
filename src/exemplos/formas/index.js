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

let mundo = Mundo2d.criar(0, 0, canvas.w, canvas.h, { paredes: true, gravidade: 0.2 });

mundo.adic(Vetor2d.criarPos(100, 100), Poligono2d.criarQuadrado(50), Corpo2d.borracha({ orient: 0 }));
mundo.adic(Vetor2d.criarPos(200, 100), Poligono2d.criarQuadrado(50), Corpo2d.borracha({orient: 30}));

mundo.adic(Vetor2d.criarPos(300, 100), Poligono2d.criarRetangulo(25, 50), Corpo2d.borracha());
mundo.adic(Vetor2d.criarPos(400, 100), Poligono2d.criarTrianguloReto(50, 50), Corpo2d.borracha());

mundo.adic(Vetor2d.criarPos(500, 100), Poligono2d.criarTrianguloEquilatero(50), Corpo2d.borracha());
mundo.adic(Vetor2d.criarPos(600, 100), Poligono2d.criarTrianguloEquilatero(50), Corpo2d.borracha({orient:120}));
mundo.adic(Vetor2d.criarPos(700, 100), Circulo2d.criar(25), Corpo2d.borracha({orient:45}));
mundo.adic(Vetor2d.criarPos(800, 100), Poligono2d.criarTrianguloReto(50, 50), Corpo2d.borracha({orient:30}));
let corpo1 = mundo.adic(Vetor2d.criarPos(900, 100), Circulo2d.criar(50), Corpo2d.borracha());
mundo.adic(Vetor2d.criarPos(250, canvas.h-250), Poligono2d.criarTrianguloReto(500,500, {corrigirDeslocamento: false}), Corpo2d.elastico());

canvas.iniciarLoop();
canvas.loop = (c) => {
    mundo.frame();
    c.log(`Mag: ${corpo1.velV.mag}`);
    c.log(`x: ${corpo1.velV.x}`);
    c.log(`y: ${corpo1.velV.y}`);
    mundo.desenhar(c);
}

