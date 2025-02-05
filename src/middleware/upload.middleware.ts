import multer from "multer";

// Configure multer storage
const storage = multer.memoryStorage();

// File filter to restrict file types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log("Request Body:", req);
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true); // Accept images and PDFs
    } else {
      cb(new Error("Unsupported file")); // Reject unsupported files
    }
};

// Configure multer instance
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
    fileFilter,
});

// Dynamic upload middleware for single, multiple, or specific fields
export const customUpload = {
    single: (fieldName: string) => upload.single(fieldName),
    multiple: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fields: { name: string; maxCount?: number }[]) => upload.fields(fields),
};

export default upload;




// import express, { Request, Response } from "express";
// import upload from "./config/multer"; // Import the multer configuration

// const app = express();

// // Single file upload route
// app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   res.json({
//     message: "File uploaded successfully",
//     file: req.file,
//   });
// });

// app.post("/uploads", upload.array("files", 5), (req: Request, res: Response) => {
//     if (!req.files || !Array.isArray(req.files)) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }
  
//     res.json({
//       message: "Files uploaded successfully",
//       files: req.files,
//     });
//   });
  

// app.post(
//     "/upload-documents",
//     dynamicUpload.fields([
//       { name: "resume", maxCount: 1 },
//       { name: "certificate", maxCount: 1 },
//       { name: "cover_letter", maxCount: 1 },
//     ]),
//     (req: Request, res: Response) => {
//       if (!req.files) {
//         return res.status(400).json({ error: "No files uploaded" });
//       }
  
//       const files = req.files as {
//         [fieldname: string]: Express.Multer.File[];
//       };
  
//       res.json({
//         message: "Files uploaded successfully",
//         files: {
//           resume: files.resume ? files.resume[0] : null,
//           certificate: files.certificate ? files.certificate[0] : null,
//           cover_letter: files.cover_letter ? files.cover_letter[0] : null,
//         },
//       });
//     }
//   );


// app.listen(3000, () => console.log("Server running on port 3000"));
