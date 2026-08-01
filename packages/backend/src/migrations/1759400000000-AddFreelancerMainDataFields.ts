import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerMainDataFields1759400000000 implements MigrationInterface {
  name = 'AddFreelancerMainDataFields1759400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = ['codigo', 'razaoSocial', 'tipoContrato', 'regional', 'funcao', 'foto', 'status'];

    for (const column of columns) {
      const rows = await queryRunner.query(
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'freelancer' AND COLUMN_NAME = ?`,
        [column],
      );
      const count = Number(rows?.[0]?.c ?? 0);
      if (count === 0) {
        if (column === 'status') {
          await queryRunner.query(`ALTER TABLE freelancer ADD COLUMN status TEXT NOT NULL DEFAULT 'ativo'`);
        } else {
          await queryRunner.query(`ALTER TABLE freelancer ADD COLUMN ${column} TEXT NULL`);
        }
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const columns = ['codigo', 'razaoSocial', 'tipoContrato', 'regional', 'funcao', 'foto', 'status'];
    for (const column of columns) {
      await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN ${column}`);
    }
  }
}
