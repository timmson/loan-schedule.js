import { LSInterestParameters, LSOptions, LSParameters, LSSchedule } from "./types";
import AbstractLoanSchedule from "./abstract-loan-schedule";
declare class LoanSchedule {
    options: LSOptions;
    static getLoanSchedule(scheduleType: any, options: any): AbstractLoanSchedule;
    constructor(options?: LSOptions);
    calculateSchedule(p: any): LSSchedule;
    calculateInterestByPeriod(p: LSInterestParameters): string;
    calculateAnnuityPaymentAmount(p: LSParameters): string;
    calculateMaxLoanAmount(p: LSParameters): string;
    static get ANNUITY_SCHEDULE(): string;
    static get DIFFERENTIATED_SCHEDULE(): string;
    static get BUBBLE_SCHEDULE(): string;
}
export = LoanSchedule;
