const AnnuitySchedule = require("./lib/annuity-loan-schedule");
const BubbleLoanSchedule = require("./lib/bubble-loan-schedule");
const DifferentiatedSchedule  = require("./lib/differentiated-loan-schedule");

const mapping = {};

class LoanSchedule {

    static getLoanSchedule(scheduleType, options) {
        if (mapping.hasOwnProperty(scheduleType)) {
            return new mapping[scheduleType](options);
        }
    }

    constructor(options) {
        this.options = options;
    }

    calculateSchedule(p) {
        if (mapping.hasOwnProperty(p.scheduleType)) {
            return new mapping[p.scheduleType](this.options).calculateSchedule(p);
        }
    }
}

LoanSchedule.ANNUITY_SCHEDULE = "ANNUITY";
LoanSchedule.DIFFERENTIATED_SCHEDULE = "DIFFERENTIATED";
LoanSchedule.BUBBLE_SCHEDULE = "BUBBLE";

mapping[LoanSchedule.ANNUITY_SCHEDULE] = AnnuitySchedule;
mapping[LoanSchedule.BUBBLE_SCHEDULE] = BubbleLoanSchedule;
mapping[LoanSchedule.DIFFERENTIATED_SCHEDULE] = DifferentiatedSchedule;

module.exports = LoanSchedule;

