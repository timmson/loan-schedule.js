const Decimal = require("decimal.js");
const moment = require("moment");
const AbstractLoanSchedule = require("./abstract-loan-schedule");

class BubbleLoanSchedule extends AbstractLoanSchedule {

    constructor(options) {
        super(options);
    }

    calculateSchedule(p) {
        let date = moment(p.issueDate, this.dateFormat);
        let term = new Decimal(p.term);
        let amount = new Decimal(p.amount);
        let rate = new Decimal(p.rate);

        let payments = [this.getInitialPayment(amount, date, rate)];
        let i = 1;
        while (i <= term.toNumber()) {
            let pay = {};

            date = date.add(1, "months").date(p.paymentOnDay);
            pay.paymentDate = date.format(this.dateFormat);
            pay.initialBalance = payments[i - 1].finalBalance;
            pay.interestRate = rate.toFixed(this.decimal);
            pay.principalAmount = i === term.toNumber() ? pay.initialBalance : new Decimal(0).toFixed(this.decimal);
            pay.interestAmount = new Decimal(
                this.calculateInterestByPeriod({
                    from: payments[i - 1].paymentDate,
                    to: pay.paymentDate,
                    amount: pay.initialBalance,
                    rate: pay.interestRate
                })
            ).toFixed(this.decimal);
            pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
            pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.decimal);

            payments.push(pay);
            i++;
        }
        let schedule = {payments};
        return this.applyFinalCalculation(p, schedule);
    }

}

module.exports = BubbleLoanSchedule;