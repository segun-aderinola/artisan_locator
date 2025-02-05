import AdminModel from '../models/admin';
import CustomerModel from '../models/customer';
import ServiceProviderModel from '../models/service-provider';
import TemporaryUserModel from '../models/temporary-user';
import TokenModel from '../models/token';
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
    // AccountModel.sync({alter:false});
    // TransactionModel.sync({alter:false});
    // PayeeModel.sync({alter:false})
    // LoanModel.sync({alter:false,hooks:true})
    // await sequelize.sync({ force: true });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the application if the DB connection fails
  }
};

export default DbInstance;
