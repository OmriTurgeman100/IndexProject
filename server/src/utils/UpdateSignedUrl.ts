import pool from "../database/database";
import s3Client, { bucket } from "../utils/S3_Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ReplaceSignedUrls = async (type: "system" | "service", document_id: string) => {
    try {
        const docs_table = type === "system" ? "system_docs" : "service_docs"

        const files_table = type === "system" ? "system_files" : "service_files"

        const column = type === "system" ? "system_id" : "service_id"

        const data = await pool.query(`select ${column} from ${docs_table} where id = $1;`, [document_id])

        const parent_id = data.rows[0][column]

        const files = await pool.query(`select * from ${files_table} where ${column} = $1;`, [parent_id])

        for (const file of files.rows) {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: file.filename,
            });
            const newUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            const encodedFilename = encodeURIComponent(file.filename);

            const pattern = `https?://[^"]*${encodedFilename}[^"]*`;

            const query = `
                UPDATE ${docs_table}
                SET content = regexp_replace(content::text, $1, $2, 'g')::jsonb
                WHERE id = $3;
            `;

            await pool.query(query, [pattern, newUrl, document_id]);

        }

    } catch (error) {
        console.error("❌ Error replacing signed URLs:", error);
    }

}