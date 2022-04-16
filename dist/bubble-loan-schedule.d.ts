import AbstractLoanSchedule from "./abstract-loan-schedule"

declare class BubbleLoanSchedule extends AbstractLoanSchedule {
    constructor(options: any);
    calculateSchedule(p: any): any;
}
export = BubbleLoanSchedule;
