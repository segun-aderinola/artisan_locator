import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { IWallet } from "../interfaces/wallet";

interface IWalletCreation extends Optional<IWallet, "id" | "created_at" | "updated_at"> {}

class WalletModel extends Model<IWallet, IWalletCreation> implements IWallet {
  public id!: string;
  public user_id!: string;
  public account_number!: string;
  public balance!: number;
  public bank_name!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

WalletModel.init(
{
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(12,5),
        allowNull: false,
        defaultValue: 0.00
      },
      bank_name: {
        type: DataTypes.STRING,
        defaultValue: 0,
        allowNull: false,
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
      tableName: "wallets",
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

export default WalletModel;