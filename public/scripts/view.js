import getSolution, { 
    RestrictionSimplex, 
    DataCaseSimplex 
} from "./logic.js";

const templates = {
    getFactorTargetFunction: (idx) => /*html*/`
        <span class="sign">+</span>
        <div class="factor">
            <input class="custom-input-text coeff" value="1"/>
            <span class="variable">X${idx}</span>
        </div>
    `,
    getFactorRestriction: (idx, start = false) => /*html*/`
        ${start 
            ? "" 
            : /*html*/ 
                `<span class="sign">+</span>`
        }
        <div class="factor">
            <input class="custom-input-text coeff" value="0"/>
            <span class="variable">X${idx}</span>
        </div>
    `,
    getRestriction: (idx, $factors) => /*html*/`
        <div class="field">
            <label class="start">
                R${idx}: 
            </label>
            <div class="content">
                ${$factors}
            </div>
            <select class="custom-select small sign">
                <option value="LESS_OR_EQUALS"><=</option>
                <option value="GREATER_OR_EQUALS">>=</option>
                <option value="EQUALS">=</option>
            </select>
            <input class="custom-input-text limit" value="100"/>
        </div>
    `
};

export class HandlerTargetQuantityFunction {
    #idxVariable;
    constructor() {
        this.#idxVariable = 3;
    }
    init() {
        this.#initEventAddVariable();
        this.#initEventDeleteVariable();
    }
    #initEventAddVariable() {
        const $contentTargetFunction = document.querySelector('#target-function > .content');
        const $buttonAdd = document.querySelector("#btn-add-variable");
        $buttonAdd.addEventListener('click', () => {
            const factorTargetFunction = templates.getFactorTargetFunction(this.#idxVariable);
            $contentTargetFunction.insertAdjacentHTML("beforeend", factorTargetFunction);
            this.#idxVariable++;
        });
    }
    #initEventDeleteVariable() {
        const $contentTargetFunction = document.querySelector('#target-function > .content');
        const $buttonDelete = document.querySelector("#btn-delete-variable");
        $buttonDelete.addEventListener('click', () => {
            if ($contentTargetFunction.childElementCount < 5) return;
            $contentTargetFunction.lastElementChild.remove();
            $contentTargetFunction.lastElementChild.remove();
            this.#idxVariable--;
        });
    }
}

export class HandlerTargetFunction {
    constructor() {
    }
    init() {
    }
    getData() {
        const $coeffInput = document.querySelectorAll("#target-function .content .factor .coeff");
        return [...$coeffInput].map($element => Number($element.value));
    }
}

export class HandleRestrictions {
    #idx;
    #handlerTargetFunction;
    constructor(handlerTargetFunction = new HandlerTargetFunction()) {
        this.#idx = 2;
        this.#handlerTargetFunction = handlerTargetFunction;        
    }
    init() {
        this.#initBtnGenerateRestrictions();
        this.#initBtnAddRestriction();
        this.#initBtnDeleteRestriction();
    }
    #initBtnAddRestriction() {
        const $btnAddRestriction = document.querySelector("#btn-add-restriction");
        $btnAddRestriction.addEventListener("click", () => {
            const { length } = this.#handlerTargetFunction.getData();
            this.#addRestriccion(length);
        });
    }
    #initBtnDeleteRestriction() {
        const $btnDeleteRestriction = document.querySelector("#btn-delete-restriction");
        $btnDeleteRestriction.addEventListener("click", () => {
            this.#deleteRestriction();
        });
    }
    #initBtnGenerateRestrictions() {
        const $btnGenerateRestrictions = document.querySelector("#btn-generate-restrictions");
        $btnGenerateRestrictions.addEventListener("click", () => {
            this.#generateRestrictions();
        });
        this.#generateRestrictions();
    }
    #generateRestrictions() {
        this.#idx = 1;
        const { length } = this.#handlerTargetFunction.getData();
        this.#addRestriccion(length, true);
    }
    #addRestriccion(quantityFactors, reset = false) {
        const $restrictions = document.querySelector("#container-restrictions .content");
        let factors = "";
        for (let i = 1; i <= quantityFactors; i++) {
            factors += templates.getFactorRestriction(i, i === 1);
        }
        const template = templates.getRestriction(this.#idx, factors);
        this.#idx++;
        if (reset) {
            $restrictions.innerHTML = template;
            return;
        }
        $restrictions.insertAdjacentHTML("beforeend", template);
    }
    #deleteRestriction() {
        const $restrictions = document.querySelector("#container-restrictions .content");
        if ($restrictions.childElementCount <= 1) return;
        $restrictions.lastElementChild.remove();
        this.#idx--;
    }
    getRestrictionsData() {
        return [
        ...document.querySelectorAll('#container-restrictions > .content .field')
        ].map($field => { 
                return new RestrictionSimplex(
                    [
                        ...$field.querySelectorAll(".coeff")
                    ].map($coeff => Number($coeff.value)),
                    $field.querySelector(".custom-select.sign").value,
                    Number($field.querySelector(".custom-input-text.limit").value)
                )
            }
        );
    }
}

