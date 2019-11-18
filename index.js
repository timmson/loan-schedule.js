const AnnuitySchedule = require("./lib/annuity-loan-schedule");
const BubbleLoanSchedule = require("./lib/bubble-loan-schedule");
const DifferentiatedSchedule  = require("./lib/differentiated-loan-schedule");

// Create object
const mapping = {};

// Create class
class LoanSchedule {
	
	// What does a `static` method do and why?
	static getLoanSchedule(scheduleType, options) {
		if (Object.prototype.hasOwnProperty.call(mapping, scheduleType)) {
			return new mapping[scheduleType](options);
		}
	}

	// What does a `constructor` do and why?
	constructor(options) {
		this.options = options;
	}

	// Calling a `prototype`? Why?
	calculateSchedule(p) {
		if (Object.prototype.hasOwnProperty.call(mapping, p.scheduleType)) {
			return LoanSchedule.getLoanSchedule(p.scheduleType, this.options).calculateSchedule(p);
		}
	}

	// Calculate Interest By Period
	calculateInterestByPeriod(p) {
		return new AnnuitySchedule(this.options).calculateInterestByPeriod(p);
	}

	// Calculate payment amount
	calculateAnnuityPaymentAmount(p) {
		return new AnnuitySchedule(this.options).calculateAnnuityPaymentAmount(p);
	}

	// Calculate Max Loan Amount
	calculateMaxLoanAmount(p) {
		return new AnnuitySchedule(this.options).calculateMaxLoanAmount(p);
	}
}

// Huh? Why?
LoanSchedule.ANNUITY_SCHEDULE = "ANNUITY";
LoanSchedule.DIFFERENTIATED_SCHEDULE = "DIFFERENTIATED";
LoanSchedule.BUBBLE_SCHEDULE = "BUBBLE";

// Essentially copying imports to an object? Huh?
mapping[LoanSchedule.ANNUITY_SCHEDULE] = AnnuitySchedule;
mapping[LoanSchedule.BUBBLE_SCHEDULE] = BubbleLoanSchedule;
mapping[LoanSchedule.DIFFERENTIATED_SCHEDULE] = DifferentiatedSchedule;

module.exports = LoanSchedule;
