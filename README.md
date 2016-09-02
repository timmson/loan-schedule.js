Library for loan amortization schedule manipulation [under development]
=======================================================================

If you have any questions, send their via email: [timmson666@mail.ru](mailto:timmson666@mail.ru?subjet=node-lgtv-api)

## How to install
```sh
npm install loan-schedule.js
```

## How to init (date and currency options will be available soon)
```js
var LoanSchedule = require('loan-schedule.js');

var loanSchedule = new LoanSchedule();
```

## Interest by period
```js
var interest = loanSchedule.calculateInterestByPeriod('10.12.2015'/*startDate*/, '10.01.2016'/*endDate*/, 1000/*amount*/, 16.7/*interest rate*/);
```

## Payment
```js
var payment = loanSchedule.calculateAnnuityPaymentAmount(110000.00/*amount*/, 60/*term in month*/, 12/*interest rate*/);
```

## Annuity loan schedule
```js
var schedule = loanSchedule.calculateAnnuityPaymentAmount(110000.00/*amount*/, 60/*term in month*/, 12/*interest rate*/);
```