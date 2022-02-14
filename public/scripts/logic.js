
export class RestrictionSimplex {
    constructor(coeff = [], sign, limit) {
        this.coeff = coeff;
        this.sign = sign;
        this.limit = limit;
    }
}

export class DataCaseSimplex {
    constructor(typeCase = "", targetFunction = [], restrictions = [new RestrictionSimplex()]) {
        this.typeCase = typeCase;
        this.targetFunction = targetFunction;
        this.restrictions = restrictions;
    }
    getQuantityVariables() {
        return this.targetFunction.length;
    }
}
class TableSimplex {
    constructor(data = new DataCaseSimplex()) {
        this.Ci = [];
        this.Cj = [];
        this.restrictions = [[]];
        this.prevRestrictions = [[]];
        this.data = data;
    }
    applyAlgorithmDev(quantity) {
        for (let i = 0; i < quantity; i++) {
            this.#copyRestrictionToPrevRestrictions();
            console.log("Resultado: " + this.#getZj()[0]);
            this.#iterate();
        }
    }
    applyAlgorithm() {
        let prevValueTargetFunction = 0;
        let countIterations = 0;
        do {
            this.#copyRestrictionToPrevRestrictions();
            prevValueTargetFunction =  this.#getZj()[0];
            this.#iterate();
            countIterations++;
            // Evaluando si el valor de la función objetivo aún cambia 
        } while (prevValueTargetFunction !== this.#getZj()[0]);
        return this.#getResult(prevValueTargetFunction, countIterations);
    }
    #getResult(prevValueTargetFunction, countIterations) {
        let result = {
            resultTargetFunction: prevValueTargetFunction,
            variables: this.#getVariablesToResult(),
            countIterations
        };
        return result;
    }
    #getVariablesToResult() {
        const foundVariables = this.Ci.map((cell, idx) => {
            return {
                key: cell.variable, 
                value: this.restrictions[idx].bi
            };
        });
        this.Cj.forEach(cell => {
            if (foundVariables.some(item => item.key === cell.variable))
                return;
            foundVariables.push({
                key: cell.variable,
                value: 0
            });
        });
        foundVariables.sort((item1, item2) => {
            return item1.key > item2.key ? 1 : -1;
        })
        return foundVariables;
    }
    #getZj() {
        const quantityIterations = this.Cj.length + 1;
        let Zj = [];
        for (let i = 0; i < quantityIterations; i++) {
            Zj = [...Zj, this.Ci.reduce(
                (acc, curr, idx) => {
                    return acc + (
                        curr.coeff * (
                            i > 0 
                            ? this.restrictions[idx].factors[i - 1].coeff
                            : this.restrictions[idx].bi)
                        )
                }, 0)];
        }
        return Zj;
    }
    #getZjMinusCj() {
        let ZjMinusCj = [];
        const Zj = this.#getZj();
        Zj.forEach((itemZj, idx) => {
            if (idx === 0)
                return;
            ZjMinusCj = [...ZjMinusCj, {
                variable: this.Cj[idx - 1].variable, 
                coeff: itemZj - this.Cj[idx - 1].coeff
            }];
        });
        return ZjMinusCj;
    }
    #iterate() {
        const ZjMinusCj = this.#getZjMinusCj();
        const factorPivot = this.#getFactorPivot(
            ZjMinusCj.filter(
                (_, idx) => idx < this.data.getQuantityVariables()
        ));
        this.#changeCells(factorPivot);
    }
    #changeCells(factorPivot) {
        this.#copyRestrictionToPrevRestrictions();
        this.Ci.forEach((ciCell, idx) => {
            if (ciCell.variable === factorPivot.variableCi) {
                this.Ci[idx] = {
                    variable: factorPivot.variableColumn,
                    coeff: this.Cj[factorPivot.cjIdx].coeff
                };
            }
        });
        
        // Cambiando valores
        // Cambiando filas n1 / n2
        let prevRestriction = this.prevRestrictions[factorPivot.idxRowPivot];
        this.restrictions[factorPivot.idxRowPivot].bi = prevRestriction.bi / factorPivot.coeff;
        for (let i = 0; i < this.prevRestrictions[0].factors.length; i++) {
            this.restrictions[factorPivot.idxRowPivot].factors[i].coeff = prevRestriction.factors[i].coeff / factorPivot.coeff;
        }
        // Cambiando filas n1 - (n2 * n3)
        this.restrictions.forEach((_, idx) => {
            if (idx === factorPivot.idxRowPivot) return;
            let prevRestriction = this.prevRestrictions[idx];
            this.restrictions[idx].bi = prevRestriction.bi - (prevRestriction.factors[factorPivot.cjIdx].coeff * this.restrictions[factorPivot.idxRowPivot].bi);;
            for (let i = 0; i < this.prevRestrictions[0].factors.length; i++) {
                this.restrictions[idx].factors[i].coeff = prevRestriction.factors[i].coeff - (prevRestriction.factors[factorPivot.cjIdx].coeff * this.restrictions[factorPivot.idxRowPivot].factors[i].coeff);
            }
        });
    }
    #copyRestrictionToPrevRestrictions() {
        this.prevRestrictions = this.restrictions.map(restriction => (
            {
                ...restriction, 
                factors: ({...restriction}).factors
                    .map(factor => ({...factor}))
            }
        ));
    }
    #getColumnPivot(variablePivot) {
        let idxColumnPivot = 0;
        return {
            column: this.restrictions.map(
                restriction => {
                    return restriction.factors.find((factor, idx) => {
                        idxColumnPivot = idx;
                        return factor.variable === variablePivot;
                    })
                }),
            idx: idxColumnPivot
        };
    }
    #getVariablePivot(factorsZjMinusCj) {
        return ({
            "MAX": factorsZjMinusCj[0].variable,
            "MIN": factorsZjMinusCj[factorsZjMinusCj.length - 1].variable
        })[this.data.typeCase];
    }
    #getFactorPivot(factorsZjMinusCj = []) {
        const compareLeast = (a, b) => a.coeff - b.coeff;
        factorsZjMinusCj.sort(compareLeast);
        const variablePivot = this.#getVariablePivot(factorsZjMinusCj);
        const columnPivot = this.#getColumnPivot(variablePivot);
        const semiPivots = columnPivot.column.map((cell, idx) => {
            return cell.coeff <= 0 ? null : {
                coeff: this.restrictions[idx].bi / cell.coeff,
                variable: this.Ci[idx].variable,
                idx: idx,
                cjCoeff: this.Cj[idx].coeff
            };
        })
        .filter(cell => cell !== null);
        const intersectionCiFactorWithColumnPivot = [...semiPivots].sort(compareLeast)[0];
        return {
            coeff: columnPivot.column[intersectionCiFactorWithColumnPivot.idx].coeff,
            variableColumn: columnPivot.column[intersectionCiFactorWithColumnPivot.idx].variable,
            idxRowPivot: intersectionCiFactorWithColumnPivot.idx, 
            variableCi: intersectionCiFactorWithColumnPivot.variable,
            cjIdx: columnPivot.idx
        };
    }
}

