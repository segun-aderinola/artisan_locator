import { DataTypes, Model } from "sequelize";
import sequelize from "../database";
import { IServiceProvider } from "../interfaces/service-provider";
import ServiceModel from "./services";

export class ServiceProviderModel extends Model<IServiceProvider> implements IServiceProvider {
  public id!: number;
  public uuid!: string;
  public phone!: string;
  public email!: string;
  public firstname!: string;
  public lastname!: string;
  public gender!: string;
  public location!: string;
  public latitude!: string;
  public longitude!: string;
  public password!: string;
  public email_verified_at!: Date;
  public phone_verified_at!: Date;
  public category_of_service!: string;
  public business_name!: string;
  public certificate!: string;
  public business_logo!: string;
  public brief_introduction!: string;
  public bio!: string;
  public identification_type!: string;
  public identification_doc_url!: string;
  public certificate_of_expertise_url!: string;
  public flagged!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

ServiceProviderModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      // primaryKey: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    category_of_service: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    business_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    certificate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brief_introduction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    identification_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    identification_doc_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    certificate_of_expertise_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ServiceProviderModel",
    timestamps: true,
    tableName: "service_providers",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ServiceProviderModel;