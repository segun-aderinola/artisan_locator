import { Model, Optional } from "sequelize";
import { IUser } from "./general";

export interface IServiceProvider extends IUser {
    business_name?: string;
    category_of_service?: string;
    certificate?: string;  // File path or URL for certificate
    business_logo?: string;         // File path or URL for business logo
    brief_introduction?: string;         // File path or URL for business logo
    bio?: string;         // File path or URL for business logo
    identification_type?: string;     // E.g., passport, driver's license, etc.
    identification_doc_url?: string;  // File path or URL for identification document
    certificate_of_expertise_url?: string;     // E.g., passport, driver's license, etc.
    latitude?: string;
    longitude?: string;
    location?: string;
}

export interface ServiceProviderCreationAttributes extends Optional<IServiceProvider, "id" | "created_at" | "updated_at" > {}
export interface ServiceProviderModel extends Model<IServiceProvider, ServiceProviderCreationAttributes>, IServiceProvider {}