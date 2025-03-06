export interface IRating {
    id?: string;
    customer_id: string;
    provider_id: string;
    request_id: string;
    message: string,
    rate: number,
    created_at?: Date,
    updated_at?: Date
  }