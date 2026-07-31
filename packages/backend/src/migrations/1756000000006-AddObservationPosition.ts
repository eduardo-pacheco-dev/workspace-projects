import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObservationPosition1756000000006 implements MigrationInterface {
  name = 'AddObservationPosition1756000000006';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_order_observation');
    if (!table) return;

    if (!table.columns.find((c) => c.name === 'position')) {
      await queryRunner.query(
        `ALTER TABLE \`service_order_observation\` ADD COLUMN \`position\` INTEGER NOT NULL DEFAULT 0`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_order_observation');
    if (!table) return;

    if (table.columns.find((c) => c.name === 'position')) {
      await queryRunner.query(`ALTER TABLE \`service_order_observation\` DROP COLUMN \`position\``);
    }
  }
}
