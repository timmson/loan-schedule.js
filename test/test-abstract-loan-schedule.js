const moment = require("moment");
const LoanSchedule = require("../lib/abstract-loan-schedule");

describe("AbstractLoan should", () => {

	describe("calculate interest for period", () => {

		test("from 10.12.2015 to 10.01.2016 with params($1000,16.7%) is $14.17", () => {
			let loanSchedule = new LoanSchedule();
			expect(loanSchedule.calculateInterestByPeriod({
				from: "10.12.2015",
				to: "10.01.2016",
				amount: 1000,
				rate: 16.7
			})).toEqual("14.17");
		});

		test("from 10.11.2015 to 10.12.2015 with params($1000,16.8%) is $13.81", () => {
			let loanSchedule = new LoanSchedule();
			expect(loanSchedule.calculateInterestByPeriod({
				from: "10.11.2015",
				to: "10.12.2015",
				amount: 1000,
				rate: 16.8
			})).toEqual("13.81");
		});


	});

	test("print Schedule", () => {
		let loanSchedule = new LoanSchedule();

		loanSchedule.printSchedule({payments: []}, () => expect(true).toBeTruthy());
	});

	test("add month and closest day", () => {
		const loanSchedule = new LoanSchedule();

		expect(loanSchedule.addMonths(33, moment("01.05.2013", "DD.MM.YYYY"), 31).format("DD.MM.YYYY")).toEqual("29.02.2016");
	});

	test("return payment date as next day after holiday", () => {
		const loanSchedule = new LoanSchedule({prodCalendar: "ru"});

		expect(loanSchedule.getPaymentDateOnWorkingDay(moment("01.05.2015", "DD.MM.YYYY")).format("DD.MM.YYYY")).toEqual("05.05.2015");
	});

	test("return payment date as closet day before holiday if holiday lasts to the end of the month", () => {
		const loanSchedule = new LoanSchedule({prodCalendar: "ru"});

		expect(loanSchedule.getPaymentDateOnWorkingDay(moment("31.05.2015", "DD.MM.YYYY")).format("DD.MM.YYYY")).toEqual("29.05.2015");
	});

});
