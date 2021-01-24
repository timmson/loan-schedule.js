const LoanSchedule = require("../lib/abstract-loan-schedule");

describe("Interest for period", () => {

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

	test("print Schedule", () => {
		let loanSchedule = new LoanSchedule();

		loanSchedule.printSchedule({payments:[]}, () => expect(true).toBeTruthy());
	});

});