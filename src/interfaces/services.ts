export interface IService {
    id: number;
    uuid: string;
    provider_id: string;
    category_id: string;
    images: [];
    name: string;
    starting_price: number;
    description: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}


// export interface IServiceCreationBody extends Optional<IService, "id" | "created_at" | "updated_at" > {}
// export interface ServiceModel extends Model<IService, IServiceCreationBody>, IService {}