// Called by all 3 of its folder-mates.
// Just like root/index.js

//  Number precision is specified in terms of significant digits rather than decimal places
const Decimal = require("decimal.js");
// date library for parsing, validating, manipulating, and formatting dates.
const moment = require("moment");
// Production Calendar
const ProdCal = require("prod-cal");

// New Class
class AbstractLoanSchedule {

	// Relearn what a constructor is/does
	// Nothing here calls it. Where does `options` come from?
	constructor(options) {
		this.decimal = 2;
		this.dateFormat = "DD.MM.YYYY";
		this.prodCalendar = null;

		if (options) {
			this.decimal = options.decimalDigit || this.decimal;
			this.dateFormat = options.dateFormat || this.dateFormat;
			this.prodCalendar = new ProdCal(options.prodCalendar);
		}
	}

	// Where is this called from?
	// `schedule` must be an object passed in.
	applyFinalCalculation(p, schedule) {
		// Math correction
		let paymentLastIndex = schedule.payments.length - 1;
		// Set expected monthly payment
		let firstPayment = schedule.payments[1].paymentAmount;
		// Set expected last payment
		let lastPayment = schedule.payments[paymentLastIndex].paymentAmount;
		// Set minimum payment
		schedule.minPaymentAmount = Decimal.min(firstPayment, lastPayment).toFixed(this.decimal);
		// Set maximum payment
		schedule.maxPaymentAmount = Decimal.max(firstPayment, lastPayment).toFixed(this.decimal);

		// Setting & Formatting first & last payment dates
		let dateStart = moment(schedule.payments[0].paymentDate, this.dateFormat).date(1);
		let dateEnd = moment(schedule.payments[paymentLastIndex].paymentDate, this.dateFormat).date(1);

		// Setting values to `schedule`.
		schedule.term = Math.round(moment.duration(dateEnd.diff(dateStart)).asMonths());
		schedule.amount = new Decimal(p.amount).toFixed(this.decimal);
		schedule.overAllInterest = new Decimal(0);
		schedule.payments.map((pay) => {
			let overAllInterest = new Decimal(schedule.overAllInterest).plus(pay.interestAmount);
			schedule.overAllInterest = overAllInterest.toFixed(this.decimal);
		});

		schedule.efficientRate = new Decimal(schedule.overAllInterest).div(schedule.amount).mul(100).toFixed(this.decimal);
		schedule.fullAmount = new Decimal(schedule.overAllInterest).add(schedule.amount).toFixed(this.decimal);
		return schedule;
	}

	getInitialPayment(amount, date, rate) {
		return {
			paymentDate: date.format(this.dateFormat),
			initialBalance: new Decimal(0).toFixed(this.decimal),
			paymentAmount: new Decimal(0).toFixed(this.decimal),
			annuityPaymentAmount: new Decimal(0).toFixed(this.decimal),
			interestAmount: new Decimal(0).toFixed(this.decimal),
			principalAmount: new Decimal(0).toFixed(this.decimal),
			finalBalance: new Decimal(amount).toFixed(this.decimal),
			interestRate: rate.toFixed(this.decimal)
		};
	}

	calculateInterestByPeriod(p) {
		let currentInterest = new Decimal(0);
		let dateFrom = moment(p.from, this.dateFormat);
		let dateTo = moment(p.to, this.dateFormat);
		if (dateFrom.isSame(dateTo, "year")) {
			currentInterest = currentInterest.plus(this.getInterestByPeriod({from: dateFrom, to: dateTo, amount: p.amount, rate: p.rate}));
		} else {
			let endOfYear = moment({years: dateFrom.year(), months: 11, days: 31});
			currentInterest = currentInterest.plus(this.getInterestByPeriod({from: dateFrom, to: endOfYear, amount: p.amount, rate: p.rate}));
			currentInterest = currentInterest.plus(this.getInterestByPeriod({from: endOfYear, to: dateTo, amount: p.amount, rate: p.rate}));
		}
		return currentInterest.toFixed(this.decimal);
	}

	getInterestByPeriod(p) {
		return new Decimal(p.rate).div(100).div(p.to.year() % 4 === 0 ? 366 : 365).mul(moment.duration(p.to.diff(p.from)).asDays()).mul(p.amount);
	}

}

AbstractLoanSchedule.ER_TYPE_MATURITY = "ER_MATURITY";
AbstractLoanSchedule.ER_TYPE_ANNUITY = "ER_ANNUITY";
AbstractLoanSchedule.ER_TYPE_REGULAR = "REGULAR";

module.exports = AbstractLoanSchedule;
