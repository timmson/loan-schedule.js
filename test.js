"use strict";
const assert =  require('assert');
var LoanSchedule = require('./index.js');
var Moment = require("moment");

var loanSchedule = new LoanSchedule({
    amount : 110000,
    rate : 12,
    term : 60
});

/*assert.equal(loanSchedule.calculateAnnuityPaymentAmount(), '9773.37');
assert.equal(loanSchedule.calculateInterestByPeriod('10.12.2015' , '10.01.2016', 1000), '10.18');
assert.equal(loanSchedule.calculateInterestByPeriod('10.11.2015' , '10.12.2015', 1000), '9.86');*/
loanSchedule.calculateAnnuitySchedule().forEach(function (pay) {
    console.log(pay.paymentDate + '\t|\t\t'
        + pay.initialBalance + '\t|\t\t'
        + pay.paymentAmount + '\t|\t\t'
        + pay.principalAmount + '\t|\t\t'
        + pay.interestAmount + '\t|\t\t'
        + pay.finalBalance
    );
});
