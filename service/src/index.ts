import mammoth from "mammoth";
import pool from "./database/database";
import s3Client, { bucket } from "./utils/S3_Client";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { generateJSON } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Client, Notification } from "pg";
import dotenv from "dotenv";
import { event_file } from "./interfaces/file";
import { nanoid } from "nanoid";
import ServerImageResize from "./extensions/resize";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const CreateDocument = async (
  parent_id: number,
  title: string,
  content: object,
  type: string,
) => {
  try {
    const table = type === "system" ? "system_docs" : "service_docs";

    const column = type === "system" ? "system_id" : "service_id";

    await pool.query(
      `insert into ${table} (${column}, title, content) values ($1, $2, $3);`,
      [parent_id, title, content],
    );
  } catch (error) {
    console.error(error);
  }
};

const upload_files = async (
  key: string,
  buffer: Buffer,
  contentType: string,
  title: string,
  parent_id: number,
  type: string,
) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);

  await s3Client.send(command);

  const table = type === "system" ? "system_files" : "service_files";

  const column = type === "system" ? "system_id" : "service_id";

  await pool.query(
    `insert into ${table} (${column}, title, filename) values ($1, $2, $3) returning *;`,
    [parent_id, title, key],
  );
};

const extract_signed_url = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

const createMammothOptions = (payload: event_file) => ({
  convertImage: mammoth.images.imgElement(async (image) => {
    const id = nanoid(5);

    const key = `file-${id}-parent-${payload.parent_id}`;
    const buffer = await image.readAsBuffer();

    const title = `document_service-${id}`;

    await upload_files(
      key,
      buffer,
      image.contentType,
      title,
      payload.parent_id,
      payload.type,
    );

    const signed_url = await extract_signed_url(key);

    return {
      src: signed_url,
    };
  }),
});

const fetch_document_file = async (key: string): Promise<Buffer> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error("S3 object has no body");
  }

  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
};

async function main() {
  try {
    await client.connect();

    await client.query("LISTEN document_service");

    console.log("Listening for notifications on document_service...");

    client.on("notification", async (msg: Notification) => {
      try {
        console.log("🔔 Received notification:", msg.payload);

        const payload: event_file = msg.payload
          ? JSON.parse(msg.payload)
          : null;

        const buffer = await fetch_document_file(payload.filename);

        const options = createMammothOptions(payload);

        const result = await mammoth.convertToHtml({ buffer }, options);

        const html = result.value;

        const tiptapJson = generateJSON(html, [
          StarterKit,
          Highlight,
          Color,
          ServerImageResize,
          TextAlign.configure({
            types: ["heading", "paragraph"],
          }),
          TableKit.configure({
            table: { resizable: true },
          }),
        ]);

        await CreateDocument(
          payload.parent_id,
          payload.title,
          tiptapJson,
          payload.type,
        );
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error("❌ Conversion error:", error);
  }
}

main();
