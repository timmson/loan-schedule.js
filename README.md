Library for loan amortization schedule manipulation [under development]
=======================================================================

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

## Annuity loan schedule
```js
var schedule = loanSchedule.calculateAnnuitySchedule({
                   amount: 50000,
                   rate: 11.5,
                   term: 12,
                   paymentOnDay: 25,
                   issueDate: '25.10.2016'
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