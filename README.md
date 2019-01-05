# Library for loan amortization schedule manipulation


[![status](https://api.travis-ci.org/timmson/loan-schedule.js.svg?branch=master)](https://travis-ci.org/timmson/loan-schedule.js)
[![codecov](https://codecov.io/gh/timmson/loan-schedule.js/branch/master/graph/badge.svg)](https://codecov.io/gh/timmson/loan-schedule.js)
[![codacy](https://api.codacy.com/project/badge/Grade/a67746d04fb245e58817f2e3959d9501)](https://www.codacy.com/app/timmson666/loan-schedule.js)
[![version](https://img.shields.io/npm/v/loan-schedule.js.svg)](https://www.npmjs.com/package/loan-schedule.js)
[![license](https://img.shields.io/npm/l/loan-schedule.js.svg)](https://www.npmjs.com/package/loan-schedule.js)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftimmson%2Floan-schedule.js.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ftimmson%2Floan-schedule.js?ref=badge_shield)

[..::Live demo::..](https://timmson.github.io/loan-schedule/)

## Install
```sh
npm i loan-schedule.js
```

## Init
```js
let LoanSchedule = require('loan-schedule.js');

let loanSchedule = new LoanSchedule({});
```

## Init with options
```js
let LoanSchedule = require('loan-schedule.js');

let loanSchedule = new LoanSchedule({
    decimalDigit : 2,
    dateFormat: 'DD.MM.YYYY',
    prodCalendar: "ru"
});
```

## Interest by period
```js
let interest = loanSchedule.calculateInterestByPeriod({
                   from: '10.12.2015', 
                   to: '10.01.2016', 
                   amount: 1000, 
                   rate: 16.7
});
console.log(interest);
```

## Payment
```js
let payment = loanSchedule.calculateAnnuityPaymentAmount({
                  amount: 110000, 
                  term: 60, 
                  rate: 12.9
});
console.log(payment);
```

## Max Loan Amount
```js
let loanAmount = loanSchedule.calculateMaxLoanAmount({
                  paymentAmount: 2497.21,
                  term: 60,
                  rate: 12.9
});
console.log(loanAmount);
```

## Annuity loan schedule (payment amount will be calculated)
```js
let schedule = loanSchedule.calculateSchedule({
                   amount: 50000,
                   rate: 11.5,
                   term: 12,
                   paymentOnDay: 25,
                   issueDate: '25.10.2016',
                   scheduleType : loanSchedule.ANNUITY_SCHEDULE
}).payments.forEach(function (pay) {
    console.log(pay.paymentDate + '\t|\t\t'
     + pay.initialBalance + '\t|\t\t'
     + pay.paymentAmount + '\t|\t\t'
     + pay.principalAmount + '\t|\t\t'
     + pay.interestAmount + '\t|\t\t'
     + pay.finalBalance
     );
});
```

## Annuity loan schedule (payment amount is set)
```js
let schedule = loanSchedule.calculateSchedule({
                   amount: 50000,
                   rate: 11.5,
                   term: 12,
                   paymentAmount: 40000,
                   paymentOnDay: 25,
                   issueDate: '25.10.2016',
                   scheduleType : loanSchedule.ANNUITY_SCHEDULE
}).payments.forEach(function (pay) {
    console.log(pay.paymentDate + '\t|\t\t'
     + pay.initialBalance + '\t|\t\t'
     + pay.paymentAmount + '\t|\t\t'
     + pay.principalAmount + '\t|\t\t'
     + pay.interestAmount + '\t|\t\t'
     + pay.finalBalance
     );
});
```

## Differentiated loan schedule
```js
let schedule = loanSchedule.calculateSchedule({
                   amount: 50000,
                   rate: 11.5,
                   term: 12,
                   paymentOnDay: 25,
                   issueDate: '25.10.2016',
                   scheduleType : loanSchedule.DIFFERENTIATED_SCHEDULE
}).payments.forEach(function (pay) {
    console.log(pay.paymentDate + '\t|\t\t'
     + pay.initialBalance + '\t|\t\t'
     + pay.paymentAmount + '\t|\t\t'
     + pay.principalAmount + '\t|\t\t'
     + pay.interestAmount + '\t|\t\t'
     + pay.finalBalance
     );
});
```

## Bubble loan schedule
```js
let schedule = loanSchedule.calculateSchedule({
                   amount: 50000,
                   rate: 11.5,
                   term: 12,
                   paymentOnDay: 25,
                   issueDate: '25.10.2016',
                   scheduleType : loanSchedule.BUUBLE_SCHEDULE
}).payments.forEach(function (pay) {
    console.log(pay.paymentDate + '\t|\t\t'
     + pay.initialBalance + '\t|\t\t'
     + pay.paymentAmount + '\t|\t\t'
     + pay.principalAmount + '\t|\t\t'
     + pay.interestAmount + '\t|\t\t'
     + pay.finalBalance
     );
});
```

If you have any questions, you could send their via email: [timmson666@mail.ru](mailto:timmson666@mail.ru?subjet=loan-schedule.js)