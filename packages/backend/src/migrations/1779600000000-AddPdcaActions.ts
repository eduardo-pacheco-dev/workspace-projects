import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPdcaActions1779600000000 implements MigrationInterface {
  name = 'AddPdcaActions1779600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pdca_action (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        pdcaId INTEGER NOT NULL,
        what TEXT NOT NULL,
        why TEXT NULL,
        ondeAplicacao TEXT NULL,
        whenInicio TEXT NULL,
        whenPrazo TEXT NULL,
        who TEXT NULL,
        how TEXT NULL,
        howMuch DECIMAL(12,2) NULL,
        status TEXT NOT NULL DEFAULT 'pendente',
        progresso INTEGER NOT NULL DEFAULT 0,
        observacoes TEXT NULL,
        dataInicioReal TEXT NULL,
        dataConclusaoReal TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_pdca_action_pdca FOREIGN KEY (pdcaId) REFERENCES pdca(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_pdca_action_pdcaId ON pdca_action (pdcaId)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS pdca_action`);
  }
}
