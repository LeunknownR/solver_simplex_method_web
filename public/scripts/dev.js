import getSolution, { DataCaseSimplex, RestrictionSimplex } from "./logic.js";

const testCases = [
    {
        typeCase: "MAX", 
        targetFunction: [3, 1, 2],
        restrictions: [
            new RestrictionSimplex([1, 1, 1], "LESS_OR_EQUALS", 4),
            new RestrictionSimplex([0, 1, 2], "LESS_OR_EQUALS", 6),
            new RestrictionSimplex([1, 3, 4], "LESS_OR_EQUALS", 5),
            new RestrictionSimplex([1, 0, 0], "LESS_OR_EQUALS", 2)
        ]
    },  
    {
        typeCase: "MAX",
        targetFunction: [3, 2, 1],
        restrictions: [
            new RestrictionSimplex([1, 2, 1], "LESS_OR_EQUALS", 10),
            new RestrictionSimplex([1, 1, 2], "LESS_OR_EQUALS", 9),
            new RestrictionSimplex([2, 0, 3], "LESS_OR_EQUALS", 12),
        ]
    }
];
export class DevelopmentL {
    constructor() {
        document.getElementById("btn-dev").addEventListener("click", () => {
            const tableSimplex = getSolution(this.#getCase(1), true);
            tableSimplex.applyAlgorithmDev(10);
        });
    }
    #getCase(idx) {
        return new DataCaseSimplex(
            testCases[idx].typeCase,
            testCases[idx].targetFunction,
            testCases[idx].restrictions
        );
    }
}