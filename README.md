Library for loan amortization schedule manipulation [under development]
=======================================================================

If you have any questions, send their via email: [timmson666@mail.ru](mailto:timmson666@mail.ru?subjet=node-lgtv-api)

## How to install
```sh
npm install loan-schedule.js
```

## How to init
```js
var LoanSchedule = require('loan-schedule.js');

var loanSchedule = new LoanSchedule({
    amount : 110000,
    rate : 12,
    term : 60
});
```