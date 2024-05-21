import { Component } from './component.js';

export class Checkbox extends Component {
    constructor(checkboxID, initValue) {
        super(checkboxID);
        this.component.checked = initValue;
    }

    get value() {
        return this.component.checked;
    }

    set value(value) {
        this.component.checked = value;
    }
}