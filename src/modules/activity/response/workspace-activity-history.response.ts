import { ActivityResponse } from './activity.response';

export class WorkspaceActivityItemResponse extends ActivityResponse {
  project: { id: string; name: string } | null;
}

export class WorkspaceActivityHistoryResponse {
  items: WorkspaceActivityItemResponse[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}
