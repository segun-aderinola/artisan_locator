import { readdirSync } from 'fs';
import path from 'path';
import Db from './index';

const DbInstance = async () => {
  try {
    // Authenticate the connection
    await Db.authenticate();
    console.log('Connection has been established successfully.');

    // Load models dynamically from the models directory
    const modelsDirectory = path.join(__dirname, 'models'); // Adjust the path to your models folder
    const modelFiles = readdirSync(modelsDirectory).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    // Dynamically import all model files
    modelFiles.forEach(file => {
      const model = require(path.join(modelsDirectory, file)).default; // Import model dynamically
      if (model) {
        if (process.env.NODE_ENV === "development") {
            model.sync({ alter: true }); // Sync the model with the database
        } else {
            model.sync({ alter: false }); // Sync the model with the database
        }
        console.log(`Model ${file} synchronized successfully.`);
      }
    });

    console.log('All models have been synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the application if the DB connection fails
  }
};

export default DbInstance;




// const loadModels = async () => {
//     const modelsDirectory = path.join(__dirname, 'models'); // Adjust the path
//     const modelFiles = readdirSync(modelsDirectory).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
  
//     const models: any = {};
  
//     // Import all models dynamically
//     modelFiles.forEach((file) => {
//       const model = require(path.join(modelsDirectory, file)).default;
//       models[model.name] = model;
//     });
  
//     // Manually define associations
//     const { Customer, Order, Profile } = models;
  
//     Customer.hasMany(Order, { foreignKey: 'customerId' });
//     Order.belongsTo(Customer, { foreignKey: 'customerId' });
  
//     Profile.belongsTo(Customer, { foreignKey: 'userId' });
//     Customer.hasOne(Profile, { foreignKey: 'userId' });
  
//     return models;
//   };
  
//   const syncDatabase = async () => {
//     try {
//       await sequelize.authenticate();
//       console.log('Connection has been established successfully.');
  
//       // Load models and sync them
//       const models = await loadModels();
  
//       // Sync based on environment
//       if (process.env.NODE_ENV === "development") {
//         await sequelize.sync({ alter: true });
//         console.log("Database synced with alter: true");
//       } else {
//         await sequelize.sync({ force: false });
//         console.log("Database synced with force: false (production mode)");
//       }
//     } catch (error) {
//       console.error("Unable to connect to the database:", error);
//     }
//   };
  
//   syncDatabase();











// import { readdirSync } from 'fs';
// import path from 'path';
// import sequelize from './index';  // Assuming `sequelize` is exported from `index.ts`

// const DbInstance = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');

//     // Load models dynamically from the models directory
//     const modelsDirectory = path.join(__dirname, 'models'); // Adjust path
//     const modelFiles = readdirSync(modelsDirectory).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

//     // Create an array to store models
//     const models: any = {};

//     // Dynamically import all model files
//     modelFiles.forEach(file => {
//       const model = require(path.join(modelsDirectory, file)).default; // Import the model dynamically
//       models[model.name] = model; // Add to models object
//     });

//     // Set up associations after all models are loaded
//     Object.keys(models).forEach(modelName => {
//       const model = models[modelName];
//       if (model.associate) {
//         model.associate(); // Initialize associations if they exist
//       }
//     });

//     // Sync the models based on environment
//     if (process.env.NODE_ENV === 'development') {
//       await sequelize.sync({ alter: true });
//       console.log('Models synchronized with alter: true');
//     } else {
//       await sequelize.sync({ force: false });
//       console.log('Models synchronized with force: false (production mode)');
//     }

//     console.log('All models have been synchronized successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//     process.exit(1); // Exit the application if DB connection fails
//   }
// };

// export default DbInstance;
