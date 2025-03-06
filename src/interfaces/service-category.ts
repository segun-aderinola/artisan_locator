import { Model, Optional } from "sequelize";


export interface IServiceCategory {
    id: number;
    uuid: string;
    name: string;
    description: Text;
    image: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}


export interface IServiceCategoryCreationBody extends Optional<IServiceCategory, "id" | "created_at" | "updated_at" > {}
export interface ServiceCategoryModel extends Model<IServiceCategory, IServiceCategoryCreationBody>, IServiceCategory {}