import { Request, Response, NextFunction } from "express";
import { CatchAsync } from "../utils/CatchAsync";

export const systems_and_services_fields = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fields = [
      { id: 1, field: "owned_by", translation: "צוות" },
      { id: 2, field: "active_location", translation: "מיקום נוכחי" },
      { id: 3, field: "secondary_site", translation: "אתר משני" },
      { id: 4, field: "third_site", translation: "אתר שלישי" },
      { id: 5, field: "core_network", translation: "רשת" },
      { id: 6, field: "infrastructure_type", translation: "סוג תשתית" },
      { id: 7, field: "cert_infrastructure", translation: "תשתית תעודה" },
      { id: 8, field: "environment", translation: "סביבה" },
      { id: 9, field: "backup_type", translation: "סוג גיבוי" },
      { id: 10, field: "authentication", translation: "סוג הזדהות" },
      { id: 11, field: "dependency", translation: "תלות" },
      { id: 12, field: "vm_title", translation: "שם שרת" },
      { id: 13, field: "vm_location", translation: "מיקום שרת" },
      { id: 14, field: "vm_network", translation: "רשת שרת" },
      { id: 15, field: "vm_type", translation: "סוג שרת" },
      { id: 16, field: "vm_cluster", translation: "קלאסטר שרת" },
      { id: 17, field: "vm_host", translation: "שרת פיזי" },
      { id: 18, field: "vm_ip", translation: "כתובת שרת" },
      { id: 19, field: "vm_room", translation: "חדר שרת" },
      { id: 20, field: "vm_rack", translation: "מסד שרת" },
    ];

    res.status(200).json({
      data: fields,
    });
  },
);
