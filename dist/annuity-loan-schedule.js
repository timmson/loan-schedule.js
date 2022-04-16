"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = __importDefault(require("decimal.js"));
const moment_1 = __importDefault(require("moment"));
const abstract_loan_schedule_1 = __importDefault(require("./abstract-loan-schedule"));
class AnnuityLoanSchedule extends abstract_loan_schedule_1.default {
    constructor(options) {
        super(options);
    }
    calculateSchedule(p) {
        const date = (0, moment_1.default)(p.issueDate, this.dateFormat);
        const term = new decimal_js_1.default(p.term);
        const amount = new decimal_js_1.default(p.amount);
        const rate = new decimal_js_1.default(p.rate);
        let interestAccruedAmount = new decimal_js_1.default(0);
        const regularPaymentAmount = new decimal_js_1.default(p.paymentAmount || this.calculateAnnuityPaymentAmount({
            amount: p.amount,
            term: p.term,
            rate: p.rate
        }));
        const payments = [this.getInitialPayment(amount, date, rate)];
        const schedulePoints = Array.apply(null, { length: term.toNumber() + 1 }).map(Number.call, Number).map((i) => this.getSchedulePoint((i === 0) ? date.clone() : this.addMonths(i, date, p.paymentOnDay), AnnuityLoanSchedule.ER_TYPE_REGULAR, regularPaymentAmount)).concat(Object.keys(p.earlyRepayment || new Object({}))
            .map((d) => this.getSchedulePoint((0, moment_1.default)(d, this.dateFormat), p.earlyRepayment[d].erType, new decimal_js_1.default(p.earlyRepayment[d].erAmount))))
            .sort((a, b) => a.paymentDate.isSame(b.paymentDate, "day") ? 0 : (a.paymentDate.isAfter(b.paymentDate) ? 1 : -1));
        let i = 1;
        let paymentAmount = schedulePoints[i].paymentAmount;
        while (i < schedulePoints.length && new decimal_js_1.default(payments[i - 1].finalBalance).gt(0)) {
            const pay = {};
            pay.paymentDate = schedulePoints[i].paymentDate.format(this.dateFormat);
            pay.initialBalance = payments[i - 1].finalBalance;
            pay.interestRate = rate.toFixed(this.decimal);
            pay.annuityPaymentAmount = this.calculateAnnuityPaymentAmount({
                amount: pay.initialBalance,
                term: term.toNumber() - i + 1,
                rate: pay.interestRate
            });
            if (schedulePoints[i].paymentType !== AnnuityLoanSchedule.ER_TYPE_REGULAR) {
                paymentAmount = schedulePoints[i].paymentAmount;
            }
            else if (schedulePoints[i - 1].paymentType !== AnnuityLoanSchedule.ER_TYPE_REGULAR) {
                paymentAmount = new decimal_js_1.default(p.paymentAmount || pay.annuityPaymentAmount);
            }
            interestAccruedAmount = interestAccruedAmount.plus(this.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            }));
            if (schedulePoints[i].paymentType === AnnuityLoanSchedule.ER_TYPE_REGULAR) {
                if ((i !== schedulePoints.length - 1) && paymentAmount.lt(pay.initialBalance)) {
                    if (interestAccruedAmount.gt(paymentAmount)) {
                        pay.interestAmount = paymentAmount.toFixed(this.decimal);
                        interestAccruedAmount = interestAccruedAmount.minus(paymentAmount);
                    }
                    else {
                        pay.interestAmount = interestAccruedAmount.toFixed(this.decimal);
                        interestAccruedAmount = new decimal_js_1.default(0);
                    }
                    pay.principalAmount = paymentAmount.minus(new decimal_js_1.default(pay.interestAmount)).toFixed(this.decimal);
                    pay.paymentAmount = paymentAmount.toFixed(this.decimal);
                }
                else {
                    pay.interestAmount = interestAccruedAmount.toFixed(this.decimal);
                    pay.principalAmount = pay.initialBalance;
                    pay.paymentAmount = new decimal_js_1.default(pay.principalAmount).plus(new decimal_js_1.default(pay.interestAmount)).toFixed(this.decimal);
                }
            }
            else {
                pay.principalAmount = paymentAmount.toFixed(this.decimal);
                pay.paymentAmount = paymentAmount.toFixed(this.decimal);
                pay.interestAmount = new decimal_js_1.default(0).toFixed(this.decimal);
            }
            pay.finalBalance = new decimal_js_1.default(pay.initialBalance).minus(new decimal_js_1.default(pay.principalAmount)).toFixed(this.decimal);
            payments.push(pay);
            i++;
        }
        const schedule = { payments };
        return this.applyFinalCalculation(p, schedule);
    }
    calculateMaxLoanAmount(p) {
        const term = new decimal_js_1.default(p.term);
        const interestRate = new decimal_js_1.default(p.rate).div(100).div(12);
        const paymentAmount = new decimal_js_1.default(p.paymentAmount);
        const amount = paymentAmount.div(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
        return amount.toFixed(this.decimal);
    }
    calculateAnnuityPaymentAmount(p) {
        const term = new decimal_js_1.default(p.term);
        const interestRate = new decimal_js_1.default(p.rate).div(100).div(12);
        const paymentAmount = new decimal_js_1.default(p.amount).mul(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
        return paymentAmount.toFixed(this.decimal);
    }
}
exports.default = AnnuityLoanSchedule;
