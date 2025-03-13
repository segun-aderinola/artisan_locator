import AdminModel from '../models/admin';
import CustomerModel from '../models/customer';
import RatingModel from '../models/rating';
import RequestModel from '../models/request';
import ServiceCategoryModel from '../models/service-category';
import ServiceProviderModel from '../models/service-provider';
import ServiceModel from '../models/services';
import TemporaryUserModel from '../models/temporary-user';
import TokenModel from '../models/token';
import TransactionModel from '../models/transaction';
import WalletModel from '../models/wallet';
import sequelize from './index';
import Db from './index';

// Database connection
const DbInstance = async () => {
try {
    await Db.authenticate();
    console.log('Connection has been established successfully.');

    CustomerModel.sync({ alter: false });
    ServiceProviderModel.sync({ alter: false });
    TokenModel.sync({ alter: false });
    AdminModel.sync({ alter: false });
    TemporaryUserModel.sync({ alter: false });
    ServiceCategoryModel.sync({ alter: false });
    ServiceModel.sync({ alter: false });
    RequestModel.sync({ alter: false });
    RatingModel.sync({ alter: false });
    WalletModel.sync({ alter: false });
    TransactionModel.sync({ alter: false });

    //await sequelize.sync({ alter: true });
} catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the application if the DB connection fails
}
};

export default DbInstance;
