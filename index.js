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
    }


    this.fullAmount = new Decimal(options.amount);
    this.interestRatePerYear = new Decimal(options.rate).div(100);
    this.interestRatePeriod = 12; // 1/12
    this.issueDate = options.issueDate;
    this.term = new Decimal(options.term);


}
LoanSchedule.prototype.calculateAnnuitySchedule = function () {
    var paymentArray = [];
    var paymentAmount = new Decimal(this.calculateAnnuityPaymentAmount());
    var date = Moment();
    for (var i = 0; i <= this.term.toNumber(); i++) {
        var pay = {};
        if (i == 0) {
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = new Decimal(0).toFixed(this.money.decimal);
            pay.paymentAmount = new Decimal(0).toFixed(this.money.decimal);
            pay.interestAmount = new Decimal(0).toFixed(this.money.decimal);
            pay.principalAmount = new Decimal(0).toFixed(this.money.decimal);
            pay.finalBalance = this.fullAmount.toFixed(this.money.decimal);
        } else if (i != this.term.toNumber()) {
            date = date.add(1, 'months');
            pay.paymentDate = date.format(this.date.format);
            pay.initialBalance = paymentArray[i - 1].finalBalance;
            pay.interestAmount = this.calculateInterestByPeriod(paymentArray[i - 1].paymentDate, pay.paymentDate, pay.initialBalance);
            pay.principalAmount = paymentAmount.minus(new Decimal(pay.interestAmount)).toFixed(this.money.decimal);
            pay.paymentAmount = paymentAmount.toFixed(this.money.decimal);
            pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.money.decimal);
        } else {
            var lastDate = date.add(1, 'months');
            pay.paymentDate = lastDate.format(this.date.format)
            pay.initialBalance = paymentArray[i - 1].finalBalance;
            pay.interestAmount = this.calculateInterestByPeriod(paymentArray[i - 1].paymentDate, pay.paymentDate, pay.initialBalance);
            pay.principalAmount = pay.initialBalance;
            pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(this.money.decimal);
            pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(this.money.decimal);
        }
        paymentArray.push(pay);
    }
    return paymentArray;

};

LoanSchedule.prototype.calculateAnnuityPaymentAmount = function () {
    var termInPeriod = this.term;
    var ratePerPeriod = this.interestRatePerYear.div(this.interestRatePeriod);
    var paymentAmount = this.fullAmount.mul(ratePerPeriod.div(ratePerPeriod.plus(1).pow(termInPeriod.neg()).neg().plus(1)));
    return paymentAmount.toFixed(this.money.decimal);
};

LoanSchedule.prototype.calculateInterestByPeriod = function (dateFrom, dateTo, balanceStr) {
    var curIntr = new Decimal(0);
    var dtFr = Moment(dateFrom, this.date.format);
    var dtTo = Moment(dateTo, this.date.format);
    var balance = new Decimal(balanceStr);
    if (dtFr.isSame(dtTo, 'year')) {
        curIntr = curIntr.plus(this.getInterestByPeriod(dtFr, dtTo, balance));
    } else {
        var endOfYear = Moment({years: dtFr.year(), months: 11, days: 31});
        curIntr = curIntr.plus(new Decimal(this.getInterestByPeriod(dtFr, endOfYear, balance)));
        curIntr = curIntr.plus(new Decimal(this.getInterestByPeriod(endOfYear, dtTo, balance)));
    }
    return curIntr.toFixed(this.money.decimal);
};

LoanSchedule.prototype.getInterestByPeriod = function (dateFrom, dateTo, balance) {
    return this.interestRatePerYear.div(dateTo.year() % 4 == 0 ? 366 : 365).mul(Moment.duration(dateTo.diff(dateFrom)).asDays()).mul(balance);
};

//accounting.formatMoney(number, {symbol: 'руб.', format: '%v %s', thousand: ' '})