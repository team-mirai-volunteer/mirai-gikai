export type Tag = {
  id: string;
  label: string;
  created_at: string;
  updated_at: string;
};

export type TagWithBillCount = Tag & {
  bill_count: number;
};

export type CreateTagInput = {
  label: string;
};

export type UpdateTagInput = {
  label: string;
};
