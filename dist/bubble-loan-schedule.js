"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const decimal_js_1 = __importDefault(require("decimal.js"));
const moment_1 = __importDefault(require("moment"));
const abstract_loan_schedule_1 = __importDefault(require("./abstract-loan-schedule"));
class BubbleLoanSchedule extends abstract_loan_schedule_1.default {
    constructor(options) {
        super(options);
    }
    calculateSchedule(p) {
        let date = (0, moment_1.default)(p.issueDate, this.dateFormat);
        const term = new decimal_js_1.default(p.term);
        const amount = new decimal_js_1.default(p.amount);
        const rate = new decimal_js_1.default(p.rate);
        const payments = [this.getInitialPayment(amount, date, rate)];
        let i = 1;
        while (i <= term.toNumber()) {
            const pay = {};
            date = date.add(1, "months").date(p.paymentOnDay);
            pay.paymentDate = date.format(this.dateFormat);
            pay.initialBalance = payments[i - 1].finalBalance;
            pay.interestRate = rate.toFixed(this.decimal);
            pay.principalAmount = i === term.toNumber() ? pay.initialBalance : new decimal_js_1.default(0).toFixed(this.decimal);
            pay.interestAmount = new decimal_js_1.default(this.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            })).toFixed(this.decimal);
            pay.paymentAmount = new decimal_js_1.default(pay.principalAmount).plus(new decimal_js_1.default(pay.interestAmount)).toFixed(this.decimal);
            pay.finalBalance = new decimal_js_1.default(pay.initialBalance).minus(new decimal_js_1.default(pay.principalAmount)).toFixed(this.decimal);
            payments.push(pay);
            i++;
        }
        const schedule = { payments };
        return this.applyFinalCalculation(p, schedule);
    }
}
module.exports = BubbleLoanSchedule;
