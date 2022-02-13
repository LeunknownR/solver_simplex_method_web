import { 
    HandlerTargetQuantityFunction, 
    HandleRestrictions, 
    InputTypeCase, 
    FormDataCase, 
    HandlerTargetFunction
} from "./view.js";

window.addEventListener("DOMContentLoaded", () => {
    const handlerQuantityTargetFunction = new HandlerTargetQuantityFunction();
    handlerQuantityTargetFunction.init();
    const inputTypeCase = new InputTypeCase();
    inputTypeCase.init();
    const handlerTargetFunction = new HandlerTargetFunction();
    handlerTargetFunction.init();
    const handleRestrictions = new HandleRestrictions(handlerTargetFunction);
    handleRestrictions.init();
    const formDataCase = new FormDataCase(inputTypeCase, handlerTargetFunction, handleRestrictions);
    formDataCase.init();
});