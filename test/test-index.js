"use strict";
const LoanSchedule = require("../index.js");
const assert = require("assert");

describe("LoanSchedule", () => {
    let loanSchedule = new LoanSchedule();
    describe("#calculateAnnuityPaymentAmount", () => {
        it("Should return 2497.21 when 110000/60/12.9", () => {
            assert.equal(loanSchedule.calculateAnnuityPaymentAmount({
                amount: 110000,
                term: 60,
                rate: 12.9
            }), "2497.21");
        });
    });

    describe("#calculateAnnuityPaymentAmount ", () => {
        it("", () => {
            assert.equal(loanSchedule.calculateAnnuityPaymentAmount({
                amount: 110000,
                term: 60,
                rate: 12.9
            }), "2497.21");
        });
    });

    describe("#calculateMaxLoanAmount", () => {
        it("", () => {
            assert.equal(loanSchedule.calculateMaxLoanAmount({
                paymentAmount: 2497.21,
                term: 60,
                rate: 12.9
            }), "109999.97");
        });
    });

    describe("#calculateInterestByPeriod1", () => {
        it("", () => {
            assert.equal(loanSchedule.calculateInterestByPeriod({
                from: "10.12.2015",
                to: "10.01.2016",
                amount: 1000,
                rate: 16.7
            }), "14.17");
        });
    });

    describe("#calculateInterestByPeriod2", () => {
        it("", () => {
            assert.equal(loanSchedule.calculateInterestByPeriod({
                from: "10.11.2015",
                to: "10.12.2015",
                amount: 1000,
                rate: 16.8
            }), "13.81");
        });
    });

    describe("#calculateAnnuitySchedule", () => {
        it("", () => {
            let schedule = loanSchedule.calculateSchedule({
                amount: 500000,
                rate: 11.5,
                term: 12,
                paymentOnDay: 25,
                issueDate: "25.10.2018",
                scheduleType: loanSchedule.ANNUITY_SCHEDULE,
            });
            assert.equal(schedule.overAllInterest, "31684.22");
        });
    });

    describe("#calculateAnnuityScheduleWithProdCal", () => {
        it("", () => {
            loanSchedule = new LoanSchedule({
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
            assert.equal(schedule.overAllInterest, "31727.26");
        });
    });

    describe("#calculateAnnuityScheduleWithEr", () => {
        it("", () => {
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
            assert.equal(schedule.overAllInterest, "23911.32");
        });
    });

    describe("#calculateAnnuityScheduleWithErNotInDate ", () => {
        it("", () => {
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
            assert.equal(schedule.overAllInterest, "23690.90");
        });
    });

    describe("#calculateAnnuitySchedule2 ", () => {
        it("", () => {
            let schedule = loanSchedule.calculateSchedule({
                amount: 500000,
                rate: 11.5,
                term: 24,
                paymentAmount: 30000,
                paymentOnDay: 28,
                issueDate: "01.10.2016",
                scheduleType: loanSchedule.ANNUITY_SCHEDULE
            });
            assert.equal(schedule.overAllInterest, "52407.64");
            assert.equal(schedule.payments[10].paymentAmount, "30000.00");
            assert.equal(schedule.payments[10].annuityPaymentAmount, "19317.96");
            assert.equal(schedule.payments[15].paymentAmount, "30000.00");
            assert.equal(schedule.payments[15].annuityPaymentAmount, "13591.17");
        });
    })
    ;

    describe("#calculateDifferentiatedSchedule ", () => {
        it("", () => {
            assert.equal(loanSchedule.calculateSchedule({
                amount: 50000,
                rate: 11.5,
                term: 12,
                paymentOnDay: 25,
                issueDate: "25.10.2016",
                scheduleType: loanSchedule.DIFFERENTIATED_SCHEDULE
            }).overAllInterest, "3111.18");
        });
    });

    describe("#calculateBubbleSchedule ", () => {
        it("", () => {
            assert.equal(loanSchedule.calculateSchedule({
                amount: 50000,
                rate: 11.5,
                term: 12,
                paymentOnDay: 25,
                issueDate: "25.10.2016",
                scheduleType: loanSchedule.BUBBLE_SCHEDULE
            }).overAllInterest, "5747.13");
        });
    });
});


function printSchedule(schedule) {
    console.log("Payment = {" + schedule.minPaymentAmount + ", " + schedule.maxPaymentAmount + "}, Term = " + schedule.term);
    console.log("OverallInterest = " + schedule.overAllInterest + " , EfficientRate = " + schedule.efficientRate);
    schedule.payments.map(pay =>
        console.log(pay.paymentDate + "\t|\t"
            + pay.initialBalance + "\t|\t"
            + pay.paymentAmount + "\t|\t\t"
            + pay.annuityPaymentAmount + "\t|\t"
            + pay.principalAmount + "\t|\t"
            + pay.interestAmount + "\t|\t"
            + pay.finalBalance
        ));
}
