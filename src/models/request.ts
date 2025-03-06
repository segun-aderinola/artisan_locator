import sequelize from "../database";
import { DataTypes, Model } from "sequelize";
import { IRequest } from "../interfaces/requests";
export class RequestModel extends Model<IRequest>
    implements IRequest {
    
    public id!: number;
    public uuid!: string;
    public customer_id!: string;
    public provider_id!: string;
    public service_id!: string;
    public deadline!: string;
    public location!: string;
    public longitude!: string;
    public latitude!: string;
    public message!: string;
    public status!: string;
    public created_at!: Date;
    public updated_at!: Date;
}
RequestModel.init(
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
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    service_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
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
    deadline: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'waiting_for_review', 'accepted', 'completed', 'declined']]
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
    modelName: "RequestModel",
    timestamps: true,
    tableName: 'requests',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default RequestModel;
