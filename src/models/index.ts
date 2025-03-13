import ServiceProviderModel from "./service-provider";
import ServiceModel from "./services";

// Ensure associations are recognized
ServiceModel.belongsTo(ServiceProviderModel, {
    foreignKey: "provider_id", // Foreign key in the `services` table
    targetKey: "uuid",         // Reference the `uuid` column in the `service_providers` table
    as: "provider",
  });
  
  ServiceProviderModel.hasMany(ServiceModel, {
    foreignKey: "provider_id", // Foreign key in the `services` table
    sourceKey: "uuid",         // Reference the `uuid` column in the `service_providers` table
    as: "services",
  });
  

export { ServiceModel, ServiceProviderModel };
