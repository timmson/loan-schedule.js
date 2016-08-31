"use strict";
var Decimal = require("decimal.js");
var Moment = require("moment");
var Accounting = require("accounting");

module.exports = LoanSchedule;

function LoanSchedule(options) {

    this.fullAmount = new Decimal(options.amount);
    this.interestRatePerYear = new Decimal(options.rate).div(100);
    this.interestRatePeriod = 12; // 1/12
    this.issueDate = options.issueDate;
    this.term = new Decimal(options.term);

    this.money = {
        decimal: 2,
        symbol: 'руб.',
        format: '%v %s',
        thousand: ' '
    };

    this.date = {
        format: 'DD.MM.YYYY'
    }

}

LoanSchedule.prototype.calculateAnnuityPaymentAmount = function () {
    var termInPeriod = this.term;
    var ratePerPeriod = this.interestRatePerYear.div(this.interestRatePeriod);
    var paymentAmount = this.fullAmount.mul(ratePerPeriod.div(ratePerPeriod.add(1).pow(termInPeriod.neg()).neg().add(1)));
    return Decimal(paymentAmount).toFixed(this.money.decimal);
};

LoanSchedule.prototype.calculateInterestByPeriod = function (dateFrom, dateTo, balanceStr) {
    var curIntr = new Decimal(0);
    var dtFr = Moment(dateFrom, this.date.format);
    var dtTo = Moment(dateTo, this.date.format);
    var balance = new Decimal(balanceStr);
    if (dtFr.year() == dtTo.year()) {
        curIntr = curIntr.add(this.getInterestByPeriod(dtFr, dtTo, balance));
    } else {
        curIntr = curIntr.add(this.getInterestByPeriod(dtFr, dtFr.endOf("year"), balance))
        curIntr = curIntr.add(this.getInterestByPeriod(dtFr.endOf("year"), dtTo, balance));
    }
    return curIntr.toFixed(2);
};

LoanSchedule.prototype.getInterestByPeriod = function (dateFrom, dateTo, balance) {
    return this.interestRatePerYear.div(dateTo.year() % 4 == 0 ? 366 : 365).mul(Moment.duration(dateTo.diff(dateFrom)).asDays()).mul(balance);
};

//accounting.formatMoney(number, {symbol: 'руб.', format: '%v %s', thousand: ' '})