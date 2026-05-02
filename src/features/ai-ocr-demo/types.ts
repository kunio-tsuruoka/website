export type OcrItem = { name: string; price: number };

export type OcrResult = {
  vendor?: string | null;
  date?: string | null;
  total?: number | null;
  subtotal?: number | null;
  tax?: number | null;
  payment?: string | null;
  note?: string | null;
  items?: OcrItem[];
};

export type OcrApiResponse = {
  data?: OcrResult;
  rawText?: string;
  error?: string;
  message?: string;
};
