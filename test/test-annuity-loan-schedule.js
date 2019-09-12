const LoanSchedule = require("../lib/annuity-loan-schedule");
const {expect} = require("chai");
require("mocha");

const log = require("log4js").getLogger("test");
log.level = "info";

/*function printSchedule(schedule) {
    log.info("Payment = {" + schedule.minPaymentAmount + ", " + schedule.maxPaymentAmount + "}, Term = " + schedule.term);
    log.info("OverallInterest = " + schedule.overAllInterest + " , EfficientRate = " + schedule.efficientRate);
    schedule.payments.forEach(pay => {
        log.info(pay.paymentDate + "\t|\t"
            + pay.initialBalance + "\t|\t"
            + pay.paymentAmount + "\t|\t\t"
            + pay.annuityPaymentAmount + "\t|\t"
            + pay.principalAmount + "\t|\t"
            + pay.interestAmount + "\t|\t"
            + pay.finalBalance);
    });
}*/

describe("Annuity loan schedule", () => {
	let loanSchedule = null;

	it("with params($110000/60m/12.9%) has payment amount eq 2497.21", () => {
		loanSchedule = new LoanSchedule();

		let paymentAmount = loanSchedule.calculateAnnuityPaymentAmount({
			amount: 110000,
			term: 60,
			rate: 12.9
		});

		expect(paymentAmount).to.equal("2497.21");
	});

	it("with params($2497.21/60m/12.9%) has max amount eq 109999.97", () => {
		loanSchedule = new LoanSchedule();

		let maxAmount = loanSchedule.calculateMaxLoanAmount({
			paymentAmount: 2497.21,
			term: 60,
			rate: 12.9
		});

		expect(maxAmount).to.equal("109999.97");
	});

	it("with params($50000/12m/11.5%/25.10.2018/25) has total interest eq 31684.22", () => {
		loanSchedule = new LoanSchedule();

		let schedule = loanSchedule.calculateSchedule({
			amount: 500000,
			rate: 11.5,
			term: 12,
			paymentOnDay: 25,
			issueDate: "25.10.2018",
			scheduleType: LoanSchedule.ANNUITY_SCHEDULE,
		});

		expect(schedule.overAllInterest).to.equal("31684.22");
	});

	it("with params($50000/12m/11.5%/25.10.2018/25) uses ruCalendar and has total interest eq 31742.50", () => {
		loanSchedule = new LoanSchedule({
			prodCalendar: "ru"
		});

		let schedule = loanSchedule.calculateSchedule({
			amount: 500000,
			rate: 11.5,
			term: 12,
			paymentOnDay: 25,
			issueDate: "25.10.2018",
			scheduleType: LoanSchedule.ANNUITY_SCHEDULE,
		});

		expect(schedule.overAllInterest).to.equal("31742.50");
	});

	it("uses otherCalendar and has error", () => {
		try {
			loanSchedule = new LoanSchedule({
				prodCalendar: "en"
			});
		} catch (e) {
			expect(true).to.eq(true);
		}
	});

	it("with params($50000/24m/11.5%/01.10.2016/28) and has total interest eq 52407.64", () => {
		loanSchedule = new LoanSchedule();

		let schedule = loanSchedule.calculateSchedule({
			amount: 500000,
			rate: 11.5,
			term: 24,
			paymentAmount: 30000,
			paymentOnDay: 28,
			issueDate: "01.10.2016",
			scheduleType: LoanSchedule.ANNUITY_SCHEDULE
		});

		expect(schedule.overAllInterest).to.equal("52407.64");
		expect(schedule.payments[10].paymentAmount).to.equal("30000.00");
		expect(schedule.payments[10].annuityPaymentAmount).to.equal("19317.96");
		expect(schedule.payments[15].paymentAmount).to.equal("30000.00");
		expect(schedule.payments[15].annuityPaymentAmount).to.equal("13591.17");
	});

	describe("with params($50000/12m/11.5%/25.10.2016/25) and early repayment", () => {
		loanSchedule = new LoanSchedule();

		let p = {
			amount: 500000,
			rate: 11.5,
			term: 12,
			paymentOnDay: 25,
			issueDate: "25.10.2016",
			scheduleType: LoanSchedule.ANNUITY_SCHEDULE
		};

		it("at 25.12.2016/$50000 and has total interest eq 23911.32", () => {
			p.paymentAmount = 50000;
			p.earlyRepayment = {
				"25.12.2016": {
					erType: LoanSchedule.ER_TYPE_MATURITY,
					erAmount: 50000
				}
			};

			let schedule = loanSchedule.calculateSchedule(p);

			expect(schedule.overAllInterest).to.equal("23911.32");
		});

		it("at 25.12.2016 and has total interest eq 27155.13", () => {
			p.paymentAmount = null;
			p.earlyRepayment = {
				"25.12.2016": {
					erType: LoanSchedule.ER_TYPE_MATURITY,
					erAmount: 50000
				}
			};

			let schedule = loanSchedule.calculateSchedule(p);

			expect(schedule.overAllInterest).to.equal("27155.13");
		});

		it("at 12.12.2016 and has total interest eq 23690.90", () => {
			p.paymentAmount = 50000;
			p.earlyRepayment = {
				"12.12.2016": {
					erType: LoanSchedule.ER_TYPE_MATURITY,
					erAmount: 50000
				}
			};

			let schedule = loanSchedule.calculateSchedule(p);

			expect(schedule.overAllInterest).to.equal("23690.90");
		});

		it("at 12.12.2016 and has total interest eq 8545.27", () => {
			p.paymentAmount = null;
			p.earlyRepayment = {
				"12.12.2016": {
					erType: LoanSchedule.ER_TYPE_ANNUITY,
					erAmount: 440000
				}
			};

			let schedule = loanSchedule.calculateSchedule(p);

			expect(schedule.overAllInterest).to.equal("8545.27");
		});
	});
});
