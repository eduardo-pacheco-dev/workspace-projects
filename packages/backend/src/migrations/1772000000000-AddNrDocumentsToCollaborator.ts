import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNrDocumentsToCollaborator1772000000000 implements MigrationInterface {
  name = 'AddNrDocumentsToCollaborator1772000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN nr10Arquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN nr35Arquivo TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN nr35Arquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN nr10Arquivo`);
  }
}
