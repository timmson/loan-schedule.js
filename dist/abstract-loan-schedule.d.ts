import Decimal from "decimal.js"
import moment, {Moment} from "moment"
import ProdCal from "prod-cal"
import {LSInterestByPeriodParameters, LSInterestParameters, LSOptions, LSParameters, LSPayment, LSSchedule} from "./types"

declare abstract class AbstractLoanSchedule {
    decimal: number;
    dateFormat: string;
    prodCalendar: ProdCal;
    protected constructor(options?: LSOptions);
    abstract calculateSchedule(p: LSParameters): LSSchedule;
    applyFinalCalculation(p: LSParameters, schedule: any): LSSchedule;
    getInitialPayment(amount: Decimal, date: Moment, rate: Decimal): LSPayment;
    calculateInterestByPeriod(p: LSInterestParameters): string;
    getInterestByPeriod(p: LSInterestByPeriodParameters): Decimal;
    addMonths(number: number, date: Moment, paymentOnDay: number): Moment;
    isHoliday(date: Moment): boolean;
    getSchedulePoint(paymentDate: Moment, paymentType: string, paymentAmount: Decimal): {
        paymentDate: moment.Moment;
        paymentType: string;
        paymentAmount: Decimal;
    };
    getPaymentDateOnWorkingDay(paymentDate: Moment): Moment;
    printSchedule(schedule: LSSchedule, printFunction: any): void;
    static get ER_TYPE_MATURITY(): string;
    static get ER_TYPE_ANNUITY(): string;
    static get ER_TYPE_REGULAR(): string;
}
export = AbstractLoanSchedule;
