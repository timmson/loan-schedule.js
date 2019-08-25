"use strict";
const Decimal = require("decimal.js");
const moment = require("moment");
const ProdCal = require("prod-cal").default;

let that = null;

function LoanSchedule(options) {
    that = this;
    that.decimal = 2;
    that.dateFormat = "DD.MM.YYYY";
    that.prodCalendar = null;

    if (options) {
        that.decimal = options.decimalDigit || that.decimal;
        that.dateFormat = options.dateFormat || that.dateFormat;
        that.prodCalendar = new ProdCal(options.prodCalendar);
    }
}

LoanSchedule.prototype.calculateSchedule = function (p) {
    let schedule = {};
    if (p.scheduleType === that.ANNUITY_SCHEDULE) {
        schedule.payments = that.calculateAnnuitySchedule(p);
    }
    if (p.scheduleType === that.DIFFERENTIATED_SCHEDULE) {
        schedule.payments = that.calculateDifferentiatedSchedule(p);
    }
    if (p.scheduleType === that.BUBBLE_SCHEDULE) {
        schedule.payments = that.calculateBubbleSchedule(p);
    }

    let paymentLastIndex = schedule.payments.length - 1;
    let firstPayment = schedule.payments[1].paymentAmount;
    let lastPayment = schedule.payments[paymentLastIndex].paymentAmount;
    schedule.minPaymentAmount = Decimal.min(firstPayment, lastPayment).toFixed(that.decimal);
    schedule.maxPaymentAmount = Decimal.max(firstPayment, lastPayment).toFixed(that.decimal);

    let dateStart = moment(schedule.payments[0].paymentDate, that.dateFormat).date(1);
    let dateEnd = moment(schedule.payments[paymentLastIndex].paymentDate, that.dateFormat).date(1);
    schedule.term = Math.round(moment.duration(dateEnd.diff(dateStart)).asMonths());

    schedule.amount = new Decimal(p.amount).toFixed(that.decimal);
    schedule.overAllInterest = new Decimal(0);
    schedule.payments.map(pay => {
        let overAllInterest = new Decimal(schedule.overAllInterest).plus(pay.interestAmount);
        schedule.overAllInterest = overAllInterest.toFixed(that.decimal);
    });

    schedule.efficientRate = new Decimal(schedule.overAllInterest).div(schedule.amount).mul(100).toFixed(that.decimal);
    schedule.fullAmount = new Decimal(schedule.overAllInterest).add(schedule.amount).toFixed(that.decimal);
    return schedule;
};

