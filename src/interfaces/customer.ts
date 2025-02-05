import { Model, Optional } from "sequelize";
import { IUser } from "./general";

export interface ICustomer extends IUser {
    facial_verification_completed?: boolean;
    facial_verification_url?: string;
}


export interface ICustomerCreationbody extends Optional<ICustomer, "id" | "created_at" | "updated_at" > {}
export interface CustomerModel extends Model<ICustomer, ICustomerCreationbody>, ICustomer {}