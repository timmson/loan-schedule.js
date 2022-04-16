import {LSOptions} from "./types"

declare class LoanSchedule {
    options: LSOptions;
    static getLoanSchedule(scheduleType: any, options: any): any;
    constructor(options?: LSOptions);
    calculateSchedule(p: any): any;
    calculateInterestByPeriod(p: any): string;
    calculateAnnuityPaymentAmount(p: any): string;
    calculateMaxLoanAmount(p: any): string;
    static get ANNUITY_SCHEDULE(): string;
    static get DIFFERENTIATED_SCHEDULE(): string;
    static get BUBBLE_SCHEDULE(): string;
}
export = LoanSchedule;
