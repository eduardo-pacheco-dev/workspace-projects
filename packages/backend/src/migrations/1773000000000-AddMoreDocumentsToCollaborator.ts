import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoreDocumentsToCollaborator1773000000000 implements MigrationInterface {
  name = 'AddMoreDocumentsToCollaborator1773000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN asoArquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN epiArquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN ordemServicoArquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN contratoArquivo TEXT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN contratoArquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN ordemServicoArquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN epiArquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN asoArquivo`);
  }
}