LoanSchedule.prototype.calculateAnnuitySchedule = function (p) {
    let date = moment(p.issueDate, that.dateFormat);
    let term = new Decimal(p.term);
    let amount = new Decimal(p.amount);
    let rate = new Decimal(p.rate);
    let interestAccruedAmount = new Decimal(0);
    let regularPaymentAmount = new Decimal(p.paymentAmount || that.calculateAnnuityPaymentAmount({amount: p.amount, term: p.term, rate: p.rate}));

    let payments = [that.getInitialPayment(amount, date, rate)];

    let schedulePoints = Array.apply(null, {length: term.toNumber() + 1}).map(Number.call, Number).map(i =>
        that.getSchedulePoint(
            (i === 0) ? date.clone() : date.clone().add(i, "months").date(p.paymentOnDay),
            that.ER_TYPE_REGULAR,
            regularPaymentAmount
        )
    ).concat(Object.keys(p.earlyRepayment || new Object({}))
        .map(d => that.getSchedulePoint(moment(d, that.dateFormat), p.earlyRepayment[d].erType, new Decimal(p.earlyRepayment[d].erAmount))))
        .sort((a, b) =>
            a.paymentDate.isSame(b.paymentDate, "day") ? 0 : (a.paymentDate.isAfter(b.paymentDate) ? 1 : -1)
        );


    let i = 1;

    let paymentAmount = schedulePoints[i].paymentAmount;
    while (i < schedulePoints.length && new Decimal(payments[i - 1].finalBalance).gt(0)) {
        let pay = {};

        pay.paymentDate = schedulePoints[i].paymentDate.format(that.dateFormat);
        pay.initialBalance = payments[i - 1].finalBalance;
        pay.interestRate = rate.toFixed(that.decimal);
        pay.annuityPaymentAmount = that.calculateAnnuityPaymentAmount({amount: pay.initialBalance, term: term.toNumber() - i + 1, rate: pay.interestRate});

        if (schedulePoints[i].paymentType !== that.ER_TYPE_REGULAR) {
            paymentAmount = schedulePoints[i].paymentAmount;
        } else if (schedulePoints[i - 1].paymentType !== that.ER_TYPE_REGULAR) {
            paymentAmount = new Decimal(p.paymentAmount || pay.annuityPaymentAmount);
        } else {

        }

        interestAccruedAmount = interestAccruedAmount.plus(
            that.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            })
        );

        if (schedulePoints[i].paymentType === that.ER_TYPE_REGULAR) {
            if ((i !== schedulePoints.length - 1) && paymentAmount.lt(pay.initialBalance)) {
                if (interestAccruedAmount.gt(paymentAmount)) {
                    pay.interestAmount = paymentAmount.toFixed(that.decimal);
                    interestAccruedAmount = interestAccruedAmount.minus(paymentAmount);
                } else {
                    pay.interestAmount = interestAccruedAmount.toFixed(that.decimal);
                    interestAccruedAmount = Decimal(0);
                }
                pay.principalAmount = paymentAmount.minus(new Decimal(pay.interestAmount)).toFixed(that.decimal);
                pay.paymentAmount = paymentAmount.toFixed(that.decimal);
            } else {
                pay.interestAmount = interestAccruedAmount.toFixed(that.decimal);
                pay.principalAmount = pay.initialBalance;
                pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(that.decimal);
            }
        } else {
            pay.principalAmount = paymentAmount.toFixed(that.decimal);
            pay.paymentAmount = paymentAmount.toFixed(that.decimal);
            pay.interestAmount = new Decimal(0).toFixed(that.decimal);
        }

        pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount));

        payments.push(pay);
        i++;
    }


    return payments;

};

LoanSchedule.prototype.calculateDifferentiatedSchedule = function (p) {
    let date = moment(p.issueDate, that.dateFormat);
    let term = new Decimal(p.term);
    let amount = new Decimal(p.amount);
    let rate = new Decimal(p.rate);
    let principalAmount = amount.div(term);

    let payments = [that.getInitialPayment(amount, date, rate)];
    let i = 1;
    while (i <= term.toNumber()) {
        let pay = {};

        date = date.add(1, "months").date(p.paymentOnDay);
        pay.paymentDate = date.format(that.dateFormat);
        pay.initialBalance = payments[i - 1].finalBalance;
        pay.interestRate = rate.toFixed(that.decimal);
        pay.principalAmount = i === term.toNumber() ? pay.initialBalance : principalAmount.toFixed(that.decimal);
        pay.interestAmount = new Decimal(
            that.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            })
        ).toFixed(that.decimal);
        pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(that.decimal);
        pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(that.decimal);

        payments.push(pay);
        i++;
    }
    return payments;

};

LoanSchedule.prototype.calculateBubbleSchedule = function (p) {
    let date = moment(p.issueDate, that.dateFormat);
    let term = new Decimal(p.term);
    let amount = new Decimal(p.amount);
    let rate = new Decimal(p.rate);

    let payments = [that.getInitialPayment(amount, date, rate)];
    let i = 1;
    while (i <= term.toNumber()) {
        let pay = {};

        date = date.add(1, "months").date(p.paymentOnDay);
        pay.paymentDate = date.format(that.dateFormat);
        pay.initialBalance = payments[i - 1].finalBalance;
        pay.interestRate = rate.toFixed(that.decimal);
        pay.principalAmount = i === term.toNumber() ? pay.initialBalance : new Decimal(0).toFixed(that.decimal);
        pay.interestAmount = new Decimal(
            that.calculateInterestByPeriod({
                from: payments[i - 1].paymentDate,
                to: pay.paymentDate,
                amount: pay.initialBalance,
                rate: pay.interestRate
            })
        ).toFixed(that.decimal);
        pay.paymentAmount = new Decimal(pay.principalAmount).plus(new Decimal(pay.interestAmount)).toFixed(that.decimal);
        pay.finalBalance = new Decimal(pay.initialBalance).minus(new Decimal(pay.principalAmount)).toFixed(that.decimal);

        payments.push(pay);
        i++;
    }
    return payments;

};

