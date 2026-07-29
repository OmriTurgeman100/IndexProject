import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import https from "https";
import { NodeHttpHandler } from "@smithy/node-http-handler";

dotenv.config();

export const bucket = process.env.S3_BUCKET;

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  requestHandler: new NodeHttpHandler({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) }),
});

export default s3Client;
