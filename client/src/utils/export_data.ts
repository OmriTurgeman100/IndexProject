import * as XLSX from "xlsx";

interface Entities {
  name: string;
  id: number;
  type: string;
}

interface TranslatedFilters {
  label: string;
  value: string;
  key: string;
}

export const export_entities_to_excel = (
  entities: Entities[],
  translatedFilters: TranslatedFilters[]
) => {
  const filename = translatedFilters
    .map((item) => `${item.value}=${item.label}`)
    .join("___");

  let wb = XLSX.utils.book_new();
  let ws = XLSX.utils.json_to_sheet(entities);

  ws["!cols"] = [
    { wch: 25 }, // name
    { wch: 20 }, // type
    { wch: 10 }, // id
  ];

  XLSX.utils.book_append_sheet(wb, ws, "results");

  XLSX.writeFile(wb, `${filename.length > 0 ? filename : "results"}.xlsx`);
};