const basicVariables = {
    "EQUALS": [1], // +AX || -AX
    "LESS_OR_EQUALS": [1], // SX
    "GREATER_OR_EQUALS": [-1, 1] // -SX - AX || -SX + AX
};
const getCoeffFactorsStandardRestrictions = (restrictions = [new RestrictionSimplex()]) => {
    const length = restrictions.length;
    let prevIdx = length;
    return restrictions.map(restriction => {
        let newCoeff = [];
        for (let i = length; i < prevIdx; i++) {
            newCoeff = [...newCoeff, 0];
        }
        newCoeff = [
            ...restriction.coeff, 
            ...newCoeff, 
            ...basicVariables[restriction.sign]
        ];
        prevIdx++;
        return newCoeff;
    });
}
const getMaxLengthVariablesBy = (coeffFactorsStandardRestrictions) => {
    let lengths = coeffFactorsStandardRestrictions.reduce((acc, curr) => [...acc, curr.length], []);
    return Math.max(...lengths);
}
const fillZerosStandardRestrictions = (coeffFactorsStandardRestrictions = [[]], maxLengthVariables) => {
    return coeffFactorsStandardRestrictions.map(restriction => {
        // rellenando con ceros
        const restZeros = [];
        for (let i = restriction.length; i < maxLengthVariables; i++) {
            restZeros.push(0);
        }
        return [...restriction, ...restZeros];
    });
}
const fillZerosTargetFunction = (targetFunction = [], maxLengthVariables) => {
    const newTargetFunction = [...targetFunction];
    for (let i = targetFunction.length; i < maxLengthVariables; i++) {
        newTargetFunction.push(0);
    }
    return newTargetFunction;
}
const bindTable = (
    data = new DataCaseSimplex(), 
    targetFunctionWithExtraVariables = [], 
    coeffFactorsStandardRestrictions = [[]]) => {
    const restrictions = data.restrictions.map((restriction, idx) => {
        return {
            factors: coeffFactorsStandardRestrictions[idx].map((coeff, idx) => ({
                variable: `X${idx + 1}`, 
                coeff
            })), 
            bi: restriction.limit
        }
    });
    const table = new TableSimplex(data);
    table.Cj = targetFunctionWithExtraVariables.map((coeff, idx) => ({
        variable: `X${idx + 1}`,
        coeff
    }));
    table.restrictions = restrictions;
    table.Ci = table.Cj.filter((_, idx) => idx > data.targetFunction.length - 1);
    return table;
}
const processSolution = (data, targetFunctionWithExtraVariables, coeffFactorsStandardRestrictions) => {
    const table = bindTable(data, targetFunctionWithExtraVariables, coeffFactorsStandardRestrictions);
    return table.applyAlgorithm();
}
const getTableForDev = (data, targetFunctionWithExtraVariables, coeffFactorsStandardRestrictions) => {
    const table = bindTable(data, targetFunctionWithExtraVariables, coeffFactorsStandardRestrictions);
    return table;
}
const getSolution = (data = new DataCaseSimplex(), isDev = false) => {
    let coeffFactorsStandardRestrictions = getCoeffFactorsStandardRestrictions(data.restrictions);
    const maxLengthVariables = getMaxLengthVariablesBy(coeffFactorsStandardRestrictions);
    coeffFactorsStandardRestrictions = fillZerosStandardRestrictions(coeffFactorsStandardRestrictions, maxLengthVariables);
    const targetFunctionWithExtraVariables = fillZerosTargetFunction(data.targetFunction, maxLengthVariables);
    if (!isDev)
        return processSolution(data, targetFunctionWithExtraVariables, coeffFactorsStandardRestrictions);
    return getTableForDev(data, targetFunctionWithExtraVariables, coeffFactorsStandardRestrictions);
}

export default getSolution;