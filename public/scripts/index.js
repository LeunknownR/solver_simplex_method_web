import { DevelopmentL } from "./dev.js";
import { 
    HandlerTargetQuantityFunction, 
    HandleRestrictions, 
    InputTypeCase, 
    FormDataCase, 
    HandlerTargetFunction,
    HandlerCustomInputText
} from "./view.js";

window.addEventListener("DOMContentLoaded", () => {
    const handlerQuantityTargetFunction = new HandlerTargetQuantityFunction();
    handlerQuantityTargetFunction.init();
    const inputTypeCase = new InputTypeCase();
    inputTypeCase.init();
    const inputText = new HandlerCustomInputText();
    inputText.init();
    const handlerTargetFunction = new HandlerTargetFunction();
    handlerTargetFunction.init();
    const handleRestrictions = new HandleRestrictions(handlerTargetFunction);
    handleRestrictions.init();

    const formDataCase = new FormDataCase(inputTypeCase, handlerTargetFunction, handleRestrictions);
    formDataCase.init();
    // Desarrollo
    new DevelopmentL();
});