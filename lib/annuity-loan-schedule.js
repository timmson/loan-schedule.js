const Decimal = require("decimal.js");
const moment = require("moment");
const ProdCal = require("prod-cal");
const AbstractLoanSchedule = require("./abstract-loan-schedule");

class AnnuityLoanSchedule extends AbstractLoanSchedule {

	constructor(options) {
		super(options);
	}

	calculateSchedule(p) {
		let date = moment(p.issueDate, this.dateFormat);
		let term = new Decimal(p.term);
		let amount = new Decimal(p.amount);
		let rate = new Decimal(p.rate);
		let interestAccruedAmount = new Decimal(0);
		let regularPaymentAmount = new Decimal(p.paymentAmount || this.calculateAnnuityPaymentAmount({amount: p.amount, term: p.term, rate: p.rate}));

		let payments = [this.getInitialPayment(amount, date, rate)];

		let schedulePoints = Array.apply(null, {length: term.toNumber() + 1}).map(Number.call, Number).map((i) =>
			this.getSchedulePoint(
				(i === 0) ? date.clone() : date.clone().add(i, "months").date(p.paymentOnDay),
				AnnuityLoanSchedule.ER_TYPE_REGULAR,
				regularPaymentAmount
			)
		).concat(Object.keys(p.earlyRepayment || new Object({}))
			.map((d) => this.getSchedulePoint(moment(d, this.dateFormat), p.earlyRepayment[d].erType, new Decimal(p.earlyRepayment[d].erAmount))))
			.sort((a, b) =>
				a.paymentDate.isSame(b.paymentDate, "day") ? 0 : (a.paymentDate.isAfter(b.paymentDate) ? 1 : -1)
			);


		let i = 1;

		let paymentAmount = schedulePoints[i].paymentAmount;
		while (i < schedulePoints.length && new Decimal(payments[i - 1].finalBalance).gt(0)) {
			let pay = {};

			pay.paymentDate = schedulePoints[i].paymentDate.format(this.dateFormat);
			pay.initialBalance = payments[i - 1].finalBalance;
			pay.interestRate = rate.toFixed(this.decimal);
			pay.annuityPaymentAmount = this.calculateAnnuityPaymentAmount({amount: pay.initialBalance, term: term.toNumber() - i + 1, rate: pay.interestRate});

			if (schedulePoints[i].paymentType !== AnnuityLoanSchedule.ER_TYPE_REGULAR) {
				paymentAmount = schedulePoints[i].paymentAmount;
			} else if (schedulePoints[i - 1].paymentType !== AnnuityLoanSchedule.ER_TYPE_REGULAR) {
				paymentAmount = new Decimal(p.paymentAmount || pay.annuityPaymentAmount);
			}

			interestAccruedAmount = interestAccruedAmount.plus(
				this.calculateInterestByPeriod({
					from: payments[i - 1].paymentDate,
					to: pay.paymentDate,
					amount: pay.initialBalance,
					rate: pay.interestRate
				})
			);

			if (schedulePoints[i].paymentType === AnnuityLoanSchedule.ER_TYPE_REGULAR) {
				if ((i !== schedulePoints.length - 1) && paymentAmount.lt(pay.initialBalance)) {
					if (interestAccruedAmount.gt(paymentAmount)) {
						pay.interestAmount = paymentAmount.toFixed(this.decimal);
						interestAccruedAmount = interestAccruedAmount.minus(paymentAmount);
					} else {
						pay.interestAmount = interestAccruedAmount.toFixed(this.decimal);
						interestAccruedAmount = new Decimal(0);
					}
					pay.principalAmount = paymentAmount.minus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
					pay.paymentAmount = paymentAmount.toFixed(this.decimal);
				} else {
					pay.interestAmount = interestAccruedAmount.toFixed(this.decimal);
					pay.principalAmount = pay.initialBalance;
					pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
				}
			} else {
				pay.principalAmount = paymentAmount.toFixed(this.decimal);
				pay.paymentAmount = paymentAmount.toFixed(this.decimal);
				pay.interestAmount = new Decimal(0).toFixed(this.decimal);
			}

			pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount));

			payments.push(pay);
			i++;
		}

		let schedule = {payments};
		return this.applyFinalCalculation(p, schedule);

	}

	calculateMaxLoanAmount(p) {
		let term = new Decimal(p.term);
		let interestRate = new Decimal(p.rate).div(100).div(12);
		let paymentAmount = new Decimal(p.paymentAmount);
		let amount = paymentAmount.div(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
		return amount.toFixed(this.decimal);
	}

	calculateAnnuityPaymentAmount(p) {
		let term = new Decimal(p.term);
		let interestRate = new Decimal(p.rate).div(100).div(12);
		let paymentAmount = new Decimal(p.amount).mul(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
		return paymentAmount.toFixed(this.decimal);
	}

	isHoliday(date) {
		return this.prodCalendar && this.prodCalendar.getCalendar(parseInt(date.format("YYYY"), 10), parseInt(date.format("MM"), 10), parseInt(date.format("DD"), 10)) === ProdCal.DAY_HOLIDAY;
	}

	getSchedulePoint(paymentDate, paymentType, paymentAmount) {
		while (this.isHoliday(paymentDate)) {
			paymentDate.add(1, "days");
		}
		return {
			paymentDate,
			paymentType,
			paymentAmount
		};
	}
}

module.exports = AnnuityLoanSchedule;
