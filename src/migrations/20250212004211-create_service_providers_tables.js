'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('service_providers',
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
        phone: {
          type: DataTypes.STRING(15),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        firstname: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lastname: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        gender: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        latitude: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        longitude: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email_verified_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        phone_verified_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        // New fields specific to service provider
        category_of_service: {
          type: DataTypes.STRING,
          allowNull: false, // This field is required to select the service category
        },
        business_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        certificate: {
          type: DataTypes.STRING,
          allowNull: true, // This would be a file path to the certificate
        },
        business_logo: {
          type: DataTypes.STRING,
          allowNull: true, // This would be a file path to the business logo
        },
        brief_introduction: {
          type: DataTypes.STRING,
          allowNull: true, // This would be a file path to the business logo
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true, // This would be a file path to the business logo
        },
        identification_type: {
          type: DataTypes.STRING,
          allowNull: true, // Type of ID (e.g., Passport, Driver's License, etc.)
        },
        identification_doc_url: {
          type: DataTypes.STRING,
          allowNull: true, // File path to the ID document
        },
        certificate_of_expertise_url: {
          type: DataTypes.STRING,
          allowNull: true, // Type of ID (e.g., Passport, Driver's License, etc.)
        },
        flagged: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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
    )},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('service_providers');
  }
};