const LoanSchedule = require("../index");
const BubbleLoanSchedule = require("./bubble-loan-schedule");
const DiffirentiatedSchedule  = require("./diffirentiated-loan-schedule");


const mapping = {

};

mapping[LoanSchedule.BUBBLE_SCHEDULE] = BubbleLoanSchedule;
mapping[LoanSchedule.DIFFERENTIATED_SCHEDULE] = DiffirentiatedSchedule;

class LoanScheduleFactory {

    static getLoanSchedule(scheduleType, options) {
        if (mapping.hasOwnProperty(scheduleType)) {
            return new mapping[scheduleType](options)
        }
    }
}

module.exports = LoanScheduleFactory;