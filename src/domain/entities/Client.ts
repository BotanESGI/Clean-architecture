
export class Client {
    constructor(
        private id: string,
        private firstName: string,
        private lastName: string,
        private email: string,
        private passwordHashed: string,
        private role: 'client' | 'director' | 'advisor' = 'client',
        private isBanned: boolean = false,
        private isVerified: boolean = false,
        private accountIds: string[] = [] 
    ) {}
    public getId(): string {
        return this.id;
    }
    public getFirstName(): string {
        return this.firstName;
    }
    public getLastName(): string {
        return this.lastName;
    }
    public getEmail(): string {
        return this.email;
    }
    public getIsVerified(): boolean {
        return this.isVerified;
    }
    public getAccountIds(): string[] {
        return this.accountIds;
    }
    public setFirstName(firstName: string): void {
        this.firstName = firstName;
    }   
    public setLastName(lastName: string): void {
        this.lastName = lastName;
    }   
    public setEmail(email: string): void {
        this.email = email;
    }   
    public setIsVerified(isVerified: boolean): void {
        this.isVerified = isVerified;
    }
    public addAccountId(accountId: string): void {
        this.accountIds.push(accountId);
    }
    public getPasswordHash(): string {
        return this.passwordHashed;
    }
    public getRole(): 'client' | 'director' | 'advisor' {
        return this.role;
    }
    public setRole(role: 'client' | 'director' | 'advisor'): void {
        this.role = role;
    }
    public getIsBanned(): boolean {
        return this.isBanned;
    }
    public setIsBanned(isBanned: boolean): void {
        this.isBanned = isBanned;
    }
    public ban(): void {
        this.isBanned = true;
    }
    public unban(): void {
        this.isBanned = false;
    }
}