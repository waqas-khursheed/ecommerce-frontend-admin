export interface Notification {
  id: number;
  n_title: string;
  n_desc: string;
  table_name: string;
  row_id: number;
  seen: 0 | 1;
  created_at: string;
}
