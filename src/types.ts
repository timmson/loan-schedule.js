import {Moment} from "moment"

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
	amount: string
	issueDate?: string
	term: number
	rate: string
	paymentAmount?: string
	paymentOnDay?: number
	earlyRepayment?: LSEarlyRepayments

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
	amount?: string
	efficientRate?: string
	fullAmount?: string
	maxPaymentAmount?: string
	minPaymentAmount?: string
	overAllInterest?: string
	payments?: Array<LSPayment>
	term?: number
}

export type LSInterestParameters = {
	from: string
	to: string
	amount: string
	rate: string
}

export type LSInterestByPeriodParameters = {
	from: Moment
	to: Moment
	amount: string
	rate: string
}