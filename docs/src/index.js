import "bootstrap";
import "./index.scss";

import LoanSchedule from "../../index.js";
import Accounting from "accounting";
import URL from "url";
import QueryString from "querystring";
import Vue from "vue";


let loanSchedule = new LoanSchedule({
	prodCalendar: "ru"
});

let url = URL.parse(window.location.href);
let params = QueryString.parse(url.query);

let request = {
	amount: params["amount"] || 2000000,
	rate: params["rate"] || 9.5,
	term: params["term"] || 240,
	paymentAmount: params["paymentAmount"],
	issueDate: params["issueDate"] || new Intl.DateTimeFormat("ru").format(new Date()),
	paymentOnDay: params["paymentOnDay"] || 1,
	scheduleType: LoanSchedule.ANNUITY_SCHEDULE,
	earlyRepayment: {}
};

let app = new Vue({
	el: '#app',
	data: {
		currentYear: new Date().getFullYear().toString(),
		request: request,
		earlyRepayment: {
			date: "",
			amount: ""
		},
		schedule: {}
	},
	methods: {
		updateSchedule: function (event) {
			if (this.earlyRepayment.date) {
				delete this.request.earlyRepayment[this.earlyRepayment.date];
				if (this.earlyRepayment.amount) {
					this.request.earlyRepayment[this.earlyRepayment.date] = {
						"erAmount": this.earlyRepayment.amount,
						"erType": LoanSchedule.ER_TYPE_MATURITY
					};
				}
			}

			this.schedule = loanSchedule.calculateSchedule(this.request);
			this.schedule.lastPaymentDate = this.schedule.payments[this.schedule.payments.length - 1].paymentDate;
			this.schedule.termInYear = Math.ceil(this.schedule.term / 12);
			window.history.replaceState({}, "Loan Amortization Schedule", "?" + QueryString.stringify(this.request));
		},
		copyPayment: function (event, paymentId) {
			this.request.amount = this.schedule.payments[paymentId - 1].finalBalance;
			this.request.term = this.request.term - paymentId + 1;
			this.request.issueDate = this.schedule.payments[paymentId - 1].paymentDate;
			this.request.earlyRepayment = {};
			this.updateSchedule(null);
		},
		toMoney: function (number) {
			return Accounting.formatMoney(number, {symbol: "", format: "%s%v", thousand: " "});
		}
	},
	mounted() {
		this.updateSchedule(null);
	},
	beforeUpdate() {
		this.request.paymentOnDay = parseInt(this.request.paymentOnDay) > 28 ? 28 : this.request.paymentOnDay;
	}
});

