import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import { log } from "console";
import crypto from "crypto";
import { injectable } from "tsyringe";

// Define the file upload parameters
interface FileUploadParams {
  files: Express.Multer.File | Express.Multer.File[];
  userId: string;
}

@injectable()
class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN!
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME!;
  }

  /**
   * Generate a unique file key for S3 upload
   * @param userId - The ID of the user
   * @param fieldName - The field name (e.g., "avatar", "resume")
   * @param originalName - Original file name to extract the file type
   * @returns string - The S3 file key
   */
  private generateFileKey = (userId: string, fieldName: string, originalName: string): string => {
    const hexCode = crypto.randomBytes(16).toString("hex"); // Unique identifier
    const fileType = originalName.split(".").pop(); // Extract file extension
    return `${userId}/${fieldName}/${hexCode}.${fileType}`;
  };

  /**
   * Upload a single file to S3
   * @param file - The file object (Express.Multer.File)
   * @param userId - The ID of the user
   * @returns Promise<string> - URL of the uploaded file
   */
  public uploadFile = async (file: Express.Multer.File, userId: string): Promise<string> => {
    
    const fileKey = this.generateFileKey(userId, file.fieldname, file.originalname);

    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      // ACL: "public-read" as ObjectCannedACL, // Cast to ObjectCannedACL
    };

    console.log("Uploading file to S3:", file, params);

    try {
      const result = await this.s3.send(new PutObjectCommand(params));
      console.log("S3 upload result:", result);
      
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("File upload failed for single file.");
    }
  };

  /**
   * Upload multiple files to S3
   * @param files - Array of file objects (Express.Multer.File[])
   * @param userId - The ID of the user
   * @returns Promise<string[]> - Array of URLs of uploaded files
   */
  public uploadMultipleFiles = async (files: Express.Multer.File[], userId: string): Promise<string[]> => {
    const uploadPromises = files.map((file) => this.uploadFile(file, userId));

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple files to S3:", error);
      throw new Error("File upload failed for multiple files.");
    }
  };

  /**
   * Handles file uploads (single or multiple)
   * @param fileUploadParams - File upload parameters
   * @returns Promise<string | string[]> - URL(s) of uploaded file(s)
   */
  public upload = async (fileUploadParams: FileUploadParams): Promise<string | string[]> => {
    const { files, userId } = fileUploadParams;

    return Array.isArray(files) ? this.uploadMultipleFiles(files, userId) : this.uploadFile(files, userId);
  };
}

export default S3Service;



// class S3Service {
//   private s3: AWS.S3;
//   private bucketName: string;

//   constructor() {
//     this.s3 = new AWS.S3({
//       region: process.env.AWS_REGION,
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     });
//     this.bucketName = process.env.AWS_BUCKET_NAME!;
//   }

//   /**
//    * Upload a single file to S3
//    * @param fileBuffer - The file buffer
//    * @param fileName - The name of the file
//    * @param folder - Folder path in the bucket (optional)
//    * @returns Promise<string> - URL of the uploaded file
//    */
//   async uploadFile(
//     fileUploadParams: FileUploadParams
//   ): Promise<string> {
//     const { files, userId } = fileUploadParams;
//     // Generate a hexcode for unique filenames
//     const generateHexCode = () => crypto.randomBytes(16).toString("hex");

//     const fileType = files.mimetype.split("/")[1]; // Extract file type (e.g., jpg, png, pdf)
//     const hexCode = generateHexCode();

//     // Set the file path: userid/subfolder/hexcode.filetype
//     const subFolder = files.fieldname; // Use the fieldname to determine subfolder (e.g., "avatar", "resume")
//     const fileKey = `${userId}/${subFolder}/${hexCode}.${fileType}`;

//     const params: AWS.S3.PutObjectRequest = {
//       Bucket: this.bucketName,
//       Key: fileKey,
//       Body: files.buffer,
//       ACL: "public-read", // Optional: Set access control
//     };

//     try {
//       await this.s3.upload(params).promise();
//       // await this.s3.putObject(params).promise();
//       return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
//     } catch (error) {
//       console.error("Error uploading file to S3:", error);
//       throw new Error("File upload failed");
//     }
//   }

//   /**
//    * Upload multiple files to S3
//    * @param files - Array of FileUpload objects
//    * @param folder - Folder path in the bucket (optional)
//    * @returns Promise<string[]> - Array of URLs of uploaded files
//    */
//   async uploadMultipleFiles(
//     fileUploadParams: FileUploadParams
//   ): Promise<string[]> {
//     const { files, userId } = fileUploadParams;
//     // const uploadPromises = files.map((file) =>
//     //   this.uploadFile(file.buffer, file.name, folder)
//     // );

//     const params = files.map((file) => {
//       // Generate a hexcode for unique filenames
//       const generateHexCode = () => crypto.randomBytes(16).toString("hex");

//       const fileType = files.mimetype.split("/")[1]; // Extract file type (e.g., jpg, png, pdf)
//       const hexCode = generateHexCode();

//       // Set the file path: userid/subfolder/hexcode.filetype
//       const subFolder = files.fieldname; // Use the fieldname to determine subfolder (e.g., "avatar", "resume")
//       const fileKey = `${userId}/${subFolder}/${hexCode}.${fileType}`;

//       return {
//         Bucket: this.bucketName,
//         Key: fileKey,
//         Body: files.buffer,
//         ACL: "public-read", // Optional: Set access control
//       };
//     })
  


//     try {
//       return await Promise.all(
//         params.map((param) => this.s3.upload(param).promise())
//       );
//       // return await Promise.all(uploadPromises);
//     } catch (error) {
//       console.error("Error uploading multiple files to S3:", error);
//       throw new Error("File upload failed");
//     }
//   }
// }



// "files": {
//     "resume": {
//       "fieldname": "resume",
//       "originalname": "resume.pdf",
//       "encoding": "7bit",
//       "mimetype": "application/pdf",
//       "destination": "uploads/",
//       "filename": "resume-1674349123456-123456789.pdf",
//       "path": "uploads/resume-1674349123456-123456789.pdf",
//       "size": 12345
//     },
//     "certificate": {
//       "fieldname": "certificate",
//       "originalname": "certificate.jpg",
//       "encoding": "7bit",
//       "mimetype": "image/jpeg",
//       "destination": "uploads/",
//       "filename": "certificate-1674349123456-123456789.jpg",
//       "path": "uploads/certificate-1674349123456-123456789.jpg",
//       "size": 54321
//     },
//     "cover_letter": {
//       "fieldname": "cover_letter",
//       "originalname": "cover_letter.pdf",
//       "encoding": "7bit",
//       "mimetype": "application/pdf",
//       "destination": "uploads/",
//       "filename": "cover_letter-1674349123456-123456789.pdf",
//       "path": "uploads/cover_letter-1674349123456-123456789.pdf",
//       "size": 67890
//     }
//   }