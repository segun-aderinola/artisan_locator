import { DataTypes, Model } from 'sequelize';
import sequelize from '../../database';
import { UserAttributes } from '../interface/user';
import Order from './order.model';


class User extends Model<UserAttributes> {
  public id!: string;
  public name!: string;
  public device_info!: Record<string, any>; // Add the JSONB field as an object

  static associate() {
    User.hasMany(Order, { foreignKey: 'customerId' }); // Add Order to User
  }
}


User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_info: {
      type: DataTypes.JSONB, // JSONB column
      allowNull: true, // Nullable
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'custom_user_table', // Custom table name
    timestamps: true, // Enables createdAt and updatedAt

  }
);

export default User;
