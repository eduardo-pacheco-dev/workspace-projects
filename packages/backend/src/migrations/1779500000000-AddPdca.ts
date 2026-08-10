import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPdca1779500000000 implements MigrationInterface {
  name = 'AddPdca1779500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pdca (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INTEGER NULL,
        titulo TEXT NOT NULL,
        problema TEXT NULL,
        impacto TEXT NULL,
        areaSetor TEXT NULL,
        responsavelCiclo TEXT NULL,
        tecnicaAnalise TEXT NULL,
        causaRaiz TEXT NULL,
        meta TEXT NULL,
        fase TEXT NOT NULL DEFAULT 'plan',
        statusCiclo TEXT NOT NULL DEFAULT 'aberto',
        resultadoCheck TEXT NULL,
        kpi TEXT NULL,
        resultadoMedicao TEXT NULL,
        statusValidacao TEXT NULL,
        dataVerificacao TEXT NULL,
        responsavelValidacao TEXT NULL,
        decisoesAct TEXT NULL,
        pop TEXT NULL,
        licaoAprendida TEXT NULL,
        observacoes TEXT NULL,
        dataConclusao TEXT NULL,
        cicloPaiId INTEGER NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_pdca_project FOREIGN KEY (projectId) REFERENCES project(id) ON DELETE CASCADE,
        CONSTRAINT FK_pdca_cicloPai FOREIGN KEY (cicloPaiId) REFERENCES pdca(id) ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_pdca_projectId ON pdca (projectId)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS pdca`);
  }
}
