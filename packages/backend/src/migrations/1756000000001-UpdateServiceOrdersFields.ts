import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServiceOrdersFields1756000000001 implements MigrationInterface {
  name = 'UpdateServiceOrdersFields1756000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_order');
    if (!table) return;

    if (!table.columns.find((c) => c.name === 'dataInicio')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`dataInicio\` TEXT NULL`);
    }
    if (!table.columns.find((c) => c.name === 'dataFim')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`dataFim\` TEXT NULL`);
    }
    if (table.columns.find((c) => c.name === 'data')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`data\``);
    }
    if (table.columns.find((c) => c.name === 'valor')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`valor\``);
    }
    await queryRunner.query(`ALTER TABLE \`service_order\` MODIFY \`descricao\` TEXT NULL`);

    const rowCount = await queryRunner.query(
      `SELECT COUNT(*) AS count FROM \`service_order\` WHERE \`numero\` IS NULL OR \`numero\` = ''`,
    );
    const count = Number((rowCount[0] as { count: string | number })?.count ?? 0);
    if (count > 0) {
      await queryRunner.query(
        `UPDATE \`service_order\` SET \`numero\` = CONCAT('OS-', LPAD(id, 3, '0')) WHERE \`numero\` IS NULL OR \`numero\` = ''`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_order');
    if (!table) return;

    if (table.columns.find((c) => c.name === 'dataFim')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`dataFim\``);
    }
    if (table.columns.find((c) => c.name === 'dataInicio')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`dataInicio\``);
    }
    if (!table.columns.find((c) => c.name === 'data')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`data\` TEXT NULL`);
    }
    if (!table.columns.find((c) => c.name === 'valor')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`valor\` REAL NULL`);
    }
  }
}
