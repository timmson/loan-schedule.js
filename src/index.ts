import AnnuitySchedule from "./annuity-loan-schedule"
import BubbleLoanSchedule from "./bubble-loan-schedule"
import DifferentiatedSchedule from "./differentiated-loan-schedule"

const mapping = {}

export type LSOptions = {
	decimalDigit?: number
	dateFormat?: string
	prodCalendar?: string
}

export type LSEarlyRepayment = {
	erType: string
	erAmount: string
}

export type LSEarlyRepayments = {
	[date: string]: LSEarlyRepayment
}

export type LSParameters = {
	earlyRepayment: LSEarlyRepayments
	amount: string
	issueDate: string
	term: string
	rate: string
	paymentAmount?: string
	paymentOnDay: number

}

export type LSPayment = {
	paymentDate?: string
	initialBalance?: string
	interestRate?: string
	annuityPaymentAmount?: string
	interestAmount?: string
	principalAmount?: string
	paymentAmount?: string
	finalBalance?: string
}

export type LSSchedule = {
	payments?: Array<LSPayment>
	minPaymentAmount: string
	maxPaymentAmount: string
	efficientRate: string
	term: string
	overAllInterest: string
}

class LoanSchedule {

	options: LSOptions

	static getLoanSchedule(scheduleType, options) {
		if (Object.prototype.hasOwnProperty.call(mapping, scheduleType)) {
			return new mapping[scheduleType](options)
		}
	}

	constructor(options?: LSOptions) {
		this.options = options
	}

	calculateSchedule(p) {
		if (Object.prototype.hasOwnProperty.call(mapping, p.scheduleType)) {
			return LoanSchedule.getLoanSchedule(p.scheduleType, this.options).calculateSchedule(p)
		}
	}

	calculateInterestByPeriod(p) {
		return new AnnuitySchedule(this.options).calculateInterestByPeriod(p)
	}

	calculateAnnuityPaymentAmount(p) {
		return new AnnuitySchedule(this.options).calculateAnnuityPaymentAmount(p)
	}

	calculateMaxLoanAmount(p) {
		return new AnnuitySchedule(this.options).calculateMaxLoanAmount(p)
	}

	static get ANNUITY_SCHEDULE() {
		return "ANNUITY"
	}

	static get DIFFERENTIATED_SCHEDULE() {
		return "DIFFERENTIATED"
	}

	static get BUBBLE_SCHEDULE() {
		return "BUBBLE"
	}
}

mapping[LoanSchedule.ANNUITY_SCHEDULE] = AnnuitySchedule
mapping[LoanSchedule.BUBBLE_SCHEDULE] = BubbleLoanSchedule
mapping[LoanSchedule.DIFFERENTIATED_SCHEDULE] = DifferentiatedSchedule

export default LoanSchedule

