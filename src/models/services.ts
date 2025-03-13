import { DataTypes, Model } from "sequelize";
import sequelize from "../database";
import { IService } from "../interfaces/services";
import ServiceProviderModel from "./service-provider";

export class ServiceModel extends Model<IService> implements IService {
  public id!: number;
  public uuid!: string;
  public category_id!: string;
  public provider_id!: string;
  public name!: string;
  public description!: string;
  public starting_price!: number;
  public images!: [];
  public status!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

ServiceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    provider_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    starting_price: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: true,
      defaultValue: 0.0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive"]],
      },
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
    modelName: "ServiceModel",
    timestamps: true,
    tableName: "services",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


export default ServiceModel;