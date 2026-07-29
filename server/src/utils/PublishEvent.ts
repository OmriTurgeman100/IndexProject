import pool from "../database/database";

export const PublishDocumentEvent = async (
  channel: string,
  file_id: number,
  parent_id: number,
  title: string,
  filename: string,
  type: string,
) => {
  try {
    const payload = {
      file_id,
      parent_id,
      title,
      filename,
      type,
    };

    await pool.query(`SELECT pg_notify($1, $2)`, [
      channel,
      JSON.stringify(payload),
    ]);

    console.log("📢 Event published:", channel, payload);
  } catch (error) {
    console.error("❌ Failed to publish event:", error);
  }
};
