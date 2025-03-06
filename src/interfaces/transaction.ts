export interface ITransaction {
    id?: string;
    user_id: string;
    reference: string;
    amount: number;
    reason: string;
    type: string,
    status: string,
    created_at?: Date,
    updated_at?: Date
  }