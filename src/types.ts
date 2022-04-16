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