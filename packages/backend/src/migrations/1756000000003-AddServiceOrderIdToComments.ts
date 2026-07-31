import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOrderIdToComments1756000000003 implements MigrationInterface {
  name = 'AddServiceOrderIdToComments1756000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('comment');
    if (!table) return;

    if (!table.columns.find((c) => c.name === 'serviceOrderId')) {
      await queryRunner.query(
        `ALTER TABLE \`comment\` ADD COLUMN \`serviceOrderId\` INTEGER NULL`,
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS idx_comment_serviceOrderId ON comment (serviceOrderId)`,
      );
    }

    const jobIdColumn = table.columns.find((c) => c.name === 'jobId');
    if (jobIdColumn && jobIdColumn.isNullable === false) {
      await queryRunner.query(`ALTER TABLE \`comment\` MODIFY \`jobId\` INTEGER NULL`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comment_serviceOrderId ON comment`);
    await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`serviceOrderId\``);
  }
}
