import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerTrainingFields1759700000000 implements MigrationInterface {
  name = 'AddFreelancerTrainingFields1759700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'dataAso',
      'dataNr06',
      'dataNr35',
      'dataNr10',
      'dataNr75',
      'dataNr01',
      'dataIntegracao',
      'dataListaFerramental',
      'cracha',
      'dataHs',
      'dataLtw',
      'dataCadastroNokia',
      'dataCadastroEricsson',
      'dataCadastroTelebit',
      'vencimentoAso',
      'vencimentoNr35',
      'vencimentoNr10',
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
      'dataAso',
      'dataNr06',
      'dataNr35',
      'dataNr10',
      'dataNr75',
      'dataNr01',
      'dataIntegracao',
      'dataListaFerramental',
      'cracha',
      'dataHs',
      'dataLtw',
      'dataCadastroNokia',
      'dataCadastroEricsson',
      'dataCadastroTelebit',
      'vencimentoAso',
      'vencimentoNr35',
      'vencimentoNr10',
    ];
    for (const column of columns) {
      await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN ${column}`);
    }
  }
}
