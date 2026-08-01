import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerEmergencyContact1759600000000 implements MigrationInterface {
  name = 'AddFreelancerEmergencyContact1759600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'contatoEmergenciaNome',
      'contatoEmergenciaTelefone',
      'contatoEmergenciaParentesco',
    ];

    for (const column of columns) {
      const rows = await queryRunner.query(
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'freelancer' AND COLUMN_NAME = ?`,
        [column],
      );
      const count = Number(rows?.[0]?.c ?? 0);
      if (count === 0) {
        await queryRunner.query(`ALTER TABLE freelancer ADD COLUMN ${column} TEXT NULL`);
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'contatoEmergenciaNome',
      'contatoEmergenciaTelefone',
      'contatoEmergenciaParentesco',
    ];
    for (const column of columns) {
      await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN ${column}`);
    }
  }
}
