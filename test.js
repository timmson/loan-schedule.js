"use strict";
const assert = require('assert');
var LoanSchedule = require('./index.js');
var Decimal = require("decimal.js");

var loanSchedule = new LoanSchedule({
    decimalDigit : 2,
    dateFormat: 'DD.MM.YYYY'

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

var interestSum = new Decimal(0);
loanSchedule.calculateAnnuitySchedule({
    amount: 50000,
    rate: 11.5,
    term: 12,
    paymentOnDay: 25,
    issueDate: '25.10.2016'
}).payments.forEach(function (pay) {
    interestSum = interestSum.plus(pay.interestAmount);
/*    console.log(pay.paymentDate + '\t|\t\t'
     + pay.initialBalance + '\t|\t\t'
     + pay.paymentAmount + '\t|\t\t'
     + pay.principalAmount + '\t|\t\t'
     + pay.interestAmount + '\t|\t\t'
     + pay.finalBalance
     );*/
});
assert.equal(interestSum.toFixed(2), '3165.39');

console.log('Test - ok');
