import { Component } from './component.js';

export class Slider extends Component {
    constructor(sliderID, initValue) {
        super(sliderID);
        this.value = initValue;
    }

    get value() {
        return this.component.value;
    }

    set value(value) {
        this.component.value = value;
    }
}