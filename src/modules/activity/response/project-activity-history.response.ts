import { ActivityResponse } from './activity.response';

export class ProjectActivityHistoryResponse {
  items: ActivityResponse[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}
