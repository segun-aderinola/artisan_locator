import sequelize from "../database";
import { CustomerModel } from "../interfaces/customer";
import { DataTypes } from "sequelize";

const CustomerModel = sequelize.define<CustomerModel>(
  'CustomerModel',
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
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      // validate: {
      //   isEmail: true,
      // },
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
      // validate: {
      //   isIn: [['male', 'female', 'other']],
      // },
    },
    location: {
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
    facial_verification_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

export default CustomerModel;
