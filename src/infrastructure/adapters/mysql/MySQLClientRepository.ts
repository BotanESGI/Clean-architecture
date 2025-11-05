import { DataSource, Repository } from "typeorm";
import { ClientRepository } from "../../../application/repositories/ClientRepository";
import { Client } from "../../../domain/entities/Client";
import { ClientEntity } from "./entities/ClientEntity";

export class MySQLClientRepository implements ClientRepository {
  private repo: Repository<ClientEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(ClientEntity);
  }

  async save(client: Client): Promise<void> {
    const entity = this.toEntity(client);
    await this.repo.save(entity);
  }

  async update(client: Client): Promise<void> {
    const entity = this.toEntity(client);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Client | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Client[]> {
    const entities = await this.repo.find();
    return entities.map(e => this.toDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toEntity(client: Client): ClientEntity {
    const entity = new ClientEntity();
    entity.id = client.getId();
    entity.firstName = client.getFirstName();
    entity.lastName = client.getLastName();
    entity.email = client.getEmail();
    entity.passwordHashed = client.getPasswordHash();
    entity.isVerified = client.getIsVerified();
    entity.accountIds = client.getAccountIds().length > 0 ? client.getAccountIds() : undefined;
    entity.role = client.getRole();
    entity.isBanned = client.getIsBanned();
    return entity;
  }

  private toDomain(entity: ClientEntity): Client {
    const client = new Client(
      entity.id,
      entity.firstName,
      entity.lastName,
      entity.email,
      entity.passwordHashed,
      entity.isVerified,
      entity.accountIds || [],
      entity.role || 'CLIENT',
      entity.isBanned || false
    );
    return client;
  }
}

