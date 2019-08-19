import "bootstrap";
import "./index.scss";

import LoanSchedule from "../../index.js"
import Accounting from "accounting"
import Vue from "vue"

let loanSchedule = new LoanSchedule({prodCalendar: "ru"});

let app = new Vue({
    el: '#app',
    data: {
        currentYear: new Date().getFullYear().toString(),
        request: {
            amount: 8198146.58,
            rate: 9.5,
            term: 345,
            paymentAmount: 69546.16,
            issueDate: "05.08.2019",
            paymentOnDay: 5,
            scheduleType: loanSchedule.ANNUITY_SCHEDULE,
            earlyRepayment: {}
        },
        earlyRepayment: {
            date: "",
            amount: ""
        },
        schedule: {}
    },
    methods: {
        updateSchedule: function (event) {
            this.schedule = loanSchedule.calculateSchedule(this.request);
            this.schedule.lastPaymentDate = this.schedule.payments[this.schedule.payments.length - 1].paymentDate;
            this.schedule.termInYear = Math.ceil(this.schedule.term / 12);
        },
        copyPayment: function (event, paymentId) {
            this.request.amount = this.schedule.payments[paymentId - 1].finalBalance;
            this.request.term = this.request.term - paymentId - 1;
            this.request.issueDate = this.schedule.payments[paymentId - 1].paymentDate;
            this.request.paymentAmount = this.schedule.payments[paymentId - 1].paymentAmount;
            this.updateSchedule(null);

        },
        addEarlyRepayment: function (event) {
            this.request.earlyRepayment[this.earlyRepayment.date] = {
                "erAmount": this.earlyRepayment.amount,
                "erType": loanSchedule.ER_TYPE_MATURITY
            };
            this.updateSchedule(null);
        },
        toMoney: function (number) {
            return Accounting.formatMoney(number, {symbol: "$", format: "%s%v", thousand: " "});
        }
    },
    mounted() {
        this.updateSchedule(null);
    },
    beforeUpdate() {
        this.request.paymentOnDay = parseInt(this.request.paymentOnDay) > 28 ? 28 : this.request.paymentOnDay;
    }
});

