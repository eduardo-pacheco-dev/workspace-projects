import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOrderIdToAttachments1756000000004 implements MigrationInterface {
  name = 'AddServiceOrderIdToAttachments1756000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('attachment');
    if (!table) return;

    if (!table.columns.find((c) => c.name === 'serviceOrderId')) {
      await queryRunner.query(
        `ALTER TABLE \`attachment\` ADD COLUMN \`serviceOrderId\` INTEGER NULL`,
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS idx_attachment_serviceOrderId ON attachment (serviceOrderId)`,
      );
    }

    const jobIdColumn = table.columns.find((c) => c.name === 'jobId');
    if (jobIdColumn && jobIdColumn.isNullable === false) {
      await queryRunner.query(`ALTER TABLE \`attachment\` MODIFY \`jobId\` INTEGER NULL`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_attachment_serviceOrderId ON attachment`);
    await queryRunner.query(`ALTER TABLE \`attachment\` DROP COLUMN \`serviceOrderId\``);
  }
}
