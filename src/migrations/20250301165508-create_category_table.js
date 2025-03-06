'use strict';

const { DataTypes } = require('sequelize');
const { validate } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('service_categories', 
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
            name: {
              type: DataTypes.STRING,
              allowNull: true,
            },
            description: {
              type: DataTypes.TEXT,
              allowNull: true,
            },
            image: {
              type: DataTypes.STRING,
              allowNull: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'active',
                validate: {
                  isIn: [['active', 'inactive']]
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
      );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('service_categories');
    },
};
