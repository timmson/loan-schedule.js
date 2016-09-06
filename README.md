Library for loan amortization schedule manipulation [beta]
==========================================================

If you have any questions, send their via email: [timmson666@mail.ru](mailto:timmson666@mail.ru?subjet=node-lgtv-api)

## Install
```sh
npm install loan-schedule.js
```

## Init
```js
var LoanSchedule = require('loan-schedule.js');

var loanSchedule = new LoanSchedule({});
```

## Init with options
```js
var LoanSchedule = require('loan-schedule.js');

var loanSchedule = new LoanSchedule({
    decimalDigit : 2,
    dateFormat: 'DD.MM.YYYY'

});
```

## Interest by period
```js
var interest = loanSchedule.calculateInterestByPeriod({
                   from: '10.12.2015', 
                   to: '10.01.2016', 
                   amount: 1000, 
                   rate: 16.7
});
console.log(interest);
```

## Payment
```js
var payment = loanSchedule.calculateAnnuityPaymentAmount({
                  amount: 110000, 
                  term: 60, 
                  rate: 12.9
});
console.log(payment);
```

## Max Loan Amount
```js
var loanAmount = loanSchedule.calculateMaxLoanAmount({
                  paymentAmount: 2497.21,
                  term: 60,
                  rate: 12.9
});
console.log(loanAmount);
```

## Annuity loan schedule (payment amount will be calculated)
```js
var schedule = loanSchedule.calculateSchedule({
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
var schedule = loanSchedule.calculateSchedule({
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
var schedule = loanSchedule.calculateSchedule({
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
var schedule = loanSchedule.calculateSchedule({
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

More demos on http://timmson.github.io