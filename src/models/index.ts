import ServiceProviderModel from "./service-provider";
import ServiceModel from "./services";

// Ensure associations are recognized
ServiceModel.belongsTo(ServiceProviderModel, {
  foreignKey: "provider_id",
  as: "provider",
});

ServiceProviderModel.hasMany(ServiceModel, {
    foreignKey: "provider_id",
    as: "services",
  });

export { ServiceModel, ServiceProviderModel };
