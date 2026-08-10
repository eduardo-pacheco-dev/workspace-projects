import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFolderToAttachments1778000000000 implements MigrationInterface {
  name = 'AddFolderToAttachments1778000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN folderId INTEGER NULL`);
    await queryRunner.query(`ALTER TABLE attachment ADD COLUMN isFolder BOOLEAN NOT NULL DEFAULT false`);
    await queryRunner.query(
      `ALTER TABLE attachment ADD CONSTRAINT FK_attachment_folder FOREIGN KEY (folderId) REFERENCES attachment(id) ON DELETE CASCADE`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attachment DROP FOREIGN KEY FK_attachment_folder`);
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN isFolder`);
    await queryRunner.query(`ALTER TABLE attachment DROP COLUMN folderId`);
  }
}
