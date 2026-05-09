import * as nodeSchedule from 'node-schedule';
import { SchedulerServicePort } from '../../modules/task/port/scheduler-service.port';

class SchedulerService implements SchedulerServicePort {
  private jobs = new Map<string, nodeSchedule.Job>();

  schedule(taskId: string, date: Date, callback: () => void): void {
    this.cancel(taskId);
    const job = nodeSchedule.scheduleJob(date, callback);
    this.jobs.set(taskId, job);
  }

  cancel(taskId: string): void {
    const job = this.jobs.get(taskId);
    if (job) {
      job.cancel();
      this.jobs.delete(taskId);
    }
  }
}

export const schedulerService = new SchedulerService();
