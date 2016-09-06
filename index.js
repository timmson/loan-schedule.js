"use strict";
var Decimal = require("decimal.js");
var Moment = require("moment");

module.exports = LoanSchedule;

function LoanSchedule(options) {
    this.decimal = options.decimalDigit || 2;
    this.dateFormat = options.dateFormat || 'DD.MM.YYYY';
}

LoanSchedule.prototype.calculateSchedule = function (p) {
    var schedule = {};
    if (p.scheduleType === this.ANNUITY_SCHEDULE) {
        p.paymentAmount = p.paymentAmount || this.calculateAnnuityPaymentAmount({amount: p.amount, term: p.term, rate: p.rate});
        schedule.payments = this.calculateAnnuitySchedule(p);

    }
    if (p.scheduleType === this.DIFFERENTIATED_SCHEDULE) {
        schedule.payments = this.calculateDifferentiatedSchedule(p);
    }
    if (p.scheduleType === this.BUBBLE_SCHEDULE) {
        schedule.payments = this.calculateBubbleSchedule(p);
    }

    var paymentLastIndex = schedule.payments.length - 1;
    var firstPayment = schedule.payments[1].paymentAmount;
    var lastPayment = schedule.payments[paymentLastIndex].paymentAmount;
    schedule.minPaymentAmount = Decimal.min(firstPayment, lastPayment).toFixed(this.decimal);
    schedule.maxPaymentAmount = Decimal.max(firstPayment, lastPayment).toFixed(this.decimal);

    var dateStart = Moment(schedule.payments[0].paymentDate, this.dateFormat).date(1);
    var dateEnd = Moment(schedule.payments[paymentLastIndex].paymentDate, this.dateFormat).date(1);
    schedule.term = Math.round(Moment.duration(dateEnd.diff(dateStart)).asMonths());

    schedule.amount = new Decimal(p.amount).toFixed(this.decimal);
    schedule.overAllInterest = new Decimal(0);
    schedule.payments.map(pay => {
        var overAllInterest = new Decimal(schedule.overAllInterest).plus(pay.interestAmount);
        schedule.overAllInterest = overAllInterest.toFixed(this.decimal);
    });

    schedule.efficientRate = new Decimal(schedule.overAllInterest).div(schedule.amount).mul(100).toFixed(this.decimal);
    schedule.fullAmount = new Decimal(schedule.overAllInterest).add(schedule.amount).toFixed(this.decimal);
    return schedule;
};

LoanSchedule.prototype.calculateAnnuitySchedule = function (p) {
    var date = Moment(p.issueDate, this.dateFormat);
    var term = new Decimal(p.term);
    var amount = new Decimal(p.amount);
    var rate = new Decimal(p.rate);
    var interestAccruedAmount = new Decimal(0);
    var paymentAmount = new Decimal(p.paymentAmount);

    var payments = [this.getInitialPayment(amount, date, rate)];
    var i = 1;
    while (i <= term.toNumber() && new Decimal(payments[i - 1].finalBalance).gt(0)) {
        var pay = {};

        date = date.add(1, 'months').date(p.paymentOnDay);
        pay.paymentDate = date.format(this.dateFormat);
        pay.initialBalance = payments[i - 1].finalBalance;
        pay.interestRate = rate.toFixed(this.decimal);
        interestAccruedAmount = interestAccruedAmount.plus(
            this.calculateInterestByPeriod({from: payments[i - 1].paymentDate, to: pay.paymentDate, amount: pay.initialBalance, rate: pay.interestRate})
        );
        if (i != term.toNumber() && paymentAmount.lt(pay.initialBalance)) {
            if (interestAccruedAmount.gt(paymentAmount)) {
                pay.interestAmount = paymentAmount.toFixed(this.decimal);
                interestAccruedAmount = interestAccruedAmount.minus(paymentAmount);
            } else {
                pay.interestAmount = interestAccruedAmount.toFixed(this.decimal);
                interestAccruedAmount = Decimal(0);
            }
            pay.principalAmount = paymentAmount.minus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
            pay.paymentAmount = paymentAmount.toFixed(this.decimal);
        } else {
            pay.interestAmount = interestAccruedAmount.toFixed(this.decimal);
            pay.principalAmount = pay.initialBalance;
            pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
        }
        pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.decimal);

        payments.push(pay);
        i++;
    }
    return payments;

};

