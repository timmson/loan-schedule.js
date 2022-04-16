import AbstractLoanSchedule from "./abstract-loan-schedule"

declare class DifferentiatedLoanSchedule extends AbstractLoanSchedule {
    constructor(options: any);
    calculateSchedule(p: any): any;
}
export = DifferentiatedLoanSchedule;
