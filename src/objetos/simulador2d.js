export class Simulador2d {
    constructor(mundo) {
        this.mundo = mundo;
    }

    frame(delta) {
        let corpos = this.mundo.corpos;
        let areas = this.mundo.areas;
        this.aplicarGravidade(corpos, this.mundo.gravidade);
        this.atualizarCorpos(corpos, delta, this.mundo.tempoEscala, 0);
        this.atualizarAreas(corpos, areas);

        this.reiniciarCorpos(corpos);
    }

    aplicarGravidade(corpos, gravidade) {
        for (let corpo of corpos) {
            if (corpo.estatico) continue;

            corpo.aceleracao = corpo.aceleracao.adic(gravidade.div(corpo.massaInv));
        }
    }

    atualizarAreas(corpos, areas) {
        for(let corpo of corpos) {
            for(let area of areas) {
                area.atualizar(corpo);
            }
        }
    }

    atualizarCorpos(corpos, delta, tempoEscala, correcao) {
        for(let corpo of corpos) {
            corpo.atualizar(delta, tempoEscala, correcao);
        }
    }

    reiniciarCorpos(corpos) {
        for(let corpo of corpos) {
            corpo.reiniciar();
        }
    }

    obterPathD() {
        return {
            mundo: this.mundo.obterPathD(),
            areas: this.mundo.areas.filter(_ => _.ativa()).map(_ => _.obterPathD()),
            corpos: this.mundo.corpos.map(_ => _.obterPathD())
        }
    }
}