export class InputTypeCase {
    #value;
    init() {
        const $typeCaseInput = document.querySelector("#type-case-input");
        this.#value = $typeCaseInput.value;
        $typeCaseInput.addEventListener("change", e => {
            this.#value = e.target.value;
            this.#setTypeCaseInTargetFunction();
        });
    }
    #setTypeCaseInTargetFunction() {
        const $typeCaseInTargetFunction = document.querySelector("#target-function .start .type");
        $typeCaseInTargetFunction.innerHTML = this.#value;
    }
    getValue() {
        return this.#value;
    }
}

export class FormDataCase {
    #inputTypeCase;
    #handlerTargetFunction;
    #handleRestrictions;
    constructor(
        inputTypeCase = new InputTypeCase(), 
        handlerTargetFunction = new HandlerTargetFunction(),
        handleRestrictions = new HandleRestrictions()) {
        this.#inputTypeCase = inputTypeCase;
        this.#handlerTargetFunction = handlerTargetFunction;
        this.#handleRestrictions = handleRestrictions;
    }
    init() {
        const $btnSubmit = document.querySelector("#btn-show-solution");
        $btnSubmit.addEventListener("click", e => {
                e.preventDefault();
                this.#solve();
            }
        );
    }
    #solve() {
        // const typeCase = this.#inputTypeCase.getValue();
        const typeCase = "MAX";
        // const targetFunction = this.#handlerTargetFunction.getData();
        const targetFunction = [3, 1, 2];
        // const restrictions = this.#handleRestrictions.getRestrictionsData();
        // const restrictions = [
        //     new RestrictionSimplex([1, 2, 1], "LESS_OR_EQUALS", 5),
        //     new RestrictionSimplex([4, 1, 0], "GREATER_OR_EQUALS", 10),
        //     new RestrictionSimplex([1, 1, 1], "LESS_OR_EQUALS", 40),
        // ];
        const restrictions = [
            new RestrictionSimplex([1, 1, 1], "LESS_OR_EQUALS", 4),
            new RestrictionSimplex([0, 1, 2], "LESS_OR_EQUALS", 6),
            new RestrictionSimplex([1, 3, 4], "LESS_OR_EQUALS", 5),
            new RestrictionSimplex([1, 0, 0], "LESS_OR_EQUALS", 2)
        ];
        const solution = getSolution(new DataCaseSimplex(testCase.typeCase, testCase.targetFunction, testCase.restrictions));
        console.log(solution);
    }
}
const testCase = {
    typeCase: "MIN",
    targetFunction: [3, 2, 1],
    restrictions: [
        new RestrictionSimplex([1, 2, 1], "LESS_OR_EQUALS", 10),
        new RestrictionSimplex([1, 1, 2], "LESS_OR_EQUALS", 9),
        new RestrictionSimplex([2, 0, 3], "LESS_OR_EQUALS", 12),
    ]
}