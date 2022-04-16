"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const annuity_loan_schedule_1 = __importDefault(require("./annuity-loan-schedule"));
const bubble_loan_schedule_1 = __importDefault(require("./bubble-loan-schedule"));
const differentiated_loan_schedule_1 = __importDefault(require("./differentiated-loan-schedule"));
const mapping = {};
class LoanSchedule {
    constructor(options) {
        this.options = options;
    }
    static getLoanSchedule(scheduleType, options) {
        if (Object.prototype.hasOwnProperty.call(mapping, scheduleType)) {
            return new mapping[scheduleType](options);
        }
    }
    calculateSchedule(p) {
        if (Object.prototype.hasOwnProperty.call(mapping, p.scheduleType)) {
            return LoanSchedule.getLoanSchedule(p.scheduleType, this.options).calculateSchedule(p);
        }
    }
    calculateInterestByPeriod(p) {
        return new annuity_loan_schedule_1.default(this.options).calculateInterestByPeriod(p);
    }
    calculateAnnuityPaymentAmount(p) {
        return new annuity_loan_schedule_1.default(this.options).calculateAnnuityPaymentAmount(p);
    }
    calculateMaxLoanAmount(p) {
        return new annuity_loan_schedule_1.default(this.options).calculateMaxLoanAmount(p);
    }
    static get ANNUITY_SCHEDULE() {
        return "ANNUITY";
    }
    static get DIFFERENTIATED_SCHEDULE() {
        return "DIFFERENTIATED";
    }
    static get BUBBLE_SCHEDULE() {
        return "BUBBLE";
    }
}
mapping[LoanSchedule.ANNUITY_SCHEDULE] = annuity_loan_schedule_1.default;
mapping[LoanSchedule.BUBBLE_SCHEDULE] = bubble_loan_schedule_1.default;
mapping[LoanSchedule.DIFFERENTIATED_SCHEDULE] = differentiated_loan_schedule_1.default;
module.exports = LoanSchedule;
