export type DietSession = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type CreateDietSessionInput = {
  name: string;
  start_date: string;
  end_date: string;
};

export type UpdateDietSessionInput = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export type DeleteDietSessionInput = {
  id: string;
};
