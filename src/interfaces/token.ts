import { Model, Optional } from "sequelize";
import { TokenStatus, TokenType } from "../enum";

export interface IToken {
    id: number;
    uuid: string
    user_id: string;
    key: string
    code: string;
    type: TokenType;
    status: TokenStatus;
    expired_at: Date;
    created_at: Date;
    updated_at: Date;
}


export interface ITokenCreationBody extends Optional<IToken, 'id' | 'created_at' | 'updated_at'> {}
export interface ITokenModel extends Model<IToken, ITokenCreationBody>, IToken {}
