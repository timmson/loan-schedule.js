import LoanSchedule from "../../index";


export default function storage(window) {
	const params = new URL(window.location.href).searchParams;
	const storage = window.localStorage;
	return {
		load: () => {
			return {
				amount: params.get("amount") || storage.getItem("amount") || 2000000,
				rate: params.get("rate") || storage.getItem("rate") || 9.5,
				term: params.get("term") || storage.getItem("term") || 240,
				paymentAmount: params.get("paymentAmount") || storage.getItem("paymentAmount") || "",
				issueDate: params.get("issueDate") || storage.getItem("issueDate") || new Intl.DateTimeFormat("ru").format(new Date()),
				paymentOnDay: params.get("paymentOnDay") || storage.getItem("paymentOnDay") || 1,
				scheduleType: LoanSchedule.ANNUITY_SCHEDULE,
				earlyRepayment: {}
			};
		},
		save: (request) => {
			Object.entries(request)
				.filter((e) => !(e[1] instanceof Object))
				.map(([key, value]) => window.localStorage.setItem(key, value.toString()));

			params.set("amount", request.amount);
			params.set("rate", request.rate);
			params.set("term", request.term);
			params.set("paymentAmount", request.paymentAmount);
			params.set("issueDate", request.issueDate);
			params.set("paymentOnDay", request.paymentOnDay);
			window.history.replaceState({}, "Loan Amortization Schedule", "?" + params.toString());
		},

		reset: () => {
			window.localStorage.clear();
		}

	};
}