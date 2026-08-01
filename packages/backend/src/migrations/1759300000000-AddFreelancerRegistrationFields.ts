import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerRegistrationFields1759300000000 implements MigrationInterface {
  name = 'AddFreelancerRegistrationFields1759300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'birthDate',
      'cpf',
      'rg',
      'cnh',
      'cnhValidade',
      'pis',
      'whatsapp',
      'endereco',
      'cidade',
      'uf',
      'cep',
      'banco',
      'agencia',
      'conta',
      'tipoConta',
      'pix',
      'titular',
      'trainings',
      'uniforms',
      'epis',
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
      'birthDate',
      'cpf',
      'rg',
      'cnh',
      'cnhValidade',
      'pis',
      'whatsapp',
      'endereco',
      'cidade',
      'uf',
      'cep',
      'banco',
      'agencia',
      'conta',
      'tipoConta',
      'pix',
      'titular',
      'trainings',
      'uniforms',
      'epis',
    ];

    for (const column of columns) {
      await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN ${column}`);
    }
  }
}
