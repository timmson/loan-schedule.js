import AbstractLoanSchedule from "./abstract-loan-schedule";
import { LSParameters } from "./types";
declare class DifferentiatedLoanSchedule extends AbstractLoanSchedule {
    constructor(options: any);
    calculateSchedule(p: LSParameters): import("./types").LSSchedule;
}
export = DifferentiatedLoanSchedule;
