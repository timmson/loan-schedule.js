const decimal = require("decimal.js");
const moment = require("moment");
const LoanSchedule = require("./abstract-loan-schedule");

class DifferentiatedLoanSchedule extends LoanSchedule {

    constructor(options) {
        super(options);
    }

    calculateSchedule(p) {
        let date = moment(p.issueDate, this.dateFormat);
        let term = new decimal(p.term);
        let amount = new decimal(p.amount);
        let rate = new decimal(p.rate);

        let payments = [this.getInitialPayment(amount, date, rate)];
        let i = 1;
        while (i <= term.toNumber()) {
            let pay = {};

            date = date.add(1, "months").date(p.paymentOnDay);
            pay.paymentDate = date.format(this.dateFormat);
            pay.initialBalance = payments[i - 1].finalBalance;
            pay.interestRate = rate.toFixed(this.decimal);
            pay.principalAmount = i === term.toNumber() ? pay.initialBalance : new decimal(0).toFixed(this.decimal);
            pay.interestAmount = new decimal(
                this.calculateInterestByPeriod({
                    from: payments[i - 1].paymentDate,
                    to: pay.paymentDate,
                    amount: pay.initialBalance,
                    rate: pay.interestRate
                })
            ).toFixed(this.decimal);
            pay.paymentAmount = new decimal(pay.principalAmount).plus(new decimal(pay.interestAmount)).toFixed(this.decimal);
            pay.finalBalance = new decimal(pay.initialBalance).minus(new decimal(pay.principalAmount)).toFixed(this.decimal);

            payments.push(pay);
            i++;
        }

        let schedule = {payments};
        return this.applyFinalCalculation(p, schedule);
    }

}

module.exports = DifferentiatedLoanSchedule;