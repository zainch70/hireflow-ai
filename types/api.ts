export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SortDirection = "asc" | "desc";

export type SortInput = {
  field: string;
  direction: SortDirection;
};
