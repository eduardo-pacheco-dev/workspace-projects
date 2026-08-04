import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreelancerDocumentFields1759500000000 implements MigrationInterface {
  name = 'AddFreelancerDocumentFields1759500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'orgaoEmissor',
      'naturalidade',
      'sexo',
      'cnpj',
      'tituloEleitor',
      'rgArquivo',
      'carteiraArquivo',
      'habilitacaoArquivo',
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
      'orgaoEmissor',
      'naturalidade',
      'sexo',
      'cnpj',
      'tituloEleitor',
      'rgArquivo',
      'carteiraArquivo',
      'habilitacaoArquivo',
    ];
    for (const column of columns) {
      await queryRunner.query(`ALTER TABLE freelancer DROP COLUMN ${column}`);
    }
  }
}
