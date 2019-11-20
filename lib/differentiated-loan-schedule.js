// Normal JS Modules
const Decimal = require("decimal.js");
const moment = require("moment");

// Co-file import
const LoanSchedule = require("./abstract-loan-schedule");

// Define class
class DifferentiatedLoanSchedule extends LoanSchedule {

	constructor(options) {
		super(options);
	}

	// Declare function
	calculateSchedule(p) {

		// Define Variables
		let date = moment(p.issueDate, this.dateFormat);
		let term = new Decimal(p.term);
		let amount = new Decimal(p.amount);
		let rate = new Decimal(p.rate);

		// Define `payments` & do math
		// getInitialPayment is in abstract-loan-schedule.
		let payments = [this.getInitialPayment(amount, date, rate)];

		// Rewrite `while` loop.
		let i = 1;
		while (i <= term.toNumber()) {

			// Define variable
			let pay = {};

			date = date.add(1, "months").date(p.paymentOnDay);
			pay.paymentDate = date.format(this.dateFormat);
			pay.initialBalance = payments[i - 1].finalBalance;
			pay.interestRate = rate.toFixed(this.decimal);
			pay.principalAmount = i === term.toNumber() ? pay.initialBalance : new Decimal(0).toFixed(this.decimal);
			pay.interestAmount = new Decimal(
				
				// calculateInterestByPeriod is in abstract-loan-schedule.
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

		// applyFinalCalculation is in abstract-loan-schedule.
		return this.applyFinalCalculation(p, schedule);
	}

}

module.exports = DifferentiatedLoanSchedule;
