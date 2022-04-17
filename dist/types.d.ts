import {Moment} from "moment"

export declare type LSOptions = {
    decimalDigit?: number;
    dateFormat?: string;
    prodCalendar?: string;
};
export declare type LSEarlyRepayment = {
    erType: string;
    erAmount: string;
};
export declare type LSEarlyRepayments = {
    [date: string]: LSEarlyRepayment;
};
export declare type LSParameters = {
    amount: string;
    issueDate?: string;
    term: number;
    rate: string;
    paymentAmount?: string;
    paymentOnDay?: number;
    earlyRepayment?: LSEarlyRepayments;
};
export declare type LSPayment = {
    paymentDate?: string;
    initialBalance?: string;
    interestRate?: string;
    annuityPaymentAmount?: string;
    interestAmount?: string;
    principalAmount?: string;
    paymentAmount?: string;
    finalBalance?: string;
};
export declare type LSSchedule = {
    payments?: Array<LSPayment>;
    minPaymentAmount: string;
    maxPaymentAmount: string;
    efficientRate: string;
    term: string;
    overAllInterest: string;
};
export declare type LSInterestParameters = {
    from: string;
    to: string;
    amount: string;
    rate: string;
};
export declare type LSInterestByPeriodParameters = {
    from: Moment;
    to: Moment;
    amount: string;
    rate: string;
};
