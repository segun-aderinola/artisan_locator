import sequelize from "../database";
import { AdminModel } from "../interfaces/admin";
import { DataTypes } from "sequelize";

const AdminModel = sequelize.define<AdminModel>(
  'AdminModel',
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
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      // validate: {
      //   isEmail: true,
      // },
    },
    password: {
      type: DataTypes.STRING,
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
    timestamps: true,
    tableName: 'customers',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default AdminModel;
