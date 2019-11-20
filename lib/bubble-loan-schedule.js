// Normal JS Modules
const Decimal = require("decimal.js");
const moment = require("moment");

// Co-file import
const AbstractLoanSchedule = require("./abstract-loan-schedule");

// Define Class
class BubbleLoanSchedule extends AbstractLoanSchedule {

	// Huh? What do constructors do?
	constructor(options) {
		super(options);
	}

	// What is it?
	// Function, class, or something else?
	// Guessing a function.
	calculateSchedule(p) {

		// Define variables
		let date = moment(p.issueDate, this.dateFormat);
		let term = new Decimal(p.term);
		let amount = new Decimal(p.amount);
		let rate = new Decimal(p.rate);

		// Get payment amount
		let payments = [this.getInitialPayment(amount, date, rate)];

		// Why not in the `while` loop definition?
		let i = 1;
		while (i <= term.toNumber()) {
			let pay = {};

			// Adding a month. Cool ability.
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

			// Iterating up.
			i++;
		}
		let schedule = {payments};
		return this.applyFinalCalculation(p, schedule);
	}

}

module.exports = BubbleLoanSchedule;
