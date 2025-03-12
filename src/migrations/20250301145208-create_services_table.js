'use strict';

const { DataTypes } = require('sequelize');
const { validate } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('services', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            provider_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            category_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            starting_price: {
                type: DataTypes.DECIMAL(12,5),
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            images: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'active',
                validate: {
                    isIn: [['active', 'inactive']],
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('services');
    },
};
