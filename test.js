"use strict";
var LoanSchedule = require('./index.js');

module.exports = {
    setUp: function (callback) {
        this.loanSchedule = new LoanSchedule({
            decimalDigit: 2,
            //dateFormat: 'DD.MM.YYYY'
        });
        callback();
    },

    testCalculateAnnuityPaymentAmount: function (test) {
        test.equal(this.loanSchedule.calculateAnnuityPaymentAmount({
            amount: 110000,
            term: 60,
            rate: 12.9
        }), '2497.21');
        test.done();
    },

    testCalculateMaxLoanAmount: function (test) {
        test.equal(this.loanSchedule.calculateMaxLoanAmount({
            paymentAmount: 2497.21,
            term: 60,
            rate: 12.9
        }), '109999.97');
        test.done();
    },

    testCalculateInterestByPeriod1: function (test) {
        test.equal(this.loanSchedule.calculateInterestByPeriod({
            from: '10.12.2015',
            to: '10.01.2016',
            amount: 1000,
            rate: 16.7
        }), '14.17');
        test.done();
    },

    testCalculateInterestByPeriod2: function (test) {
        test.equal(this.loanSchedule.calculateInterestByPeriod({
            from: '10.11.2015',
            to: '10.12.2015',
            amount: 1000,
            rate: 16.8
        }), '13.81');
        test.done();
    },

    testCalculateAnnuitySchedule1: function (test) {
        test.equal(this.loanSchedule.calculateSchedule({
            amount: 50000,
            rate: 11.5,
            term: 12,
            paymentOnDay: 25,
            issueDate: '25.10.2016',
            scheduleType: this.loanSchedule.ANNUITY_SCHEDULE
        }).overAllInterest, '3165.39');
        test.done();
    },

    testCalculateAnnuitySchedule2: function (test) {
        test.equal(this.loanSchedule.calculateSchedule({
            amount: 500000,
            rate: 11.5,
            term: 24,
            paymentAmount: 30000,
            paymentOnDay: 28,
            issueDate: '01.10.2016',
            scheduleType: this.loanSchedule.ANNUITY_SCHEDULE
        }).overAllInterest, '52407.64');
        test.done();
    },

    testCalculateDifferentiatedSchedule: function (test) {
        test.equal(this.loanSchedule.calculateSchedule({
            amount: 50000,
            rate: 11.5,
            term: 12,
            paymentOnDay: 25,
            issueDate: '25.10.2016',
            scheduleType: this.loanSchedule.DIFFERENTIATED_SCHEDULE
        }).overAllInterest, '3111.18');
        test.done();
    },

    testCalculateBubbleSchedule: function (test) {

        test.equal(this.loanSchedule.calculateSchedule({
            amount: 50000,
            rate: 11.5,
            term: 12,
            paymentOnDay: 25,
            issueDate: '25.10.2016',
            scheduleType: this.loanSchedule.BUBBLE_SCHEDULE
        }).overAllInterest, '5747.13');
        test.done();
    }
};


function printSchedule(schedule) {
    console.log('Payment = {' + schedule.minPaymentAmount + ', ' + schedule.maxPaymentAmount + '}, Term = ' + schedule.term);
    console.log('OverallInterest = ' + schedule.overAllInterest + ' , EfficientRate = ' + schedule.efficientRate);
    schedule.payments.map(pay =>
        console.log(pay.paymentDate + '\t|\t\t'
            + pay.initialBalance + '\t|\t\t'
            + pay.paymentAmount + '\t|\t\t'
            + pay.principalAmount + '\t|\t\t'
            + pay.interestAmount + '\t|\t\t'
            + pay.finalBalance
        ));
}
