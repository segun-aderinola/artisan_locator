import { DataTypes, Model } from "sequelize";
import sequelize from "../../database";
import User from "./user.model";

interface OrderAttributes {
    id: string;
    customerId: string;
    totalAmount: number;
}

class Order extends Model<OrderAttributes> {
  public id!: string;
  public customerId!: string;
  public totalAmount!: number;

  static associate() {
    Order.belongsTo(User, { foreignKey: 'customerId' }); // Associate Order with User
  }
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Order",
  }
);

export default Order;