LoanSchedule.prototype.calculateDifferentiatedSchedule = function (p) {
    var payments = [];
    var date = Moment(p.issueDate, this.dateFormat);
    var term = new Decimal(p.term);
    var amount = new Decimal(p.amount);
    var rate = new Decimal(p.rate);
    var principalAmount = amount.div(term);

    var payments = [this.getInitialPayment(amount, date, rate)];
    var i = 1;
    while (i <= term.toNumber()) {
        var pay = {};

        date = date.add(1, 'months').date(p.paymentOnDay);
        pay.paymentDate = date.format(this.dateFormat);
        pay.initialBalance = payments[i - 1].finalBalance;
        pay.interestRate = rate.toFixed(this.decimal);
        pay.principalAmount = i == term.toNumber() ? pay.initialBalance : principalAmount.toFixed(this.decimal);
        pay.interestAmount = new Decimal(
            this.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            })
        ).toFixed(this.decimal);
        pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
        pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.decimal);

        payments.push(pay);
        i++;
    }
    return payments;

};

LoanSchedule.prototype.calculateBubbleSchedule = function (p) {
    var payments = [];
    var date = Moment(p.issueDate, this.dateFormat);
    var term = new Decimal(p.term);
    var amount = new Decimal(p.amount);
    var rate = new Decimal(p.rate);

    var payments = [this.getInitialPayment(amount, date, rate)];
    var i = 1;
    while (i <= term.toNumber()) {
        var pay = {};

        date = date.add(1, 'months').date(p.paymentOnDay);
        pay.paymentDate = date.format(this.dateFormat);
        pay.initialBalance = payments[i - 1].finalBalance;
        pay.interestRate = rate.toFixed(this.decimal);
        pay.principalAmount = i == term.toNumber() ? pay.initialBalance : new Decimal(0).toFixed(this.decimal);
        pay.interestAmount = new Decimal(
            this.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            })
        ).toFixed(this.decimal);
        pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.decimal);
        pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.decimal);

        payments.push(pay);
        i++;
    }
    return payments;

};

LoanSchedule.prototype.calculateMaxLoanAmount = function (p) {
    var term = new Decimal(p.term);
    var interestRate = new Decimal(p.rate).div(100).div(12);
    var paymentAmount = new Decimal(p.paymentAmount);
    var amount = paymentAmount.div(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
    return amount.toFixed(this.decimal);
};

LoanSchedule.prototype.calculateAnnuityPaymentAmount = function (p) {
    var term = new Decimal(p.term);
    var interestRate = new Decimal(p.rate).div(100).div(12);
    var paymentAmount = new Decimal(p.amount).mul(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
    return paymentAmount.toFixed(this.decimal);
};

LoanSchedule.prototype.calculateInterestByPeriod = function (p) {
    var curIntr = new Decimal(0);
    var dateFrom = Moment(p.from, this.dateFormat);
    var dateTo = Moment(p.to, this.dateFormat);
    if (dateFrom.isSame(dateTo, 'year')) {
        curIntr = curIntr.plus(getInterestByPeriod({from: dateFrom, to: dateTo, amount: p.amount, rate: p.rate}));
    } else {
        var endOfYear = Moment({years: dateFrom.year(), months: 11, days: 31});
        curIntr = curIntr.plus(getInterestByPeriod({from: dateFrom, to: endOfYear, amount: p.amount, rate: p.rate}));
        curIntr = curIntr.plus(getInterestByPeriod({from: endOfYear, to: dateTo, amount: p.amount, rate: p.rate}));
    }
    return curIntr.toFixed(this.decimal);
};

LoanSchedule.prototype.getInitialPayment = function (amount, date, rate) {
    return {
        paymentDate: date.format(this.dateFormat),
        initialBalance: new Decimal(0).toFixed(this.decimal),
        paymentAmount: new Decimal(0).toFixed(this.decimal),
        interestAmount: new Decimal(0).toFixed(this.decimal),
        principalAmount: new Decimal(0).toFixed(this.decimal),
        finalBalance: new Decimal(amount).toFixed(this.decimal),
        interestRate: rate.toFixed(this.decimal)
    };
};

LoanSchedule.prototype.ANNUITY_SCHEDULE = 'ANNUITY';
LoanSchedule.prototype.DIFFERENTIATED_SCHEDULE = 'DIFFERENTIATED';
LoanSchedule.prototype.BUBBLE_SCHEDULE = 'BUBBLE';

function getInterestByPeriod(p) {
    return new Decimal(p.rate).div(100).div(p.to.year() % 4 == 0 ? 366 : 365).mul(Moment.duration(p.to.diff(p.from)).asDays()).mul(p.amount);
}

