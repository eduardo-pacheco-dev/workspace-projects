import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOrderTelecomFields1756000000002 implements MigrationInterface {
  name = 'AddServiceOrderTelecomFields1756000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_order');
    if (!table) return;

    if (!table.columns.find((c) => c.name === 'siteId')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`siteId\` TEXT NULL`);
    }
    if (!table.columns.find((c) => c.name === 'endId')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`endId\` TEXT NULL`);
    }
    if (!table.columns.find((c) => c.name === 'operadora')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` ADD COLUMN \`operadora\` TEXT NULL`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_order');
    if (!table) return;

    if (table.columns.find((c) => c.name === 'operadora')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`operadora\``);
    }
    if (table.columns.find((c) => c.name === 'endId')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`endId\``);
    }
    if (table.columns.find((c) => c.name === 'siteId')) {
      await queryRunner.query(`ALTER TABLE \`service_order\` DROP COLUMN \`siteId\``);
    }
  }
}
