import { Activity } from "../../domain/entities/Activity";

export interface ActivityRepository {
  save(activity: Activity): Promise<void>;
  findById(id: string): Promise<Activity | null>;
  findPublished(): Promise<Activity[]>;
  findAll(): Promise<Activity[]>;
}
