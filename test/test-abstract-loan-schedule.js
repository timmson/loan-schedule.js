const LoanSchedule = require("../lib/abstract-loan-schedule");
const {expect} = require("chai");
require("mocha");

describe("Interest for period", () => {
	it("from 10.12.2015 to 10.01.2016 with params($1000,16.7%) is $14.17", () => {
		let loanSchedule = new LoanSchedule();
		expect(loanSchedule.calculateInterestByPeriod({
			from: "10.12.2015",
			to: "10.01.2016",
			amount: 1000,
			rate: 16.7
		})).to.equal("14.17");
	});

	it("from 10.11.2015 to 10.12.2015 with params($1000,16.8%) is $13.81", () => {
		let loanSchedule = new LoanSchedule();
		expect(loanSchedule.calculateInterestByPeriod({
			from: "10.11.2015",
			to: "10.12.2015",
			amount: 1000,
			rate: 16.8
		})).to.equal("13.81");
	});

});