'use strict';

const { DataTypes } = require('sequelize');
const { validate } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admins',
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
            email: {
              type: DataTypes.STRING,
              allowNull: true,
              unique: true,
            },
            password: {
              type: DataTypes.STRING,
              allowNull: true,
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
        await queryInterface.dropTable('admins');
    },
};
