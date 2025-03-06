export interface IWallet {
    id?: string;
    user_id: string;
    account_number: string;
    balance?: number;
    bank_name: string;
    created_at?: Date,
    updated_at?: Date
  }