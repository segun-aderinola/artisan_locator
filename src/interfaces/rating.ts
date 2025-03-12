export interface IRating {
    id?: string;
    customer_id: string;
    provider_id: string;
    request_id: string;    
    provider_message?: string,
    customer_message?: string,
    customer_rating?: number,
    provider_rating?: number,
    created_at?: Date,
    updated_at?: Date
  }