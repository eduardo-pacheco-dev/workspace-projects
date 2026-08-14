import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        resetToken VARCHAR(255) NULL,
        lastName TEXT NULL,
        phone TEXT NULL,
        status TEXT NOT NULL DEFAULT 'inactive',
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        companyId INTEGER NULL,
        tokenVersion INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS freelancer (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        userId INTEGER NULL,
        firstName VARCHAR(255) NOT NULL DEFAULT '',
        lastName VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(255) NULL,
        phone VARCHAR(255) NULL,
        skills TEXT NULL,
        portfolio TEXT NULL,
        bio TEXT NULL,
        experienceLevel VARCHAR(50) NOT NULL DEFAULT 'junior',
        availability VARCHAR(50) NOT NULL DEFAULT 'available',
        hourlyRate REAL NULL,
        codigo TEXT NULL,
        razaoSocial TEXT NULL,
        tipoContrato TEXT NULL,
        regional TEXT NULL,
        funcao TEXT NULL,
        foto TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        birthDate TEXT NULL,
        cpf TEXT NULL,
        rg TEXT NULL,
        cnh TEXT NULL,
        cnhValidade TEXT NULL,
        pis TEXT NULL,
        whatsapp TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        cep TEXT NULL,
        banco TEXT NULL,
        agencia TEXT NULL,
        conta TEXT NULL,
        tipoConta TEXT NULL,
        pix TEXT NULL,
        titular TEXT NULL,
        trainings TEXT NULL,
        uniforms TEXT NULL,
        epis TEXT NULL,
        orgaoEmissor TEXT NULL,
        naturalidade TEXT NULL,
        sexo TEXT NULL,
        cnpj TEXT NULL,
        tituloEleitor TEXT NULL,
        rgArquivo TEXT NULL,
        carteiraArquivo TEXT NULL,
        habilitacaoArquivo TEXT NULL,
        contatoEmergenciaNome TEXT NULL,
        contatoEmergenciaTelefone TEXT NULL,
        contatoEmergenciaParentesco TEXT NULL,
        dataAso TEXT NULL,
        dataNr06 TEXT NULL,
        dataNr35 TEXT NULL,
        dataNr10 TEXT NULL,
        dataNr75 TEXT NULL,
        dataNr01 TEXT NULL,
        dataIntegracao TEXT NULL,
        dataListaFerramental TEXT NULL,
        cracha TEXT NULL,
        dataHs TEXT NULL,
        dataLtw TEXT NULL,
        dataCadastroNokia TEXT NULL,
        dataCadastroEricsson TEXT NULL,
        dataCadastroTelebit TEXT NULL,
        vencimentoAso TEXT NULL,
        vencimentoNr35 TEXT NULL,
        vencimentoNr10 TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        budget REAL NOT NULL,
        budgetType VARCHAR(50) NOT NULL,
        skills TEXT NOT NULL,
        experienceLevel VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        clientId VARCHAR(255) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS proposal (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        jobId INTEGER NOT NULL,
        coverLetter TEXT NULL,
        proposedBudget REAL NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contract (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        jobId INTEGER NOT NULL,
        terms TEXT NULL,
        startDate DATE NULL,
        endDate DATE NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lpu (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        freelancerId INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT NULL,
        valor REAL NULL,
        data TEXT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS finance_entry (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        paymentMethod TEXT NULL,
        status TEXT NOT NULL DEFAULT 'paid',
        notes TEXT NULL,
        accountId INTEGER NULL,
        recurrence TEXT NULL,
        recurrenceEnd TEXT NULL,
        seriesId TEXT NULL,
        tags TEXT NULL,
        attachment TEXT NULL,
        cardId INTEGER NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS spending_limit (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        category TEXT NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount REAL NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bank_account (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        bank TEXT NULL,
        balance REAL NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS credit_card (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        bank TEXT NULL,
        brand TEXT NULL,
        \`limit\` REAL NOT NULL DEFAULT 0,
        closingDay INTEGER NOT NULL,
        dueDay INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS station (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        endereco TEXT NULL,
        latitude REAL NULL,
        longitude REAL NULL,
        operadora TEXT NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        siteId TEXT NULL,
        endId TEXT NULL,
        elementType TEXT NULL,
        technology TEXT NULL,
        areaHolder TEXT NULL,
        infraContractType TEXT NULL,
        infraHolder TEXT NULL,
        infraType TEXT NULL,
        evType TEXT NULL,
        evSupplier TEXT NULL,
        regional TEXT NULL,
        towerType TEXT NULL,
        nominalAev REAL NULL,
        groundArea REAL NULL,
        structureHeight REAL NULL,
        stationId TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS radio_link (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        frequencia TEXT NULL,
        capacidade TEXT NULL,
        siteIdA TEXT NULL,
        endIdA TEXT NULL,
        enderecoA TEXT NULL,
        latitudeA REAL NULL,
        longitudeA REAL NULL,
        operadoraA TEXT NULL,
        siteIdB TEXT NULL,
        endIdB TEXT NULL,
        enderecoB TEXT NULL,
        latitudeB REAL NULL,
        longitudeB REAL NULL,
        operadoraB TEXT NULL,
        stationAId INTEGER NULL,
        stationBId INTEGER NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        codigo TEXT NULL,
        descricao TEXT NULL,
        cliente TEXT NULL,
        dataInicio TEXT NULL,
        dataFim TEXT NULL,
        observacoes TEXT NULL,
        responsavel TEXT NULL,
        operadora TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_station (
        projectId INTEGER NOT NULL,
        stationId INTEGER NOT NULL,
        PRIMARY KEY (projectId, stationId)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_radio_link (
        projectId INTEGER NOT NULL,
        radioLinkId INTEGER NOT NULL,
        PRIMARY KEY (projectId, radioLinkId)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_document (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        tipo TEXT NULL,
        quantidade INTEGER NOT NULL DEFAULT 1,
        observacoes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS client (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        documento TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        observacoes TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS client_responsavel (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        clientId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        funcao TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_client_responsavel_client FOREIGN KEY (clientId) REFERENCES client(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS service_order (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        numero TEXT NOT NULL,
        cliente TEXT NOT NULL,
        descricao TEXT NULL,
        endereco TEXT NULL,
        dataInicio TEXT NULL,
        dataFim TEXT NULL,
        status TEXT NOT NULL DEFAULT 'aberta',
        observacoes TEXT NULL,
        siteId TEXT NULL,
        endId TEXT NULL,
        operadora TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS service_order_observation (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        serviceOrderId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        filename TEXT NULL,
        originalName TEXT NULL,
        mimetype TEXT NULL,
        size INTEGER NULL,
        position INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS schedule_event (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        description TEXT NULL,
        startAt TEXT NULL,
        endAt TEXT NULL,
        location TEXT NULL,
        client TEXT NULL,
        assignedTo TEXT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        description TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        dueAt TEXT NULL,
        project TEXT NULL,
        client TEXT NULL,
        assignedTo TEXT NULL,
        parentId INTEGER NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_project (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        description TEXT NULL,
        startDate TEXT NULL,
        endDate TEXT NULL,
        durationDays INT NULL,
        status TEXT NOT NULL DEFAULT 'not_started',
        workingDays TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_task (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        name TEXT NOT NULL,
        durationDays INT NOT NULL DEFAULT 1,
        milestone BOOLEAN NOT NULL DEFAULT FALSE,
        percentComplete INT NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'medium',
        notes TEXT NULL,
        startDate TEXT NULL,
        finishDate TEXT NULL,
        critical BOOLEAN NOT NULL DEFAULT FALSE,
        position INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_dependency (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        taskId INT NOT NULL,
        predecessorTaskId INT NOT NULL,
        type TEXT NOT NULL DEFAULT 'FS',
        lagDays INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_resource (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'work',
        email TEXT NULL,
        maxUnits INT NOT NULL DEFAULT 100,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mp_assignment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        projectId INT NOT NULL,
        taskId INT NOT NULL,
        resourceId INT NOT NULL,
        units INT NOT NULL DEFAULT 100,
        work INT NULL,
        actualWork INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT NULL,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        cnpj TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        ativa TINYINT(1) NOT NULL DEFAULT 1,
        observacoes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_collaborator (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        companyId INTEGER NOT NULL,
        nome TEXT NOT NULL,
        cargo TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_freelancer (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        companyId INTEGER NOT NULL,
        freelancerId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (companyId, freelancerId)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_project (
        projectId INTEGER NOT NULL,
        companyId INTEGER NOT NULL,
        PRIMARY KEY (projectId, companyId)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS collaborator (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        codigo TEXT NULL,
        nome TEXT NOT NULL,
        cpf TEXT NULL,
        cargo TEXT NULL,
        email TEXT NULL,
        telefone TEXT NULL,
        endereco TEXT NULL,
        cidade TEXT NULL,
        uf TEXT NULL,
        dataAdmissao TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        companyId INTEGER NULL,
        isFreelancer TINYINT(1) NOT NULL DEFAULT 0,
        userId INTEGER NULL,
        razaoSocial TEXT NULL,
        tipoContrato TEXT NULL,
        regional TEXT NULL,
        funcao TEXT NULL,
        foto TEXT NULL,
        firstName TEXT NULL,
        lastName TEXT NULL,
        birthDate TEXT NULL,
        rg TEXT NULL,
        orgaoEmissor TEXT NULL,
        naturalidade TEXT NULL,
        sexo TEXT NULL,
        cnpj TEXT NULL,
        tituloEleitor TEXT NULL,
        rgArquivo TEXT NULL,
        carteiraArquivo TEXT NULL,
        habilitacaoArquivo TEXT NULL,
        cnh TEXT NULL,
        cnhValidade TEXT NULL,
        pis TEXT NULL,
        phone TEXT NULL,
        whatsapp TEXT NULL,
        contatoEmergenciaNome TEXT NULL,
        contatoEmergenciaTelefone TEXT NULL,
        contatoEmergenciaParentesco TEXT NULL,
        cep TEXT NULL,
        banco TEXT NULL,
        agencia TEXT NULL,
        conta TEXT NULL,
        tipoConta TEXT NULL,
        pix TEXT NULL,
        titular TEXT NULL,
        trainings TEXT NULL,
        dataAso TEXT NULL,
        dataNr06 TEXT NULL,
        dataNr35 TEXT NULL,
        dataNr10 TEXT NULL,
        dataNr75 TEXT NULL,
        dataNr01 TEXT NULL,
        dataIntegracao TEXT NULL,
        dataListaFerramental TEXT NULL,
        cracha TEXT NULL,
        dataHs TEXT NULL,
        dataLtw TEXT NULL,
        dataCadastroNokia TEXT NULL,
        dataCadastroEricsson TEXT NULL,
        dataCadastroTelebit TEXT NULL,
        vencimentoAso TEXT NULL,
        vencimentoNr35 TEXT NULL,
        vencimentoNr10 TEXT NULL,
        nr10Arquivo TEXT NULL,
        nr35Arquivo TEXT NULL,
        asoArquivo TEXT NULL,
        epiArquivo TEXT NULL,
        ordemServicoArquivo TEXT NULL,
        contratoArquivo TEXT NULL,
        uniforms TEXT NULL,
        epis TEXT NULL,
        bio TEXT NULL,
        hourlyRate REAL NULL,
        skills TEXT NULL,
        portfolio TEXT NULL,
        experienceLevel TEXT NULL,
        availability TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team_member (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        teamId INTEGER NOT NULL,
        collaboratorId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (teamId, collaboratorId)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attachment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        jobId INTEGER NULL,
        serviceOrderId INTEGER NULL,
        stationId INTEGER NULL,
        radioLinkId INTEGER NULL,
        projectId INTEGER NULL,
        clientId INTEGER NULL,
        companyId INTEGER NULL,
        taskId INTEGER NULL,
        folderId INTEGER NULL,
        isFolder BOOLEAN NOT NULL DEFAULT false,
        filename VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_attachment_folder FOREIGN KEY (folderId) REFERENCES attachment(id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS comment (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        jobId INTEGER NULL,
        serviceOrderId INTEGER NULL,
        stationId INTEGER NULL,
        radioLinkId INTEGER NULL,
        projectId INTEGER NULL,
        clientId INTEGER NULL,
        companyId INTEGER NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL DEFAULT 'Anônimo',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
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

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_comment_serviceOrderId ON comment (serviceOrderId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_attachment_serviceOrderId ON attachment (serviceOrderId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_service_order_observation_so ON service_order_observation (serviceOrderId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_finance_entry_date ON finance_entry (date)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_finance_entry_type ON finance_entry (type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_finance_entry_account ON finance_entry (accountId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_finance_entry_series ON finance_entry (seriesId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_finance_entry_card ON finance_entry (cardId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_spending_limit_period ON spending_limit (year, month)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bank_account_name ON bank_account (name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_category_name ON category (name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_credit_card_name ON credit_card (name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_client_responsavel_clientId ON client_responsavel (clientId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_pdca_projectId ON pdca (projectId)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_pdca_action_pdcaId ON pdca_action (pdcaId)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS pdca_action`);
    await queryRunner.query(`DROP TABLE IF EXISTS pdca`);
    await queryRunner.query(`DROP TABLE IF EXISTS comment`);
    await queryRunner.query(`DROP TABLE IF EXISTS attachment`);
    await queryRunner.query(`DROP TABLE IF EXISTS team_member`);
    await queryRunner.query(`DROP TABLE IF EXISTS team`);
    await queryRunner.query(`DROP TABLE IF EXISTS collaborator`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_project`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_freelancer`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_collaborator`);
    await queryRunner.query(`DROP TABLE IF EXISTS company`);
    await queryRunner.query(`DROP TABLE IF EXISTS settings`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_assignment`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_resource`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_dependency`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_task`);
    await queryRunner.query(`DROP TABLE IF EXISTS mp_project`);
    await queryRunner.query(`DROP TABLE IF EXISTS task`);
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_event`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_order_observation`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_order`);
    await queryRunner.query(`DROP TABLE IF EXISTS client_responsavel`);
    await queryRunner.query(`DROP TABLE IF EXISTS client`);
    await queryRunner.query(`DROP TABLE IF EXISTS project_document`);
    await queryRunner.query(`DROP TABLE IF EXISTS project_radio_link`);
    await queryRunner.query(`DROP TABLE IF EXISTS project_station`);
    await queryRunner.query(`DROP TABLE IF EXISTS project`);
    await queryRunner.query(`DROP TABLE IF EXISTS radio_link`);
    await queryRunner.query(`DROP TABLE IF EXISTS station`);
    await queryRunner.query(`DROP TABLE IF EXISTS credit_card`);
    await queryRunner.query(`DROP TABLE IF EXISTS category`);
    await queryRunner.query(`DROP TABLE IF EXISTS bank_account`);
    await queryRunner.query(`DROP TABLE IF EXISTS spending_limit`);
    await queryRunner.query(`DROP TABLE IF EXISTS finance_entry`);
    await queryRunner.query(`DROP TABLE IF EXISTS lpu`);
    await queryRunner.query(`DROP TABLE IF EXISTS contract`);
    await queryRunner.query(`DROP TABLE IF EXISTS proposal`);
    await queryRunner.query(`DROP TABLE IF EXISTS job`);
    await queryRunner.query(`DROP TABLE IF EXISTS freelancer`);
    await queryRunner.query(`DROP TABLE IF EXISTS user`);
  }
}
