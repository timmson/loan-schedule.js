"use strict";
const assert = require('assert');
var LoanSchedule = require('./index.js');

var loanSchedule = new LoanSchedule({
    decimalDigit : 2,
    //dateFormat: 'DD.MM.YYYY'

});

assert.equal(loanSchedule.calculateAnnuityPaymentAmount({
    amount: 110000,
    term: 60,
    rate: 12.9
}), '2497.21');

assert.equal(loanSchedule.calculateInterestByPeriod({
    from: '10.12.2015',
    to: '10.01.2016',
    amount: 1000,
    rate: 16.7
}), '14.17');

assert.equal(loanSchedule.calculateInterestByPeriod({
    from: '10.11.2015',
    to: '10.12.2015',
    amount: 1000,
    rate: 16.8
}), '13.81');

assert.equal(loanSchedule.calculateSchedule({
    amount: 50000,
    rate: 11.5,
    term: 12,
    paymentOnDay: 25,
    issueDate: '25.10.2016',
    scheduleType : loanSchedule.ANNUITY_SCHEDULE
}).overAllInterest, '3165.39');

assert.equal(loanSchedule.calculateSchedule({
    amount: 50000,
    rate: 11.5,
    term: 12,
    paymentOnDay: 25,
    issueDate: '25.10.2016',
    scheduleType : loanSchedule.DIFFERENTIATED_SCHEDULE
}).overAllInterest, '3111.18');


assert.equal(loanSchedule.calculateSchedule({
    amount: 50000,
    rate: 11.5,
    term: 12,
    paymentOnDay: 25,
    issueDate: '25.10.2016',
    scheduleType : loanSchedule.BUBBLE_SCHEDULE
}).overAllInterest, '5747.13');
console.log('Test - ok');
