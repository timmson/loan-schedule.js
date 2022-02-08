import "bootstrap";
import "./index.scss";

import LoanSchedule from "../../index.js";
import Accounting from "accounting";
import Vue from "vue";
import Storage from "./storage";

const telegramShareUrl = "https://t.me/share/url";

const loanSchedule = new LoanSchedule({
	prodCalendar: "ru"
});

const storage = Storage(window);

new Vue({
	el: "#app",
	data: {
		currentYear: new Date().getFullYear().toString(),
		shareUrl: "",
		request: storage.load(),
		earlyRepayment: {
			date: "",
			amount: ""
		},
		schedule: {}
	},
	methods: {

		updateSchedule: function () {

			this.request.amount = this.fromMoney(this.request.amount);
			this.request.paymentAmount = this.fromMoney(this.request.paymentAmount);
			this.request.paymentOnDay = parseInt(this.request.paymentOnDay) > 31 ? 31 : this.request.paymentOnDay;

			if (this.earlyRepayment.date) {
				delete this.request.earlyRepayment[this.earlyRepayment.date];
				if (this.earlyRepayment.amount) {
					this.request.earlyRepayment[this.earlyRepayment.date] = {
						"erAmount": this.fromMoney(this.earlyRepayment.amount),
						"erType": LoanSchedule.ER_TYPE_MATURITY
					};
				}
			}

			this.schedule = loanSchedule.calculateSchedule(this.request);
			this.schedule.lastPaymentDate = this.schedule.payments[this.schedule.payments.length - 1].paymentDate;
			this.schedule.termInYear = Math.ceil(this.schedule.term / 12);

			storage.save(this.request);
			this.shareUrl = `${telegramShareUrl}?url=${encodeURIComponent(window.location.href)}`;

			this.request.amount = this.toMoney(this.request.amount);
			this.request.paymentAmount = this.toMoney(this.request.paymentAmount);
			this.earlyRepayment.amount = this.toMoney(this.earlyRepayment.amount);
		},

		copyPayment: function (event, paymentId) {
			this.request.amount = this.schedule.payments[paymentId - 1].finalBalance;
			this.request.term = this.request.term - paymentId + 1;
			this.request.issueDate = this.schedule.payments[paymentId - 1].paymentDate;
			this.request.earlyRepayment = {};
			this.updateSchedule(null);
		},

		toMoney: function (number) {
			return number ? Accounting.formatMoney(number, {symbol: "", format: "%s%v", thousand: " "}) : number;
		},

		fromMoney: function (numberWithSpaces) {
			return numberWithSpaces ? numberWithSpaces.toString().split(" ").join("").replaceAll(",", ".") : numberWithSpaces;
		},

		reset: function () {
			storage.reset();
			this.request = storage.load();
		}
	},

	mounted() {
		this.updateSchedule(null);
	}
});

