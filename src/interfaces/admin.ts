import { Model, Optional } from "sequelize";


export interface IAdmin {
    id: number;
    uuid: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}


export interface IAdminCreationbody extends Optional<IAdmin, "id" | "created_at" | "updated_at" > {}
export interface AdminModel extends Model<IAdmin, IAdminCreationbody>, IAdmin {}