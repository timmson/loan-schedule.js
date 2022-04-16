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
    earlyRepayment: LSEarlyRepayments;
    amount: string;
    issueDate: string;
    term: string;
    rate: string;
    paymentAmount?: string;
    paymentOnDay: number;
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
