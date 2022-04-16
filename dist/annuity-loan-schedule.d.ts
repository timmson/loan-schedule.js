import AbstractLoanSchedule from "./abstract-loan-schedule"
import {LSOptions, LSParameters, LSSchedule} from "./index"

declare class AnnuityLoanSchedule extends AbstractLoanSchedule {
    constructor(options?: LSOptions);
    calculateSchedule(p: LSParameters): LSSchedule;
    calculateMaxLoanAmount(p: any): string;
    calculateAnnuityPaymentAmount(p: any): string;
}
export = AnnuityLoanSchedule;
