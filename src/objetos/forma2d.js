import { Matriz2d } from "./matriz2d.js";

export class Forma2d {
    
    constructor() {
        this.u = new Matriz2d();
    }

    set orient(a) {
        this._orient = a;
        this.u = Matriz2d.criarAng(a);
        if (Number.isNaN(this._orient)) {
            let b = "";
        }
    }

    get orient() { return this._orient; }

}