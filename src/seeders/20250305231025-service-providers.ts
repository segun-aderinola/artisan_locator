import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export = {
  async up(queryInterface: QueryInterface) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("service_providers", [
      {
        uuid: uuidv4(),
        phone: "08123456789",
        email: "provider1@example.com",
        firstname: "John",
        lastname: "Doe",
        gender: "Male",
        location: "Lagos, Nigeria",
        latitude: 6.5244,
        longitude: 3.3792,
        password: hashedPassword,
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
        category_of_service: "Plumbing",
        business_name: "John's Plumbing Services",
        certificate: "certificates/plumber1.pdf",
        business_logo: "logos/plumber1.png",
        brief_introduction: "Experienced plumber with 10+ years in the industry.",
        bio: "I specialize in residential and commercial plumbing solutions.",
        identification_type: "Driver's License",
        identification_doc_url: "ids/plumber1.png",
        certificate_of_expertise_url: "expertise/plumber1.pdf",
        flagged: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("service_providers", {});
  },
};
