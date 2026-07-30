import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerBioPortfolio1700000000001 implements MigrationInterface {
  name = 'AddFreelancerBioPortfolio1700000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('freelancer');
    if (!table) return;

    const hasBio = table.columns.find((c) => c.name === 'bio');
    if (!hasBio) {
      await queryRunner.query(`ALTER TABLE freelancer ADD COLUMN bio TEXT NULL`);
    }

    const hasPortfolio = table.columns.find((c) => c.name === 'portfolio');
    if (!hasPortfolio) {
      await queryRunner.query(`ALTER TABLE freelancer ADD COLUMN portfolio TEXT NULL`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN IF EXISTS portfolio`);
    await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN IF EXISTS bio`);
  }
}
