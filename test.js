"use strict";
const assert =  require('assert');
var LoanSchedule = require('./index.js');

var loanSchedule = new LoanSchedule({
    amount : 110000,
    rate : 12,
    term : 60
});

assert.equal(loanSchedule.calculateAnnuityPaymentAmount(), '2446.89');
assert.equal(loanSchedule.calculateInterestByPeriod('10.10.2015' , '10.11.2015', 1000), '10.19');
