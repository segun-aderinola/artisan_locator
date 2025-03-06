import sequelize from "../database";
import { DataTypes, Model } from "sequelize";
import { IServiceCategory } from "../interfaces/service-category";
export class ServiceCategoryModel extends Model<IServiceCategory>
    implements IServiceCategory {
    
    public id!: number;
    public uuid!: string;
    public name!: string;
    public description!: Text;
    public image!: string;
    public status!: string;
    public created_at!: Date;
    public updated_at!: Date;
}
ServiceCategoryModel.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive']]
        }
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
    modelName: "ServiceCategory",
    timestamps: true,
    tableName: 'service_categories',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ServiceCategoryModel;
