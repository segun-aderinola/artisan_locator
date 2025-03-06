import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { ITransaction } from "../interfaces/transaction";


interface ITransactionCreation extends Optional<ITransaction, "id" | "created_at" | "updated_at"> {}

class TransactionModel extends Model<ITransaction, ITransactionCreation> implements ITransaction {
  public id!: string;
  public user_id!: string;
  public reference!: string;
  public amount!: number;
  public reason!: string;
  public type!: string;
  public status!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

TransactionModel.init(
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
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12,5),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [['debit', 'credit']]
        }
        
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [['failed', 'successful', 'pending']]
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
      timestamps: true,
      tableName: "transactions",
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

export default TransactionModel;