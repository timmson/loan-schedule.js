const LoanSchedule = require("../lib/bubble-loan-schedule");

describe("Bubble Loan Schedule should", () => {
	let loanSchedule = new LoanSchedule();

	test("have overall interest eq 5747.13 when params($50000/12m/11.5%/25.10.2016/25)", () => {
		let schedule = loanSchedule.calculateSchedule({
			amount: 50000,
			rate: 11.5,
			term: 12,
			paymentOnDay: 25,
			issueDate: "25.10.2016"
		});

		expect(schedule.overAllInterest).toEqual("5747.13");
	});
});