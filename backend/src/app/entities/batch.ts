import { Replace } from '@/utils/replace';
import { randomUUID } from 'node:crypto';

export type BatchPayableStatus = 'PROCESSING' | 'COMPLETED';

export interface BatchProps {
  userId: string;
  totalJobs: number;
  completedJobs: number;
  successJobs: number;
  failedJobs: number;
  status: BatchPayableStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplaceBatchProps {
  completedJobs?: number;
  successJobs?: number;
  failedJobs?: number;
  status?: BatchPayableStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Batch {
  public _id: string;
  public props: BatchProps;

  constructor(props: Replace<BatchProps, ReplaceBatchProps>, id?: string) {
    this._id = id ?? randomUUID();
    this.props = {
      totalJobs: props.totalJobs,
      userId: props.userId,
      completedJobs: props.completedJobs ?? 0,
      successJobs: props.successJobs ?? 0,
      failedJobs: props.failedJobs ?? 0,
      status: props.status ?? 'PROCESSING',
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }
}
