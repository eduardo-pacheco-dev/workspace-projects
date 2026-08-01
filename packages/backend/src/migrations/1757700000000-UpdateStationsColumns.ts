import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStationsColumns1757700000000 implements MigrationInterface {
  name = 'UpdateStationsColumns1757700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE station DROP COLUMN nome`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN codigo`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN tecnologia`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN siteId TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN endId TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE station DROP COLUMN siteId`);
    await queryRunner.query(`ALTER TABLE station DROP COLUMN endId`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN nome TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN codigo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE station ADD COLUMN tecnologia TEXT NULL`);
  }
}
