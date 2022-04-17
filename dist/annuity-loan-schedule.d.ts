import AbstractLoanSchedule from "./abstract-loan-schedule"
import {LSOptions, LSParameters, LSSchedule} from "./types"

declare class AnnuityLoanSchedule extends AbstractLoanSchedule {
    constructor(options?: LSOptions);
    calculateSchedule(p: LSParameters): LSSchedule;
    calculateMaxLoanAmount(p: LSParameters): string;
    calculateAnnuityPaymentAmount(p: LSParameters): string;
}
export = AnnuityLoanSchedule;
