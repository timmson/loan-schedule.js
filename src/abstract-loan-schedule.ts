import Decimal from "decimal.js"
import moment from "moment"
import ProdCal from "prod-cal"

class AbstractLoanSchedule {

	decimal = 2
	dateFormat = "DD.MM.YYYY"
	prodCalendar: ProdCal = null

	constructor(options) {

		if (options) {
			this.decimal = options.decimalDigit || this.decimal
			this.dateFormat = options.dateFormat || this.dateFormat
			this.prodCalendar = new ProdCal(options.prodCalendar)
		}
	}

	applyFinalCalculation(p, schedule) {
		const paymentLastIndex = schedule.payments.length - 1
		const firstPayment = schedule.payments[1].paymentAmount
		const lastPayment = schedule.payments[paymentLastIndex].paymentAmount
		schedule.minPaymentAmount = Decimal.min(firstPayment, lastPayment).toFixed(this.decimal)
		schedule.maxPaymentAmount = Decimal.max(firstPayment, lastPayment).toFixed(this.decimal)

		const dateStart = moment(schedule.payments[0].paymentDate, this.dateFormat).date(1)
		const dateEnd = moment(schedule.payments[paymentLastIndex].paymentDate, this.dateFormat).date(1)
		schedule.term = Math.round(moment.duration(dateEnd.diff(dateStart)).asMonths())

		schedule.amount = new Decimal(p.amount).toFixed(this.decimal)
		schedule.overAllInterest = new Decimal(0)
		schedule.payments.map((pay) => {
			const overAllInterest = new Decimal(schedule.overAllInterest).plus(pay.interestAmount)
			schedule.overAllInterest = overAllInterest.toFixed(this.decimal)
		})

		schedule.efficientRate = new Decimal(schedule.overAllInterest).div(schedule.amount).mul(100).toFixed(this.decimal)
		schedule.fullAmount = new Decimal(schedule.overAllInterest).add(schedule.amount).toFixed(this.decimal)
		return schedule
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
		}
	}

	calculateInterestByPeriod(p) {
		let currentInterest = new Decimal(0)
		const dateFrom = moment(p.from, this.dateFormat)
		const dateTo = moment(p.to, this.dateFormat)
		if (dateFrom.isSame(dateTo, "year")) {
			currentInterest = currentInterest.plus(this.getInterestByPeriod({
				from: dateFrom,
				to: dateTo,
				amount: p.amount,
				rate: p.rate
			}))
		} else {
			const endOfYear = moment({years: dateFrom.year(), months: 11, days: 31})
			currentInterest = currentInterest.plus(this.getInterestByPeriod({
				from: dateFrom,
				to: endOfYear,
				amount: p.amount,
				rate: p.rate
			}))
			currentInterest = currentInterest.plus(this.getInterestByPeriod({
				from: endOfYear,
				to: dateTo,
				amount: p.amount,
				rate: p.rate
			}))
		}
		return currentInterest.toFixed(this.decimal)
	}

	getInterestByPeriod(p) {
		return new Decimal(p.rate).div(100).div(p.to.year() % 4 === 0 ? 366 : 365).mul(moment.duration(p.to.diff(p.from)).asDays()).mul(p.amount)
	}

	addMonths(number, date, paymentOnDay) {
		const paymentDate = date.clone().startOf("month").add(number, "months")
		const endOfMonth = paymentDate.clone().endOf("month").date()
		return paymentDate.date(endOfMonth < paymentOnDay ? endOfMonth : paymentOnDay)
	}

	isHoliday(date) {
		return this.prodCalendar && this.prodCalendar.getCalendar(date.year(), date.month() + 1, date.date()) === ProdCal.DAY_HOLIDAY
	}

	getSchedulePoint(paymentDate, paymentType, paymentAmount) {
		paymentDate = this.getPaymentDateOnWorkingDay(paymentDate)
		return {
			paymentDate,
			paymentType,
			paymentAmount
		}
	}

	getPaymentDateOnWorkingDay(paymentDate) {
		const paymentDateOnWorkingDay = paymentDate.clone()
		let amount = 1

		while (this.isHoliday(paymentDateOnWorkingDay)) {
			paymentDateOnWorkingDay.add(amount, "days")
			if (paymentDateOnWorkingDay.month() !== paymentDate.month()) {
				amount = -1
				paymentDateOnWorkingDay.add(amount, "days")
			}
		}

		return paymentDateOnWorkingDay
	}

	printSchedule(schedule, printFunction) {
		const pf = printFunction || console.log
		pf("Payment = {" + schedule.minPaymentAmount + ", " + schedule.maxPaymentAmount + "}, Term = " + schedule.term)
		pf("OverallInterest = " + schedule.overAllInterest + " , EfficientRate = " + schedule.efficientRate)
		schedule.payments.forEach(pay => {
			pf(pay.paymentDate + "\t|\t"
                + pay.initialBalance + "\t|\t"
                + pay.paymentAmount + "\t|\t\t"
                + (pay.annuityPaymentAmount || "--") + "\t|\t"
                + pay.principalAmount + "\t|\t"
                + pay.interestAmount + "\t|\t"
                + pay.finalBalance)
		})
	}

	static get ER_TYPE_MATURITY() {
		return "ER_MATURITY"
	}

	static get ER_TYPE_ANNUITY() {
		return "ER_ANNUITY"
	}

	static get ER_TYPE_REGULAR() {
		return "REGULAR"
	}
}

export default AbstractLoanSchedule