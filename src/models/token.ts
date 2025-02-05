import { DataTypes } from 'sequelize';
import Db from '../database';
import { TokenStatus, TokenType } from '../enum';
import { ITokenModel } from '../interfaces/token';

const TokenModel = Db.define<ITokenModel>(
  'TokenModel',
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
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TokenType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TokenStatus)),
      allowNull: false,
      defaultValue: TokenStatus.NOT_USED,
    },
    expired_at: {
        type: DataTypes.DATE,
        defaultValue:DataTypes.NOW,
        allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'tokens',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);


export default TokenModel;