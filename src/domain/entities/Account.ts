import { IBAN } from "../value-objects/IBAN";

export class Account {
    constructor(
        public id: string,
        public ownerId: string,
        public name: string,
        public iban: string,
        public balance: number = 0
    ) {
        if (!IBAN.isValid(iban)) throw new Error("Invalid IBAN");
    }

    debit(amount: number) {
        if (this.balance < amount) throw new Error("Insufficient funds");
        this.balance -= amount;
    }

    credit(amount: number) {
        this.balance += amount;
    }
}