LoanSchedule.prototype.calculateMaxLoanAmount = function (p) {
    let term = new Decimal(p.term);
    let interestRate = new Decimal(p.rate).div(100).div(12);
    let paymentAmount = new Decimal(p.paymentAmount);
    let amount = paymentAmount.div(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
    return amount.toFixed(that.decimal);
};

LoanSchedule.prototype.calculateAnnuityPaymentAmount = function (p) {
    let term = new Decimal(p.term);
    let interestRate = new Decimal(p.rate).div(100).div(12);
    let paymentAmount = new Decimal(p.amount).mul(interestRate.div(interestRate.plus(1).pow(term.neg()).neg().plus(1)));
    return paymentAmount.toFixed(that.decimal);
};

LoanSchedule.prototype.calculateInterestByPeriod = function (p) {
    let curIntr = new Decimal(0);
    let dateFrom = moment(p.from, that.dateFormat);
    let dateTo = moment(p.to, that.dateFormat);
    if (dateFrom.isSame(dateTo, "year")) {
        curIntr = curIntr.plus(that.getInterestByPeriod({from: dateFrom, to: dateTo, amount: p.amount, rate: p.rate}));
    } else {
        let endOfYear = moment({years: dateFrom.year(), months: 11, days: 31});
        curIntr = curIntr.plus(that.getInterestByPeriod({from: dateFrom, to: endOfYear, amount: p.amount, rate: p.rate}));
        curIntr = curIntr.plus(that.getInterestByPeriod({from: endOfYear, to: dateTo, amount: p.amount, rate: p.rate}));
    }
    return curIntr.toFixed(that.decimal);
};

LoanSchedule.prototype.getInitialPayment = function (amount, date, rate) {
    return {
        paymentDate: date.format(that.dateFormat),
        initialBalance: new Decimal(0).toFixed(that.decimal),
        paymentAmount: new Decimal(0).toFixed(that.decimal),
        annuityPaymentAmount: new Decimal(0).toFixed(that.decimal),
        interestAmount: new Decimal(0).toFixed(that.decimal),
        principalAmount: new Decimal(0).toFixed(that.decimal),
        finalBalance: new Decimal(amount).toFixed(that.decimal),
        interestRate: rate.toFixed(that.decimal)
    };
};

LoanSchedule.prototype.ANNUITY_SCHEDULE = "ANNUITY";
LoanSchedule.prototype.DIFFERENTIATED_SCHEDULE = "DIFFERENTIATED";
LoanSchedule.prototype.BUBBLE_SCHEDULE = "BUBBLE";
LoanSchedule.prototype.ER_TYPE_MATURITY = "ER_MATURITY";
LoanSchedule.prototype.ER_TYPE_ANNUITY = "ER_ANNUITY";
LoanSchedule.prototype.ER_TYPE_REGULAR = "REGULAR";

LoanSchedule.prototype.getInterestByPeriod = function (p) {
    return new Decimal(p.rate).div(100).div(p.to.year() % 4 === 0 ? 366 : 365).mul(moment.duration(p.to.diff(p.from)).asDays()).mul(p.amount);
};

LoanSchedule.prototype.isHoliday = function (date) {
    return that.prodCalendar && that.prodCalendar.getCalendar(parseInt(date.format("YYYY"), 10), parseInt(date.format("MM"), 10), parseInt(date.format("DD"), 10)) === ProdCal.DAY_HOLIDAY;
};

LoanSchedule.prototype.getSchedulePoint = function (paymentDate, paymentType, paymentAmount) {
    while (that.isHoliday(paymentDate)) {
        paymentDate.add(1, "days");
    }
    return {
        paymentDate,
        paymentType,
        paymentAmount
    }
};

module.exports = LoanSchedule;

