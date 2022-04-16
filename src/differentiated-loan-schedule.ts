import Decimal from "decimal.js"
import moment from "moment"
import AbstractLoanSchedule from "./abstract-loan-schedule"
import {LSPayment} from "./index"

class DifferentiatedLoanSchedule extends AbstractLoanSchedule {

	constructor(options) {
		super(options)
	}

	calculateSchedule(p) {
		let date = moment(p.issueDate, this.dateFormat)
		const term = new Decimal(p.term)
		const amount = new Decimal(p.amount)
		const rate = new Decimal(p.rate)
		const fixedPartOfPayment = amount.div(term)

		const payments = [this.getInitialPayment(amount, date, rate)]
		let i = 1
		while (i <= term.toNumber()) {
			const pay:LSPayment = {}

			date = date.add(1, "months").date(p.paymentOnDay)
			pay.paymentDate = date.format(this.dateFormat)
			pay.initialBalance = payments[i - 1].finalBalance
			pay.interestRate = rate.toFixed(this.decimal)
			pay.principalAmount = i === term.toNumber() ? pay.initialBalance : fixedPartOfPayment.toFixed(this.decimal)
			//pay.principalAmount = (i === term.toNumber() ? pay.initialBalance : new Decimal(0).toFixed(this.decimal));
			pay.interestAmount = new Decimal(
				this.calculateInterestByPeriod({
					from: payments[i - 1].paymentDate,
					to: pay.paymentDate,
					amount: pay.initialBalance,
					rate: pay.interestRate
				})
			).toFixed(this.decimal)
			pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.decimal)
			pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.decimal)

			payments.push(pay)
			i++
		}

		const schedule = {payments}
		return this.applyFinalCalculation(p, schedule)
	}

}

export = DifferentiatedLoanSchedule