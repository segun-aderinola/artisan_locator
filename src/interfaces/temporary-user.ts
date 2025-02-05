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
}

// export interface ITemporaryUser {
//     id: string;
//     user_type: "customer" | "service_provider";
//     phone_number: string;
//     phone_verified: boolean;
//     email: string;
//     email_verified: boolean;
//     first_name: string;
//     last_name: string;
//     gender: "Male" | "Female" | "Other";
//     address: string;
//     password: string;
//     business_docs?: string[]; // Only for service providers (Array of S3 links)
//     business_logo?: string; // Only for service providers
//     face_capture: string;
//     onboarding_step: number;
//     ip_address: string;
//     device_info: any; // JSON metadata of device details
//     createdAt: Date;
//     updatedAt: Date;
// }


export interface ServiceProviderCreationAttributes extends Optional<IServiceProvider, "id" | "created_at" | "updated_at" > {}
export interface ServiceProviderModel extends Model<IServiceProvider, ServiceProviderCreationAttributes>, IServiceProvider {}