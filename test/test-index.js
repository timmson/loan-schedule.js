"use strict";
const LoanSchedule = require("../index.js");
const expect = require("chai").expect;
const log = require("log4js").getLogger("test");
log.level = "info";

function printSchedule(schedule) {
    log.info("Payment = {" + schedule.minPaymentAmount + ", " + schedule.maxPaymentAmount + "}, Term = " + schedule.term);
    log.info("OverallInterest = " + schedule.overAllInterest + " , EfficientRate = " + schedule.efficientRate);
    schedule.payments.map(pay => {
        log.info(pay.paymentDate + "\t|\t"
            + pay.initialBalance + "\t|\t"
            + pay.paymentAmount + "\t|\t\t"
            + pay.annuityPaymentAmount + "\t|\t"
            + pay.principalAmount + "\t|\t"
            + pay.interestAmount + "\t|\t"
            + pay.finalBalance);
    });
}

describe("Annuity loan schedule", () => {
    describe("with params($110000/60m/12.9%) has payment amount eq 2497.21", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule();
            expect(loanSchedule.calculateAnnuityPaymentAmount({
                amount: 110000,
                term: 60,
                rate: 12.9
            })).to.equal("2497.21");
        });
    });

    describe("with params($2497.21/60m/12.9%) has max amount eq 109999.97", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule();
            expect(loanSchedule.calculateMaxLoanAmount({
                paymentAmount: 2497.21,
                term: 60,
                rate: 12.9
            })).to.equal("109999.97");
        });
    });

    describe("with params($50000/12m/11.5%/25.10.2018/25) has total interest eq 31684.22", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule();
            let schedule = loanSchedule.calculateSchedule({
                amount: 500000,
                rate: 11.5,
                term: 12,
                paymentOnDay: 25,
                issueDate: "25.10.2018",
                scheduleType: loanSchedule.ANNUITY_SCHEDULE,
            });
            expect(schedule.overAllInterest).to.equal("31684.22");
        });
    });

    describe("with params($50000/12m/11.5%/25.10.2018/25) uses ruCalendar and has total interest eq 31742.50", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule({
                prodCalendar: "ru"
            });
            let schedule = loanSchedule.calculateSchedule({
                amount: 500000,
                rate: 11.5,
                term: 12,
                paymentOnDay: 25,
                issueDate: "25.10.2018",
                scheduleType: loanSchedule.ANNUITY_SCHEDULE,
            });
            expect(schedule.overAllInterest).to.equal("31742.50");
        });
    });

    describe("with params($50000/24m/11.5%/01.10.2016/28) and has total interest eq 52407.64 ", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule();
            let schedule = loanSchedule.calculateSchedule({
                amount: 500000,
                rate: 11.5,
                term: 24,
                paymentAmount: 30000,
                paymentOnDay: 28,
                issueDate: "01.10.2016",
                scheduleType: loanSchedule.ANNUITY_SCHEDULE
            });
            expect(schedule.overAllInterest).to.equal("52407.64");
            expect(schedule.payments[10].paymentAmount).to.equal("30000.00");
            expect(schedule.payments[10].annuityPaymentAmount).to.equal("19317.96");
            expect(schedule.payments[15].paymentAmount).to.equal("30000.00");
            expect(schedule.payments[15].annuityPaymentAmount).to.equal("13591.17");
        });
    });

    describe("with early repayment", () => {
        describe("at 25.12.2016 and params($50000/24m/11.5%/25.10.2016/25/$5000) and has total interest eq 23911.32", () => {
            it("", () => {
                let loanSchedule = new LoanSchedule();
                let schedule = loanSchedule.calculateSchedule({
                    amount: 500000,
                    rate: 11.5,
                    term: 12,
                    paymentOnDay: 25,
                    issueDate: "25.10.2016",
                    paymentAmount: 50000,
                    scheduleType: loanSchedule.ANNUITY_SCHEDULE,
                    earlyRepayment: {
                        "25.12.2016": {
                            erType: loanSchedule.ER_TYPE_MATURITY,
                            erAmount: 50000
                        }
                    }
                });
                expect(schedule.overAllInterest).to.equal("23911.32");
            });
        });

        describe("at 25.12.2016 and params($50000/24m/11.5%/25.10.2016/25) and has total interest eq 23690.90", () => {
            it("", () => {
                let loanSchedule = new LoanSchedule();
                let schedule = loanSchedule.calculateSchedule({
                    amount: 500000,
                    rate: 11.5,
                    term: 12,
                    paymentOnDay: 25,
                    issueDate: "25.10.2016",
                    //paymentAmount: 50000,
                    scheduleType: loanSchedule.ANNUITY_SCHEDULE,
                    earlyRepayment: {
                        "25.12.2016": {
                            erType: loanSchedule.ER_TYPE_MATURITY,
                            erAmount: 50000
                        }
                    }
                });
                expect(schedule.overAllInterest).to.equal("27155.13");
            });
        });

        describe("at 12.12.2016 and params($50000/24m/11.5%/25.10.2016/25) and has total interest eq 23690.90", () => {
            it("", () => {
                let loanSchedule = new LoanSchedule();
                let schedule = loanSchedule.calculateSchedule({
                    amount: 500000,
                    rate: 11.5,
                    term: 12,
                    paymentOnDay: 25,
                    issueDate: "25.10.2016",
                    paymentAmount: 50000,
                    scheduleType: loanSchedule.ANNUITY_SCHEDULE,
                    earlyRepayment: {
                        "12.12.2016": {
                            erType: loanSchedule.ER_TYPE_MATURITY,
                            erAmount: 50000
                        }
                    }
                });
                expect(schedule.overAllInterest).to.equal("23690.90");
            });
        });
    });
});



describe("Differentiated Loan Schedule with params($50000/12m/11.5%/25.10.2016/25) has overall interest eq 3111.18", () => {
    it("", () => {
        let loanSchedule = new LoanSchedule();
        expect(loanSchedule.calculateSchedule({
            amount: 50000,
            rate: 11.5,
            term: 12,
            paymentOnDay: 25,
            issueDate: "25.10.2016",
            scheduleType: loanSchedule.DIFFERENTIATED_SCHEDULE
        }).overAllInterest, "3111.18");
    });
});

describe("Bubble Loan Schedule with params($50000/12m/11.5%/25.10.2016/25) has overall interest eq 5747.13 ", () => {
    it("", () => {
        let loanSchedule = new LoanSchedule();
        expect(loanSchedule.calculateSchedule({
            amount: 50000,
            rate: 11.5,
            term: 12,
            paymentOnDay: 25,
            issueDate: "25.10.2016",
            scheduleType: loanSchedule.BUBBLE_SCHEDULE
        }).overAllInterest, "5747.13");
    });
});

describe("Interest for period", () => {
    describe("from 10.12.2015 to 10.01.2016 with params($1000,16.7%) is $14.17", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule();
            expect(loanSchedule.calculateInterestByPeriod({
                from: "10.12.2015",
                to: "10.01.2016",
                amount: 1000,
                rate: 16.7
            })).to.equal("14.17");
        });
    });

    describe("from 10.11.2015 to 10.12.2015 with params($1000,16.8%) is $13.81", () => {
        it("", () => {
            let loanSchedule = new LoanSchedule();
            expect(loanSchedule.calculateInterestByPeriod({
                from: "10.11.2015",
                to: "10.12.2015",
                amount: 1000,
                rate: 16.8
            })).to.equal("13.81");
        });
    });
});
