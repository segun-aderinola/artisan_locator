import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export = {
  async up(queryInterface: QueryInterface) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("customers", [
      {
        uuid: uuidv4(),
        phone: "08123456789",
        email: "customer1@example.com",
        firstname: "John",
        lastname: "Doe",
        gender: "Male",
        location: "Lagos, Nigeria",
        password: hashedPassword,
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
        facial_verification_url: "face_verifications/john_doe.png",
        flagged: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        uuid: uuidv4(),
        phone: "08098765432",
        email: "customer2@example.com",
        firstname: "Jane",
        lastname: "Smith",
        gender: "Female",
        location: "Abuja, Nigeria",
        password: hashedPassword,
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
        facial_verification_url: "face_verifications/jane_smith.png",
        flagged: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("customers", {});
  },
};
