// Appearances
import "bootstrap";
import "./index.scss";

// Major modules
import Accounting from "accounting"
import Vue from "vue"

// Timmson's working files
import LoanSchedule from "../../index.js"

let loanSchedule = new LoanSchedule({
    prodCalendar: "ru"
});

// Instantiate Vue
let app = new Vue({
    el: '#app',

    // Set data for web example
    data: {
        currentYear: new Date().getFullYear().toString(),
        request: {
            amount: 8189187.33,
            rate: 9.5,
            term: 343,
            paymentAmount: 69546.16,
            issueDate: "07.10.2019",
            paymentOnDay: 5,
            scheduleType: LoanSchedule.ANNUITY_SCHEDULE,
            earlyRepayment: {}
        },
        earlyRepayment: {
            date: "",
            amount: ""
        },
        schedule: {}
    },

    // Sending data to objects inside the `data` object.
    methods: {
        // Data sent to the `schedule` object.
        updateSchedule: function (event) {
            this.schedule = loanSchedule.calculateSchedule(this.request);
            this.schedule.lastPaymentDate = this.schedule.payments[this.schedule.payments.length - 1].paymentDate;
            this.schedule.termInYear = Math.ceil(this.schedule.term / 12);
        },
        // Loan data sent to the `request` object.
        copyPayment: function (event, paymentId) {
            this.request.amount = this.schedule.payments[paymentId - 1].finalBalance;
            this.request.term = this.request.term - paymentId - 1;
            this.request.issueDate = this.schedule.payments[paymentId - 1].paymentDate;
            this.request.paymentAmount = this.schedule.payments[paymentId - 1].paymentAmount;
            this.updateSchedule(null);

        },
        // Extra payment data
        addEarlyRepayment: function (event) {
            this.request.earlyRepayment[this.earlyRepayment.date] = {
                "erAmount": this.earlyRepayment.amount,
                "erType": LoanSchedule.ER_TYPE_MATURITY
            };
            // Rerun amortization schedule
            this.updateSchedule(null);
        },
        // Return data in financial format
        toMoney: function (number) {
            return Accounting.formatMoney(number, {symbol: "$", format: "%s%v", thousand: " "});
        }
    },
    // Run amortization schedule
    mounted() {
        this.updateSchedule(null);
    },
    // If payment due after 28, check it's not February.
    beforeUpdate() {
        this.request.paymentOnDay = parseInt(this.request.paymentOnDay) > 28 ? 28 : this.request.paymentOnDay;
    }
});
