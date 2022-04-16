const LoanSchedule = require("../dist/differentiated-loan-schedule");

describe("Differentiated Loan Schedule should", () => {
	let loanSchedule = new LoanSchedule();

	test("have overall interest eq 3111.18 when params($50000/12m/11.5%/25.10.2016/25)", () => {
		let schedule = loanSchedule.calculateSchedule({
			amount: 50000,
			rate: 11.5,
			term: 12,
			paymentOnDay: 25,
			issueDate: "25.10.2016"
		});

		expect(schedule.payments[schedule.payments.length - 1].paymentAmount).toEqual("4206.01");
		expect(schedule.overAllInterest).toEqual("3111.18");
	});
});