import { Model, Optional } from "sequelize";


export interface IRequest {
    id?: number;
    uuid?: string;
    provider_id: string;
    service_id: string;
    customer_id: string;
    location: string;
    latitude: string;
    longitude: string;
    deadline: string;
    message: string;
    status?: string;
    created_at?: Date;
    updated_at?: Date;
}


export interface IRequestCreationBody extends Optional<IRequest, "id" | "created_at" | "updated_at" > {}
export interface ServiceModel extends Model<IRequest, IRequestCreationBody>, IRequest {}