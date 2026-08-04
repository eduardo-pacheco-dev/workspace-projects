import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeFreelancerIntoCollaborator1770000000000 implements MigrationInterface {
  name = 'MergeFreelancerIntoCollaborator1770000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN isFreelancer TINYINT(1) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN userId INTEGER NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN razaoSocial TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN tipoContrato TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN regional TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN funcao TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN foto TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN firstName TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN lastName TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN birthDate TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN rg TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN orgaoEmissor TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN naturalidade TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN sexo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN cnpj TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN tituloEleitor TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN rgArquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN carteiraArquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN habilitacaoArquivo TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN cnh TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN cnhValidade TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN pis TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN phone TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN whatsapp TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN contatoEmergenciaNome TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN contatoEmergenciaTelefone TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN contatoEmergenciaParentesco TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN cep TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN banco TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN agencia TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN conta TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN tipoConta TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN pix TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN titular TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN trainings TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataAso TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataNr06 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataNr35 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataNr10 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataNr75 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataNr01 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataIntegracao TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataListaFerramental TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN cracha TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataHs TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataLtw TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataCadastroNokia TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataCadastroEricsson TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN dataCadastroTelebit TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN vencimentoAso TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN vencimentoNr35 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN vencimentoNr10 TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN uniforms TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN epis TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN bio TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN hourlyRate REAL NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN skills TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN portfolio TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN experienceLevel TEXT NULL`);
    await queryRunner.query(`ALTER TABLE collaborator ADD COLUMN availability TEXT NULL`);

    await queryRunner.query(`
      INSERT INTO collaborator (
        isFreelancer, codigo, nome, cpf, cargo, email, telefone, endereco, cidade, uf, dataAdmissao, status, companyId,
        userId, razaoSocial, tipoContrato, regional, funcao, foto, firstName, lastName, birthDate, rg, orgaoEmissor,
        naturalidade, sexo, cnpj, tituloEleitor, rgArquivo, carteiraArquivo, habilitacaoArquivo, cnh, cnhValidade, pis,
        phone, whatsapp, contatoEmergenciaNome, contatoEmergenciaTelefone, contatoEmergenciaParentesco, cep, banco,
        agencia, conta, tipoConta, pix, titular, trainings, dataAso, dataNr06, dataNr35, dataNr10, dataNr75, dataNr01,
        dataIntegracao, dataListaFerramental, cracha, dataHs, dataLtw, dataCadastroNokia, dataCadastroEricsson,
        dataCadastroTelebit, vencimentoAso, vencimentoNr35, vencimentoNr10, uniforms, epis, bio, hourlyRate, skills,
        portfolio, experienceLevel, availability, createdAt, updatedAt
      )
      SELECT
        1, codigo,
        CASE WHEN firstName IS NULL OR lastName IS NULL THEN COALESCE(firstName, lastName)
             ELSE CONCAT(firstName, ' ', lastName) END,
        cpf, funcao, email, phone, endereco, cidade, uf, NULL, status,
        (SELECT MIN(id) FROM company), userId, razaoSocial, tipoContrato, regional, funcao, foto, firstName, lastName,
        birthDate, rg, orgaoEmissor, naturalidade, sexo, cnpj, tituloEleitor, rgArquivo, carteiraArquivo,
        habilitacaoArquivo, cnh, cnhValidade, pis, phone, whatsapp, contatoEmergenciaNome, contatoEmergenciaTelefone,
        contatoEmergenciaParentesco, cep, banco, agencia, conta, tipoConta, pix, titular, trainings, dataAso, dataNr06,
        dataNr35, dataNr10, dataNr75, dataNr01, dataIntegracao, dataListaFerramental, cracha, dataHs, dataLtw,
        dataCadastroNokia, dataCadastroEricsson, dataCadastroTelebit, vencimentoAso, vencimentoNr35, vencimentoNr10,
        uniforms, epis, bio, hourlyRate, skills, portfolio, experienceLevel, availability, createdAt, updatedAt
      FROM freelancer
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM collaborator WHERE isFreelancer = 1`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN availability`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN experienceLevel`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN portfolio`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN skills`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN hourlyRate`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN bio`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN epis`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN uniforms`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN vencimentoNr10`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN vencimentoNr35`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN vencimentoAso`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataCadastroTelebit`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataCadastroEricsson`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataCadastroNokia`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataLtw`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataHs`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN cracha`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataListaFerramental`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataIntegracao`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataNr01`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataNr75`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataNr10`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataNr35`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataNr06`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN dataAso`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN trainings`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN titular`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN pix`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN tipoConta`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN conta`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN agencia`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN banco`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN cep`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN contatoEmergenciaParentesco`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN contatoEmergenciaTelefone`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN contatoEmergenciaNome`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN whatsapp`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN phone`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN pis`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN cnhValidade`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN cnh`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN habilitacaoArquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN carteiraArquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN rgArquivo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN tituloEleitor`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN cnpj`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN sexo`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN naturalidade`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN orgaoEmissor`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN rg`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN birthDate`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN lastName`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN firstName`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN foto`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN funcao`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN regional`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN tipoContrato`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN razaoSocial`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN userId`);
    await queryRunner.query(`ALTER TABLE collaborator DROP COLUMN isFreelancer`);
  }
}
