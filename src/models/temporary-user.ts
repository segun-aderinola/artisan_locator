import { DataTypes, Model } from "sequelize";
// import { sequelize } from "../models/index";
import sequelize from "../database";
import { Gender, UserType } from "../enum";

export interface TemporaryUserModel extends Model {
    id: number;
    uuid: string;
    user_type: UserType;
    phone_number: string;
    phone_verified_at: Date;
    email: string;
    email_verified_at: Date;
    first_name: string;
    last_name: string;
    gender: Gender;
    address: string;
    password: string;
    means_of_identification: string;
    means_of_identification_url: string;
    certificate_of_expertise_url: string;
    business_logo: string;
    face_capture_url: string;
    onboarding_step: number;
    ip_address: string;
    device_info: Object;
    created_at: Date;
    updated_at: Date;
}


const TemporaryUserModel = sequelize.define<TemporaryUserModel>(
    'TemporaryUserModel',
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
      user_type: {
        type: DataTypes.ENUM(...Object.values(UserType)),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_verified_at: {
        type: DataTypes.DATE, 
        allowNull: true, // Nullable until phone is verified
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until email verification step
        unique: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true, // Nullable until email is verified
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until first name is collected
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until last name is collected
      },
      gender: {
        type: DataTypes.ENUM(...Object.values(Gender)),
        allowNull: true, // Nullable until gender is collected
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true, // Nullable until address is collected
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until password is set
      },
      means_of_identification: {
        type: DataTypes.STRING,
        allowNull: true, // Type of ID (e.g., Passport, Driver's License, etc.)
      },
      means_of_identification_url: {
        type: DataTypes.STRING,
        allowNull: true, // File path to the ID document
      },
      certificate_of_expertise_url: {
        type: DataTypes.STRING,
        allowNull: true, // Type of ID (e.g., Passport, Driver's License, etc.)
      },
      business_logo: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until service provider uploads logo
      },
      face_capture_url: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until user uploads face capture
      },
      onboarding_step: {
        type: DataTypes.INTEGER,
        allowNull: false, // Must track the user's current step in the onboarding flow
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable until user provides their IP address
      },
      device_info: {
        type: DataTypes.JSONB,
        allowNull: true, // Nullable until user provides device info
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
      tableName: 'temporary_users',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
);


export default TemporaryUserModel;
