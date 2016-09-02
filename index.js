"use strict";
var Decimal = require("decimal.js");
var Moment = require("moment");
var Accounting = require("accounting");

module.exports = LoanSchedule;

function LoanSchedule(options) {

    this.money = {
        decimal: 2,
        symbol: 'руб.',
        format: '%v %s',
        thousand: ' '
    };

    this.date = {
        format: 'DD.MM.YYYY'
    };
}

LoanSchedule.prototype.calculateAnnuitySchedule = function (options) {
    var schedule = {
        payments: []
    };
    var date = Moment(options.issueDate, this.date.format);
    var term = new Decimal(options.term);
    var amount = new Decimal(options.amount);
    var rate = new Decimal(options.rate);
    var interestAccruedAmount = new Decimal(0);
    var paymentAmount = new Decimal(this.calculateAnnuityPaymentAmount(options.amount, options.term, options.rate));
    var i = 0;

    while (i <= term.toNumber()) {

        var pay = {
            interestRate: rate.toFixed(this.money.decimal)
        };

        if (i == 0) {
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = new Decimal(0).toFixed(this.money.decimal);
            pay.paymentAmount = new Decimal(0).toFixed(this.money.decimal);
            pay.interestAmount = new Decimal(0).toFixed(this.money.decimal);
            pay.principalAmount = new Decimal(0).toFixed(this.money.decimal);
            pay.finalBalance = new Decimal(amount).toFixed(this.money.decimal);
        } else {
            date = date.add(1, 'months').date(options.paymentOnDay);
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = schedule.payments[i - 1].finalBalance;
            interestAccruedAmount = interestAccruedAmount.plus(
                this.calculateInterestByPeriod(schedule.payments[i - 1].paymentDate, pay.paymentDate, pay.initialBalance, pay.interestRate)
            );
            if (i != term.toNumber()) {
                if (interestAccruedAmount.gt(paymentAmount)) {
                    pay.interestAmount = paymentAmount.toFixed(this.money.decimal);
                    interestAccruedAmount = interestAccruedAmount.minus(paymentAmount);
                } else {
                    pay.interestAmount = interestAccruedAmount.toFixed(this.money.decimal);
                    interestAccruedAmount = Decimal(0);
                }
                pay.principalAmount = paymentAmount.minus(new Decimal(pay.interestAmount)).toFixed(this.money.decimal);
                pay.paymentAmount = paymentAmount.toFixed(this.money.decimal);
            } else {
                pay.interestAmount = interestAccruedAmount.toFixed(this.money.decimal);
                pay.principalAmount = pay.initialBalance;
                pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.money.decimal);
            }
            pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.money.decimal);
        }

        schedule.payments.push(pay);
        i++;
    }
    return schedule;

}
;

LoanSchedule.prototype.calculateAnnuityPaymentAmount = function (amount, term, rate) {
    var term = new Decimal(term);
    var interestRate = new Decimal(rate).div(100).div(12);
    var paymentAmount = new Decimal(amount).mul(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
    return paymentAmount.toFixed(this.money.decimal);
};

LoanSchedule.prototype.calculateInterestByPeriod = function (dateFrom, dateTo, balance, rate) {
    var curIntr = new Decimal(0);
    var dtFr = Moment(dateFrom, this.date.format);
    var dtTo = Moment(dateTo, this.date.format);
    if (dtFr.isSame(dtTo, 'year')) {
        curIntr = curIntr.plus(this.getInterestByPeriod(dtFr, dtTo, balance, rate));
    } else {
        var endOfYear = Moment({years: dtFr.year(), months: 11, days: 31});
        curIntr = curIntr.plus(new Decimal(this.getInterestByPeriod(dtFr, endOfYear, balance, rate)));
        curIntr = curIntr.plus(new Decimal(this.getInterestByPeriod(endOfYear, dtTo, balance, rate)));
    }
    return curIntr.toFixed(this.money.decimal);
};

LoanSchedule.prototype.getInterestByPeriod = function (dateFrom, dateTo, balance, rate) {
    return new Decimal(rate).div(100).div(dateTo.year() % 4 == 0 ? 366 : 365).mul(Moment.duration(dateTo.diff(dateFrom)).asDays()).mul(balance).toFixed(this.money.decimal);
};

//accounting.formatMoney(number, {symbol: 'руб.', format: '%v %s', thousand: ' '})