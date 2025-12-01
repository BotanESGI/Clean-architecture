export interface BankSettingsRepository {
  getSavingsRate(): Promise<number>;
  setSavingsRate(rate: number): Promise<void>;
}

