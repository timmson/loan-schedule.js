function parseDDMMYYYY(value) {
	var dateParts = value.split(".");
	return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
}
	
function formatDDMMYYYY(value) {
	var date = new Date(value * 1000);
	var curr_date = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
	var curr_month = date.getMonth() + 1;
	curr_month = (curr_month < 10) ? ("0" + curr_month) : curr_month; 
	var curr_year = date.getFullYear();
	return curr_date + "." + curr_month +"." + curr_year; 
}

function format2(value) {
	return Number(value).toFixed(2);
}

function format6(value) {
	return Number(value).toFixed(6);
}

function Schedule(params){
	
	this.secondsInMonth = 2629800; 
	this.secondsInYear = 31557600;

	this.params = params;
	this.issueDateInSeconds = parseDDMMYYYY(this.params.issuedate).getTime() / 1000;
	
	this.ratePerYear = params.prc/100;
	this.ratePerDayNotInLeapYear = this.ratePerYear/365;
	this.ratePerDayInLeapYear = this.ratePerYear/366;
	
	this.isFirstPaymentInThisMonth = this.params.payday > new Date(this.issueDateInSeconds * 1000).getDate();

	this.calculate = function() {
		return (this.params.calctype == 1) ? this.getDiffPayments() : this.getAnnuityPayments();
	}
	
	this.getPayment = function() {
		var termInPeriod = Math.ceil(this.params.annterm/this.params.annperiod);
		var ratePerPeriod = this.ratePerYear * this.params.annperiod/12;
		var paymentAmount = this.params.amount * ((this.params.isending == "false") ? this.params.annamountprc/100 : 1) * ratePerPeriod/(1-Math.pow(1+ratePerPeriod, -termInPeriod));
		return format2(paymentAmount);
	}
	
	this.getAnnuityPayments = function() {
		this.termInPeriod = Math.ceil(this.params.annterm/this.params.annperiod);
		var paymentArray = [];
		var paymentAmount = this.getPayment();
		var annuityBufferAmount = 0;
		for (var i = 0; i <= this.termInPeriod; i++) {
			var pay = {};
			var date = new Date(this.issueDateInSeconds * 1000);
			if (i==0) {
				pay['paymentDate'] = formatDDMMYYYY(date.getTime() / 1000);
				pay['initialBalance'] = format2("0");
				pay['paymentAmount'] = format2("0");
				pay['interestAmount'] = format2("0");
				pay['principalAmount'] = format2("0");
				pay['finalBalance'] = this.params.amount;		
			} else if (i != this.termInPeriod  || (i == this.termInPeriod && this.params.isending == "false"))  {
				date = this.getPaymentDate(date, i, this.params.annperiod);
				pay['paymentDate'] = formatDDMMYYYY(date.getTime() / 1000);
				pay['initialBalance'] = paymentArray[i-1].finalBalance;
				pay['interestAmount'] = format2(this.getInterest(
											paymentArray[i-1].paymentDate, 
											pay.paymentDate, 
											pay.initialBalance)
										);
				annuityBufferAmount += parseFloat(format2(paymentAmount - pay.interestAmount));
				if (i % this.params.annprincperiod  == 0) {
					pay['principalAmount'] = format2(annuityBufferAmount);
					annuityBufferAmount = 0;
				} else {
					pay['principalAmount'] = format2("0");
				}
				pay['paymentAmount'] = format2(parseFloat(pay.principalAmount) + parseFloat(pay.interestAmount));
				pay['finalBalance'] = format2(pay.initialBalance - pay.principalAmount);	
			} else {
				var lastDate = new Date(this.issueDateInSeconds * 1000)
				lastDate.setMonth(parseInt(lastDate.getMonth()) + parseInt(this.isFirstPaymentInThisMonth ? this.params.annterm - 1 : this.params.annterm), this.params.payday);
				pay['paymentDate'] = formatDDMMYYYY(lastDate.getTime() / 1000);
				pay['initialBalance'] = paymentArray[i-1].finalBalance;
				pay['interestAmount'] = format2(this.getInterest(
												paymentArray[i-1].paymentDate, 
												pay.paymentDate, 
												pay.initialBalance)
									);
				pay['principalAmount'] = format2(pay.initialBalance);
				pay['paymentAmount'] = format2(parseFloat(pay.principalAmount) + parseFloat(pay.interestAmount));
				pay['finalBalance'] = format2(0);				
			}
			paymentArray.push(pay);
		}
		return paymentArray;
	}
	
	this.getDiffPayments = function() {
		this.termInPeriod = Math.ceil(this.params.diffterm/this.params.diffperiod);
		var paymentArray = [];
		var principalAmount = format2(this.params.amount * ((this.params.isending == "false") ? this.params.diffamountprc/100 : 1) * this.params.diffprincperiod/this.termInPeriod);
		for (var i = 0; i <= this.termInPeriod; i++) {
			var pay = {};
			var date = new Date(this.issueDateInSeconds * 1000);
			if (i==0) {
				pay['paymentDate'] = formatDDMMYYYY(date.getTime() / 1000);
				pay['initialBalance'] = format2("0");
				pay['paymentAmount'] = format2("0");
				pay['interestAmount'] = format2("0");
				pay['principalAmount'] = format2("0");
				pay['finalBalance'] = this.params.amount;		
			} else if (i != this.termInPeriod  || (i == this.termInPeriod && this.params.isending == "false"))  {
				date = this.getPaymentDate(date, i, this.params.diffperiod);
				pay['paymentDate'] = formatDDMMYYYY(date.getTime() / 1000);
				pay['initialBalance'] = paymentArray[i-1].finalBalance;
				pay['interestAmount'] = format2(this.getInterest(
												paymentArray[i-1].paymentDate, 
												pay.paymentDate, 
												paymentArray[i-1].finalBalance)
											);
				pay['principalAmount'] = (i % this.params.diffprincperiod  == 0) ? principalAmount : format2("0");
				pay['paymentAmount'] = format2(parseFloat(pay.principalAmount) + parseFloat(pay.interestAmount));
				pay['finalBalance'] = format2(pay.initialBalance - pay.principalAmount);	
			} else {
				var lastDate = new Date(this.issueDateInSeconds * 1000)
				lastDate.setMonth(parseInt(lastDate.getMonth()) + parseInt(this.isFirstPaymentInThisMonth ? this.params.diffterm - 1 : this.params.diffterm), this.params.payday);
				pay['paymentDate'] = formatDDMMYYYY(lastDate.getTime() / 1000);
				pay['initialBalance'] = paymentArray[i-1].finalBalance;
				pay['interestAmount'] = format2(this.getInterest(
												paymentArray[i-1].paymentDate, 
												pay.paymentDate, 
												pay.initialBalance)
									);
				pay['principalAmount'] = format2(pay.initialBalance);
				pay['paymentAmount'] = format2(parseFloat(pay.principalAmount) + parseFloat(pay.interestAmount));
				pay['finalBalance'] = format2(0);				
			}
			
			paymentArray.push(pay);
		}
		return paymentArray;
	}
	
	this.getInterest = function(dateFromStr, dateToStr, balance) {
		var currentRate = 0;
		var currentInterest = 0;
		var dateFrom = parseDDMMYYYY(dateFromStr);
		var dateTo = parseDDMMYYYY(dateToStr);
		if (dateFrom.getFullYear() == dateTo.getFullYear()) {
			currentInterest = this.getInerestByPeriod(dateFrom.getFullYear(), this.getPeriodIndays(dateFrom, dateTo), balance);
		} else {
			var borderDate = new Date(dateFrom.getFullYear(), 12-1, 31);
			currentInterest = this.getInerestByPeriod(dateFrom.getFullYear(), this.getPeriodIndays(dateFrom, borderDate), balance);
			currentInterest +=  parseFloat(
				this.getInerestByPeriod(dateTo.getFullYear(), this.getPeriodIndays(borderDate, dateTo), balance)
			);
		}
		return currentInterest;
	}
	
	this.getPeriodIndays = function(dateFrom, dateTo) {
		return Math.floor((dateTo.getTime() - dateFrom.getTime()) / (1000 * 86400));
	}
	
	this.getInerestByPeriod = function(year, days, balance) {
		return this.getRateByYear(year) * days * balance;
	}
	
	this.getRateByYear = function(year) {
		return (year % 4 == 0) ? this.ratePerDayInLeapYear : this.ratePerDayNotInLeapYear
	}
	
	this.getPaymentDate = function(lastDate, paymentNum, period) {
		if (this.isFirstPaymentInThisMonth) {
			if ((paymentNum == 1) && (period == 1)) {
				lastDate.setDate(this.params.payday);
			} else {
				lastDate.setMonth(lastDate.getMonth() + paymentNum * period-1, this.params.payday);
			}
		} else {
			lastDate.setMonth(lastDate.getMonth() + paymentNum * period, this.params.payday);
		}
		return lastDate;
	}
	
}


