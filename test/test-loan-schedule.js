const LoanSchedule = require("../dist/index")

test("", () => {
	const loanSchedule = new LoanSchedule();

	expect(loanSchedule).toBeDefined();
})