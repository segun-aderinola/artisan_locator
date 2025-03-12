import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { IRating } from "../interfaces/rating";

interface IRatingCreation extends Optional<IRating, "id" | "created_at" | "updated_at"> {}

class RatingModel extends Model<IRating, IRatingCreation> implements IRating {
  public id!: string;
  public customer_id!: string;
  public provider_id!: string;
  public request_id!: string;
  public provider_message!: string;
  public customer_message!: string;
  public customer_rating!: number;
  public provider_rating!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

RatingModel.init(
{
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      request_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider_message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_rating: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      provider_rating: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
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
      timestamps: true,
      tableName: "ratings",
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

export default RatingModel;