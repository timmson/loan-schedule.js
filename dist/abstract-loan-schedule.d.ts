import Decimal from "decimal.js"
import moment, {Moment} from "moment"
import ProdCal from "prod-cal"
import {LSOptions, LSPayment, LSSchedule} from "./index"

declare class AbstractLoanSchedule {
    decimal: number;
    dateFormat: string;
    prodCalendar: ProdCal;
    constructor(options?: LSOptions);
    applyFinalCalculation(p: any, schedule: any): any;
    getInitialPayment(amount: Decimal, date: Moment, rate: Decimal): LSPayment;
    calculateInterestByPeriod(p: any): string;
    getInterestByPeriod(p: any): Decimal;
    addMonths(number: any, date: any, paymentOnDay: any): any;
    isHoliday(date: Moment): boolean;
    getSchedulePoint(paymentDate: any, paymentType: any, paymentAmount: any): {
        paymentDate: any;
        paymentType: any;
        paymentAmount: any;
    };
    getPaymentDateOnWorkingDay(paymentDate: Moment): moment.Moment;
    printSchedule(schedule: LSSchedule, printFunction: any): void;
    static get ER_TYPE_MATURITY(): string;
    static get ER_TYPE_ANNUITY(): string;
    static get ER_TYPE_REGULAR(): string;
}
export = AbstractLoanSchedule;
