import AbstractLoanSchedule from "./abstract-loan-schedule"
import {LSParameters} from "./types"

declare class BubbleLoanSchedule extends AbstractLoanSchedule {
    constructor(options: any);
    calculateSchedule(p: LSParameters): import("./types").LSSchedule;
}
export = BubbleLoanSchedule;
