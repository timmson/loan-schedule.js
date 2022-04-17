import AnnuitySchedule from "./annuity-loan-schedule"
import BubbleLoanSchedule from "./bubble-loan-schedule"
import DifferentiatedSchedule from "./differentiated-loan-schedule"
import {LSInterestParameters, LSOptions, LSParameters, LSSchedule} from "./types"
import AbstractLoanSchedule from "./abstract-loan-schedule"

const mapping = {}

class LoanSchedule {

	options: LSOptions

	static getLoanSchedule(scheduleType, options): AbstractLoanSchedule {
		if (Object.prototype.hasOwnProperty.call(mapping, scheduleType)) {
			return new mapping[scheduleType](options)
		}
	}

	constructor(options?: LSOptions) {
		this.options = options
	}

	calculateSchedule(p): LSSchedule {
		if (Object.prototype.hasOwnProperty.call(mapping, p.scheduleType)) {
			return LoanSchedule.getLoanSchedule(p.scheduleType, this.options).calculateSchedule(p)
		}
	}

	calculateInterestByPeriod(p: LSInterestParameters): string {
		return new AnnuitySchedule(this.options).calculateInterestByPeriod(p)
	}

	calculateAnnuityPaymentAmount(p: LSParameters): string {
		return new AnnuitySchedule(this.options).calculateAnnuityPaymentAmount(p)
	}

	calculateMaxLoanAmount(p: LSParameters): string {
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

export = LoanSchedule

