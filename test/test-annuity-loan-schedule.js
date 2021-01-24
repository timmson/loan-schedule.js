const LoanSchedule = require("../lib/annuity-loan-schedule");

describe("Annuity loan schedule", () => {
    let loanSchedule = null;

    test("with params($110000/60m/12.9%) has payment amount eq 2497.21", () => {
        loanSchedule = new LoanSchedule();

        let paymentAmount = loanSchedule.calculateAnnuityPaymentAmount({
            amount: 110000,
            term: 60,
            rate: 12.9
        });

        expect(paymentAmount).toEqual("2497.21");

    });
    test("with params($2497.21/60m/12.9%) has max amount eq 109999.97", () => {
        loanSchedule = new LoanSchedule();

        let maxAmount = loanSchedule.calculateMaxLoanAmount({
            paymentAmount: 2497.21,
            term: 60,
            rate: 12.9
        });

        expect(maxAmount).toEqual("109999.97");
    });

    test("with params($50000/12m/11.5%/25.10.2018/25) has total interest eq 31684.22", () => {
        loanSchedule = new LoanSchedule();

        let schedule = loanSchedule.calculateSchedule({
            amount: 500000,
            rate: 11.5,
            term: 12,
            paymentOnDay: 25,
            issueDate: "25.10.2018",
            scheduleType: LoanSchedule.ANNUITY_SCHEDULE,
        });

        expect(schedule.overAllInterest).toEqual("31684.22");
    });

    test("with params($50000/12m/11.5%/25.10.2018/25) uses ruCalendar and has total interest eq 31742.50", () => {
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

        expect(schedule.overAllInterest).toEqual("31742.50");
    });

    test("uses otherCalendar and has error", () => {
        expect(() => loanSchedule = new LoanSchedule({prodCalendar: "en"})).toThrow();
    });

    test("with params($50000/24m/11.5%/01.10.2016/28) and has total interest eq 52407.64", () => {
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

        expect(schedule.overAllInterest).toEqual("52407.64");
        expect(schedule.payments[10].paymentAmount).toEqual("30000.00");
        expect(schedule.payments[10].annuityPaymentAmount).toEqual("19317.96");
        expect(schedule.payments[15].paymentAmount).toEqual("30000.00");
        expect(schedule.payments[15].annuityPaymentAmount).toEqual("13591.17");
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

        test("at 25.12.2016/$50000 and has total interest eq 23911.32", () => {
            p.paymentAmount = 50000;
            p.earlyRepayment = {
                "25.12.2016": {
                    erType: LoanSchedule.ER_TYPE_MATURITY,
                    erAmount: 50000
                }
            };

            let schedule = loanSchedule.calculateSchedule(p);

            expect(schedule.overAllInterest).toEqual("23911.32");
        });

        test("at 25.12.2016 and has total interest eq 27155.13", () => {
            p.paymentAmount = null;
            p.earlyRepayment = {
                "25.12.2016": {
                    erType: LoanSchedule.ER_TYPE_MATURITY,
                    erAmount: 50000
                }
            };

            let schedule = loanSchedule.calculateSchedule(p);

            expect(schedule.overAllInterest).toEqual("27155.13");
        });

        test("at 12.12.2016 and has total interest eq 23690.90", () => {
            p.paymentAmount = 50000;
            p.earlyRepayment = {
                "12.12.2016": {
                    erType: LoanSchedule.ER_TYPE_MATURITY,
                    erAmount: 50000
                }
            };

            let schedule = loanSchedule.calculateSchedule(p);

            expect(schedule.overAllInterest).toEqual("23690.90");
        });

        test("at 12.12.2016 and has total interest eq 8545.27", () => {
            p.paymentAmount = null;
            p.earlyRepayment = {
                "12.12.2016": {
                    erType: LoanSchedule.ER_TYPE_ANNUITY,
                    erAmount: 440000
                }
            };

            let schedule = loanSchedule.calculateSchedule(p);

            expect(schedule.overAllInterest).toEqual("8545.27");
        });
    });
});
