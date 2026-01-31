import { GroupMessage } from "../../domain/entities/GroupMessage";

export interface GroupMessageRepository {
  save(message: GroupMessage): Promise<void>;
  findAll(): Promise<GroupMessage[]>;
  findById(id: string): Promise<GroupMessage | null>;
  findRecent(limit?: number): Promise<GroupMessage[]>;
}
