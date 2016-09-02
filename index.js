"use strict";
var Decimal = require("decimal.js");
var Moment = require("moment");
var Accounting = require("accounting");

module.exports = LoanSchedule;

function LoanSchedule(options) {

    this.money = {
        decimal: options.decimalDigit != null ? options.decimalDigit : 2,
        symbol: options.currency != null ? options.currency : 'rub.',
        format: options.moneyFormat != null ? options.moneyFormat : '%v %s',
        thousand: options.decimalGroup != null ? options.decimalGroup : ' '
    };

    this.date = {
        format: options.dateFormat != null ? options.dateFormat : 'DD.MM.YYYY'
    };


}

LoanSchedule.prototype.calculateSchedule = function (p) {
    if (p.scheduleType === this.ANNUITY_SCHEDULE) {
        return this.calculateAnnuitySchedule(p);
    }
    if (p.scheduleType === this.DIFFERENTIATED_SCHEDULE) {
        return this.calculateDifferentiatedSchedule(p);
    }
    if (p.scheduleType === this.BUBBLE_SCHEDULE) {
        return this.calculateBubbleSchedule(p);
    }
};

LoanSchedule.prototype.calculateAnnuitySchedule = function (p) {
    var schedule = {
        payments: []
    };
    var date = Moment(p.issueDate, this.date.format);
    var term = new Decimal(p.term);
    var amount = new Decimal(p.amount);
    var rate = new Decimal(p.rate);
    var interestAccruedAmount = new Decimal(0);
    var paymentAmount = new Decimal(this.calculateAnnuityPaymentAmount({amount: p.amount, term: p.term, rate: p.rate}));
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
            date = date.add(1, 'months').date(p.paymentOnDay);
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = schedule.payments[i - 1].finalBalance;
            interestAccruedAmount = interestAccruedAmount.plus(
                this.calculateInterestByPeriod({from: schedule.payments[i - 1].paymentDate, to: pay.paymentDate, amount: pay.initialBalance, rate: pay.interestRate})
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

};

LoanSchedule.prototype.calculateDifferentiatedSchedule = function (p) {
    var schedule = {
        payments: []
    };
    var date = Moment(p.issueDate, this.date.format);
    var term = new Decimal(p.term);
    var amount = new Decimal(p.amount);
    var rate = new Decimal(p.rate);
    var principalAmount = amount.div(term);
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
            date = date.add(1, 'months').date(p.paymentOnDay);
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = schedule.payments[i - 1].finalBalance;
            pay.principalAmount = i == term.toNumber() ? pay.initialBalance : principalAmount.toFixed(this.money.decimal);
            pay.interestAmount = new Decimal(
                this.calculateInterestByPeriod({
                    from: schedule.payments[i - 1].paymentDate,
                    to: pay.paymentDate,
                    amount: pay.initialBalance,
                    rate: pay.interestRate
                })
            ).toFixed(this.money.decimal);
            pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.money.decimal);
            pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.money.decimal);
        }

        schedule.payments.push(pay);
        i++;
    }
    return schedule;

};

LoanSchedule.prototype.calculateBubbleSchedule = function (p) {
    var schedule = {
        payments: []
    };
    var date = Moment(p.issueDate, this.date.format);
    var term = new Decimal(p.term);
    var amount = new Decimal(p.amount);
    var rate = new Decimal(p.rate);
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
            date = date.add(1, 'months').date(p.paymentOnDay);
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = schedule.payments[i - 1].finalBalance;
            pay.principalAmount = i == term.toNumber() ? pay.initialBalance : new Decimal(0).toFixed(this.money.decimal);
            pay.interestAmount = new Decimal(
                this.calculateInterestByPeriod({
                    from: schedule.payments[i - 1].paymentDate,
                    to: pay.paymentDate,
                    amount: pay.initialBalance,
                    rate: pay.interestRate
                })
            ).toFixed(this.money.decimal);
            pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.money.decimal);
            pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.money.decimal);
        }

        schedule.payments.push(pay);
        i++;
    }
    return schedule;

};

LoanSchedule.prototype.calculateAnnuityPaymentAmount = function (p) {
    var term = new Decimal(p.term);
    var interestRate = new Decimal(p.rate).div(100).div(12);
    var paymentAmount = new Decimal(p.amount).mul(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
    return paymentAmount.toFixed(this.money.decimal);
};

LoanSchedule.prototype.calculateInterestByPeriod = function (p) {
    var curIntr = new Decimal(0);
    var dateFrom = Moment(p.from, this.date.format);
    var dateTo = Moment(p.to, this.date.format);
    if (dateFrom.isSame(dateTo, 'year')) {
        curIntr = curIntr.plus(getInterestByPeriod({from: dateFrom, to: dateTo, amount: p.amount, rate: p.rate}));
    } else {
        var endOfYear = Moment({years: dateFrom.year(), months: 11, days: 31});
        curIntr = curIntr.plus(getInterestByPeriod({from: dateFrom, to: endOfYear, amount: p.amount, rate: p.rate}));
        curIntr = curIntr.plus(getInterestByPeriod({from: endOfYear, to: dateTo, amount: p.amount, rate: p.rate}));
    }
    return curIntr.toFixed(this.money.decimal);
};

LoanSchedule.prototype.ANNUITY_SCHEDULE = 'ANNUITY';
LoanSchedule.prototype.DIFFERENTIATED_SCHEDULE = 'DIFFERENTIATED';
LoanSchedule.prototype.BUBBLE_SCHEDULE = 'BUBBLE';

function getInterestByPeriod(p) {
    return new Decimal(p.rate).div(100).div(p.to.year() % 4 == 0 ? 366 : 365).mul(Moment.duration(p.to.diff(p.from)).asDays()).mul(p.amount);
}

//accounting.formatMoney(number, {symbol: 'руб.', format: '%v %s', thousand: ' '})