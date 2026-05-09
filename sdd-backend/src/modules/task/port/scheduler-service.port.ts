export interface SchedulerServicePort {
  schedule(taskId: string, date: Date, callback: () => void): void;
  cancel(taskId: string): void;
}
