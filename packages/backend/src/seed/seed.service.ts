import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { FreelancersService } from '../freelancers/freelancers.service';
import { JobsService } from '../jobs/jobs.service';
import { LpuService } from '../lpu/lpu.service';
import { ScheduleService } from '../schedule/schedule.service';
import { CreateScheduleEventInput } from '../schedule/schedule-event.schemas';
import { TaskService } from '../tasks/task.service';
import { CreateTaskInput } from '../tasks/task.schemas';
import { MsProjectService } from '../ms-project/ms-project.service';
import { SettingsService } from '../settings/settings.service';
import { CompanyService } from '../companies/company.service';
import { CompanyCollaboratorService } from '../companies/company-collaborator.service';
import { CompanyFreelancerService } from '../companies/company-freelancer.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CommentsService } from '../comments/comments.service';
import { ProjectsService } from '../projects/projects.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    private readonly freelancersService: FreelancersService,
    private readonly jobsService: JobsService,
    private readonly lpuService: LpuService,
    private readonly scheduleService: ScheduleService,
    private readonly taskService: TaskService,
    private readonly msProjectService: MsProjectService,
    private readonly settingsService: SettingsService,
    private readonly companyService: CompanyService,
    private readonly companyCollaboratorService: CompanyCollaboratorService,
    private readonly companyFreelancerService: CompanyFreelancerService,
    private readonly attachmentsService: AttachmentsService,
    private readonly commentsService: CommentsService,
    private readonly projectsService: ProjectsService,
    private readonly collaboratorsService: CollaboratorsService,
  ) {}

  async onApplicationBootstrap() {
    const enabled = process.env.NODE_ENV !== 'production' || process.env.SEED === 'true';
    if (!enabled) return;

    await this.seedAdmin();
    await this.seedFreelancers();
    await this.seedJobs();
    await this.seedLpus();
    await this.seedScheduleEvents();
    await this.seedTasks();
    await this.seedMsProject();
    await this.seedSettings();
    await this.seedCompanies();
    await this.seedUsers();
    await this.seedCompanyMembers();
    await this.seedCompanyProjects();
    await this.seedCollaborators();
    await this.seedAttachments();
    await this.seedComments();
  }

  private async seedAdmin() {
    const admin = await this.usersService.findByEmail('admin@admin.com');
    if (admin) return;

    const hashedPassword = await bcrypt.hash('123456', 10);
    await this.usersService.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'master',
      companyId: null,
    });

    console.log('Seed: admin user created (admin@admin.com / 123456)');
  }

  private async seedFreelancers() {
    const { total } = await this.freelancersService.findAll({ limit: 1 });
    if (total > 0) return;

    const freelancers = [
      {
        firstName: 'Carlos',
        lastName: 'Silva',
        email: 'carlos.silva@example.com',
        bio: 'Engenheiro de telecomunicações com 10 anos de experiência em redes de acesso rádio (ERBS) e enlaces ponto a ponto.',
        hourlyRate: 150,
        skills: JSON.stringify(['Radio Link', 'ERBS', '4G', '5G', 'Antenas']),
        portfolio: JSON.stringify([]),
        experienceLevel: 'senior',
        availability: 'available',
      },
      {
        firstName: 'Mariana',
        lastName: 'Oliveira',
        email: 'mariana.oliveira@example.com',
        bio: 'Especialista em planejamento e otimização de redes móveis, com foco em cobertura e capacidade.',
        hourlyRate: 130,
        skills: JSON.stringify(['Planejamento de Rede', 'Otimização', 'Drive Test', 'LTE']),
        portfolio: JSON.stringify([]),
        experienceLevel: 'senior',
        availability: 'busy',
      },
      {
        firstName: 'Rafael',
        lastName: 'Santos',
        email: 'rafael.santos@example.com',
        bio: 'Técnico em telecomunicações especializado em instalação e configuração de rádios e antenas.',
        hourlyRate: 80,
        skills: JSON.stringify(['Instalação', 'Antenas', 'Rádios', 'Fibra Óptica']),
        portfolio: JSON.stringify([]),
        experienceLevel: 'pleno',
        availability: 'available',
      },
      {
        firstName: 'Ana',
        lastName: 'Pereira',
        email: 'ana.pereira@example.com',
        bio: 'Desenvolvedora de software para sistemas de telecomunicações e integrações com APIs de operadoras.',
        hourlyRate: 110,
        skills: JSON.stringify(['Software', 'Integração', 'APIs', 'Node.js']),
        portfolio: JSON.stringify([]),
        experienceLevel: 'pleno',
        availability: 'unavailable',
      },
      {
        firstName: 'João',
        lastName: 'Lima',
        email: 'joao.lima@example.com',
        bio: 'Engenheiro júnior em formação, atua com suporte a projetos de implantação de estações.',
        hourlyRate: 55,
        skills: JSON.stringify(['Suporte', 'ERBS', 'Documentação']),
        portfolio: JSON.stringify([]),
        experienceLevel: 'junior',
        availability: 'available',
      },
    ];

    for (const freelancer of freelancers) {
      await this.freelancersService.create(freelancer);
    }

    console.log(`Seed: ${freelancers.length} freelancers created`);
  }

  private async seedJobs() {
    const { total } = await this.jobsService.findAll({ limit: 1 });
    if (total > 0) return;

    const jobs = [
      {
        title: 'Instalação de ERBS na Região Norte',
        description: 'Instalação de estação rádio base (ERBS) incluindo montagem, cabeamento e testes de comissionamento.',
        budget: 25000,
        budgetType: 'fixed',
        skills: JSON.stringify(['ERBS', 'Instalação', 'Antenas', 'Testes']),
        experienceLevel: 'senior',
        status: 'open',
        clientId: 'seed-client-001',
      },
      {
        title: 'Configuração de Enlace de Rádio 5.8 GHz',
        description: 'Planejamento e configuração de enlace ponto a ponto na frequência de 5.8 GHz entre duas estações.',
        budget: 80,
        budgetType: 'hourly',
        skills: JSON.stringify(['Radio Link', 'Configuração', 'Antenas']),
        experienceLevel: 'mid',
        status: 'open',
        clientId: 'seed-client-001',
      },
      {
        title: 'Otimização de Rede LTE',
        description: 'Análise de drive test e otimização de parâmetros de rede LTE para melhoria de cobertura e capacidade.',
        budget: 90,
        budgetType: 'hourly',
        skills: JSON.stringify(['Otimização', 'LTE', 'Drive Test']),
        experienceLevel: 'senior',
        status: 'in_progress',
        clientId: 'seed-client-002',
      },
      {
        title: 'Suporte à Implantação de Fibra Óptica',
        description: 'Acompanhamento e suporte técnico durante a implantação de rede de fibra óptica em condomínios.',
        budget: 12000,
        budgetType: 'fixed',
        skills: JSON.stringify(['Fibra Óptica', 'Suporte', 'Instalação']),
        experienceLevel: 'mid',
        status: 'completed',
        clientId: 'seed-client-003',
      },
      {
        title: 'Planejamento de Cobertura 5G',
        description: 'Elaboração de estudo de viabilidade e planejamento de cobertura para novas células 5G.',
        budget: 100,
        budgetType: 'hourly',
        skills: JSON.stringify(['5G', 'Planejamento', 'Cobertura']),
        experienceLevel: 'lead',
        status: 'open',
        clientId: 'seed-client-002',
      },
      {
        title: 'Comissionamento de Rádio Link 11 GHz',
        description: 'Comissionamento e alinhamento de enlace de rádio de 11 GHz com ajuste de potência e taxa de erro.',
        budget: 150,
        budgetType: 'hourly',
        skills: JSON.stringify(['Radio Link', 'Comissionamento', '11GHz']),
        experienceLevel: 'senior',
        status: 'open',
        clientId: 'seed-client-004',
      },
      {
        title: 'Implantação de Antenas em Torre de Telecom',
        description: 'Implantação e fixação de antenas setoriais e parabólicas em torre de 60 metros.',
        budget: 18000,
        budgetType: 'fixed',
        skills: JSON.stringify(['Antenas', 'Torre', 'Instalação']),
        experienceLevel: 'mid',
        status: 'in_progress',
        clientId: 'seed-client-005',
      },
      {
        title: 'Migração de Rede 4G para 5G NSA',
        description: 'Migração de células 4G para 5G NSA incluindo reconfiguração de BTS e testes de throughput.',
        budget: 22000,
        budgetType: 'fixed',
        skills: JSON.stringify(['5G', 'Migração', 'BTS', 'Testes']),
        experienceLevel: 'senior',
        status: 'open',
        clientId: 'seed-client-001',
      },
      {
        title: 'Levantamento Topográfico para ERBS',
        description: 'Levantamento topográfico e estudo de visada para implantação de nova estação rádio base.',
        budget: 75,
        budgetType: 'hourly',
        skills: JSON.stringify(['Topografia', 'Visada', 'ERBS']),
        experienceLevel: 'junior',
        status: 'open',
        clientId: 'seed-client-003',
      },
      {
        title: 'Manutenção Preventiva de Estações',
        description: 'Realização de manutenção preventiva em estações rádio base: limpeza, aperto de conectores e medições.',
        budget: 9500,
        budgetType: 'fixed',
        skills: JSON.stringify(['Manutenção', 'ERBS', 'Medições']),
        experienceLevel: 'mid',
        status: 'completed',
        clientId: 'seed-client-002',
      },
      {
        title: 'Configuração de Roteamento em Núcleo de Rede',
        description: 'Configuração de roteamento e comutação no núcleo da rede para suportar novos enlaces.',
        budget: 110,
        budgetType: 'hourly',
        skills: JSON.stringify(['Roteamento', 'Núcleo', 'Switching']),
        experienceLevel: 'senior',
        status: 'open',
        clientId: 'seed-client-006',
      },
      {
        title: 'Teste de Aceitação de Nova Estação',
        description: 'Execução de testes de aceitação (SAT/UAT) em estação recém-instalada com geração de relatório.',
        budget: 130,
        budgetType: 'hourly',
        skills: JSON.stringify(['Testes', 'SAT', 'UAT', 'Relatório']),
        experienceLevel: 'mid',
        status: 'in_progress',
        clientId: 'seed-client-004',
      },
      {
        title: 'Elaboração de Projeto de Infraestrutura',
        description: 'Elaboração de projeto executivo de infraestrutura de telecomunicações para novo site.',
        budget: 16000,
        budgetType: 'fixed',
        skills: JSON.stringify(['Projeto', 'Infraestrutura', 'Site']),
        experienceLevel: 'senior',
        status: 'open',
        clientId: 'seed-client-007',
      },
      {
        title: 'Atualização de Software de BTS',
        description: 'Atualização de firmware e software de BTS com acompanhamento e rollback em caso de falha.',
        budget: 85,
        budgetType: 'hourly',
        skills: JSON.stringify(['BTS', 'Software', 'Firmware']),
        experienceLevel: 'mid',
        status: 'completed',
        clientId: 'seed-client-001',
      },
      {
        title: 'Análise de Interferência em Enlaces',
        description: 'Análise e mitigação de interferência em enlaces de rádio ponto a ponto e ponto multiponto.',
        budget: 95,
        budgetType: 'hourly',
        skills: JSON.stringify(['Interferência', 'Radio Link', 'Análise']),
        experienceLevel: 'senior',
        status: 'open',
        clientId: 'seed-client-008',
      },
      {
        title: 'Instalação de CFTV em Site de Telecom',
        description: 'Instalação de sistema de CFTV e controle de acesso em estação rádio base.',
        budget: 7200,
        budgetType: 'fixed',
        skills: JSON.stringify(['CFTV', 'Instalação', 'Acesso']),
        experienceLevel: 'junior',
        status: 'open',
        clientId: 'seed-client-005',
      },
      {
        title: 'Dimensionamento de Baterias e Energia',
        description: 'Estudo e dimensionamento do sistema de energia e baterias para estação de telecomunicações.',
        budget: 105,
        budgetType: 'hourly',
        skills: JSON.stringify(['Energia', 'Baterias', 'Dimensionamento']),
        experienceLevel: 'lead',
        status: 'open',
        clientId: 'seed-client-006',
      },
      {
        title: 'Conectorização de Cabos de Fibra',
        description: 'Conectorização e emenda de cabos de fibra óptica em DIOs e bandejas de distribuição.',
        budget: 60,
        budgetType: 'hourly',
        skills: JSON.stringify(['Fibra Óptica', 'Conectorização', 'Emenda']),
        experienceLevel: 'mid',
        status: 'in_progress',
        clientId: 'seed-client-003',
      },
      {
        title: 'Georreferenciamento de Sites',
        description: 'Levantamento georreferenciado das coordenadas de todos os sites de um cluster da operadora.',
        budget: 9800,
        budgetType: 'fixed',
        skills: JSON.stringify(['GPS', 'Georreferenciamento', 'Sites']),
        experienceLevel: 'junior',
        status: 'open',
        clientId: 'seed-client-002',
      },
      {
        title: 'Revisão de Inventário de Equipamentos',
        description: 'Revisão e atualização do inventário de equipamentos ativos e passivos das estações.',
        budget: 70,
        budgetType: 'hourly',
        skills: JSON.stringify(['Inventário', 'Equipamentos', 'Documentação']),
        experienceLevel: 'junior',
        status: 'completed',
        clientId: 'seed-client-007',
      },
    ];

    for (const job of jobs) {
      await this.jobsService.create(job);
    }

    console.log(`Seed: ${jobs.length} jobs created`);
  }

  private async seedLpus() {
    const { data: freelancers } = await this.freelancersService.findAll({ limit: 100 });
    if (freelancers.length === 0) return;

    for (const freelancer of freelancers) {
      const existing = await this.lpuService.findAllByFreelancer(freelancer.id);
      if (existing.length > 0) return;
    }

    const lpus = [
      {
        freelancerIndex: 0,
        nome: 'ERBS Centro - Cobertura 4G',
        descricao: 'Prestação de utilidade na estação rádio base do centro, incluindo otimização de cobertura 4G.',
        valor: 150,
        data: '2026-08-05',
      },
      {
        freelancerIndex: 0,
        nome: 'Radio Link Torre Norte',
        descricao: 'Acompanhamento de alinhamento e configuração de enlace de rádio na torre norte.',
        valor: 160,
        data: '2026-08-12',
      },
      {
        freelancerIndex: 1,
        nome: 'Drive Test Zona Sul',
        descricao: 'Execução de drive test e coleta de métricas de rede móvel na zona sul.',
        valor: 130,
        data: '2026-08-08',
      },
      {
        freelancerIndex: 2,
        nome: 'Instalação Antena Bairro Industrial',
        descricao: 'Instalação de antena setorial e cabo em estação no bairro industrial.',
        valor: 80,
        data: '2026-08-10',
      },
      {
        freelancerIndex: 3,
        nome: 'Integração API Operadora',
        descricao: 'Desenvolvimento de integração entre o sistema interno e a API da operadora.',
        valor: 110,
        data: '2026-08-15',
      },
      {
        freelancerIndex: 4,
        nome: 'Documentação de Implantação',
        descricao: 'Elaboração de documentação técnica do processo de implantação de ERBS.',
        valor: 55,
        data: '2026-08-03',
      },
    ];

    for (const lpu of lpus) {
      const freelancer = freelancers[lpu.freelancerIndex];
      if (!freelancer) continue;
      await this.lpuService.create({
        freelancerId: freelancer.id,
        nome: lpu.nome,
        descricao: lpu.descricao,
        valor: lpu.valor,
        data: lpu.data,
        status: 'ativo',
      });
    }

    console.log(`Seed: ${lpus.length} lpus created`);
  }

  private async seedScheduleEvents() {
    const { total } = await this.scheduleService.findAll({ limit: 1 });
    if (total > 0) return;

    const events: CreateScheduleEventInput[] = [
      {
        title: 'Manutenção preventiva ERBS Centro',
        description: 'Limpeza, aperto de conectores e medições de potência na estação rádio base do centro.',
        startAt: '2026-08-03T09:00',
        endAt: '2026-08-03T11:00',
        location: 'ERBS Centro - Rua das Flores, 120',
        client: 'Operadora Alpha',
        assignedTo: 'Carlos Silva',
        status: 'scheduled',
      },
      {
        title: 'Alinhamento Radio Link Torre Norte',
        description: 'Alinhamento de enlace ponto a ponto e ajuste de potência na torre norte.',
        startAt: '2026-08-03T14:00',
        endAt: '2026-08-03T16:00',
        location: 'Torre Norte - Rodovia BR-101',
        client: 'Operadora Alpha',
        assignedTo: 'Rafael Santos',
        status: 'confirmed',
      },
      {
        title: 'Drive Test Zona Sul',
        description: 'Coleta de métricas de cobertura e qualidade na região sul da cidade.',
        startAt: '2026-08-04T08:00',
        endAt: '2026-08-04T12:00',
        location: 'Zona Sul',
        client: 'Operadora Beta',
        assignedTo: 'Mariana Oliveira',
        status: 'in_progress',
      },
      {
        title: 'Reunião de planejamento 5G',
        description: 'Definição de cronograma e escopo para implantação das novas células 5G.',
        startAt: '2026-08-05T10:00',
        endAt: '2026-08-05T11:00',
        location: 'Escritório Central - Sala 2',
        client: 'Operadora Alpha',
        assignedTo: 'Mariana Oliveira',
        status: 'confirmed',
      },
      {
        title: 'Instalação de antena no bairro industrial',
        description: 'Instalação de antena setorial e cabo de alimentação na estação do bairro industrial.',
        startAt: '2026-08-06T08:00',
        endAt: '2026-08-06T17:00',
        location: 'Bairro Industrial - Av. das Indústrias, 850',
        client: 'Operadora Gamma',
        assignedTo: 'Rafael Santos',
        status: 'scheduled',
      },
      {
        title: 'Comissionamento Radio Link 11 GHz',
        description: 'Comissionamento e testes de throughput do enlace de 11 GHz recém-instalado.',
        startAt: '2026-08-07T09:00',
        endAt: '2026-08-07T12:00',
        location: 'Site Morro do Cruzeiro',
        client: 'Operadora Beta',
        assignedTo: 'Carlos Silva',
        status: 'confirmed',
      },
      {
        title: 'Atualização de software de BTS',
        description: 'Atualização de firmware da BTS com acompanhamento remoto e plano de rollback.',
        startAt: '2026-08-08T22:00',
        endAt: '2026-08-08T23:30',
        location: 'ERBS Vila Nova (remoto)',
        client: 'Operadora Alpha',
        assignedTo: 'Carlos Silva',
        status: 'scheduled',
      },
      {
        title: 'Teste de aceitação de estação nova',
        description: 'Execução de testes SAT/UAT na estação recém-instalada e emissão de relatório.',
        startAt: '2026-08-10T09:00',
        endAt: '2026-08-10T12:00',
        location: 'Site Jardim América',
        client: 'Operadora Gamma',
        assignedTo: 'Carlos Silva',
        status: 'completed',
      },
      {
        title: 'Visita técnica ao cliente',
        description: 'Visita para levantamento de necessidades e validação de projeto de infraestrutura.',
        startAt: '2026-08-11T13:00',
        endAt: '2026-08-11T15:00',
        location: 'Sede do Cliente - Centro',
        client: 'Cliente Beta',
        assignedTo: 'Ana Pereira',
        status: 'confirmed',
      },
      {
        title: 'Migração 4G para 5G NSA',
        description: 'Janela de migração das células 4G para 5G NSA com reconfiguração de BTS.',
        startAt: '2026-08-12T02:00',
        endAt: '2026-08-12T05:00',
        location: 'Núcleo de Rede (remoto)',
        client: 'Operadora Alpha',
        assignedTo: 'Carlos Silva',
        status: 'in_progress',
      },
      {
        title: 'Entrega de relatório de aceitação',
        description: 'Apresentação do relatório de testes de aceitação para a operadora.',
        startAt: '2026-08-14T09:00',
        endAt: '2026-08-14T10:00',
        location: 'Escritório Central - Sala 1',
        client: 'Operadora Gamma',
        assignedTo: 'Carlos Silva',
        status: 'completed',
      },
      {
        title: 'Configuração de enlace 5.8 GHz',
        description: 'Planejamento e configuração de enlace ponto a ponto na frequência de 5.8 GHz.',
        startAt: '2026-08-18T10:00',
        endAt: '2026-08-18T12:00',
        location: 'Site Fazenda Boa Vista',
        client: 'Operadora Beta',
        assignedTo: 'Rafael Santos',
        status: 'scheduled',
      },
      {
        title: 'Manutenção corretiva de radio link',
        description: 'Correção de perda de sinal no enlace entre os sites Centro e Leste.',
        startAt: '2026-08-20T15:00',
        endAt: '2026-08-20T17:00',
        location: 'Site Leste',
        client: 'Operadora Alpha',
        assignedTo: 'Rafael Santos',
        status: 'confirmed',
      },
      {
        title: 'Reunião de acompanhamento de projeto',
        description: 'Acompanhamento quinzenal do projeto de infraestrutura de telecomunicações.',
        startAt: '2026-08-25T09:00',
        endAt: '2026-08-25T10:00',
        location: 'Escritório Central - Sala 2',
        client: 'Cliente Beta',
        assignedTo: 'Ana Pereira',
        status: 'scheduled',
      },
      {
        title: 'Levantamento topográfico para ERBS',
        description: 'Levantamento topográfico e estudo de visada para a nova estação rádio base.',
        startAt: '2026-08-27T08:00',
        endAt: '2026-08-27T14:00',
        location: 'Região Norte - Zona rural',
        client: 'Operadora Gamma',
        assignedTo: 'João Lima',
        status: 'scheduled',
      },
      {
        title: 'Instalação de CFTV em site',
        description: 'Instalação de sistema de CFTV e controle de acesso na estação (cancelado).',
        startAt: '2026-08-31T09:00',
        endAt: '2026-08-31T12:00',
        location: 'ERBS Vila Nova',
        client: 'Operadora Beta',
        assignedTo: 'Rafael Santos',
        status: 'cancelled',
      },
    ];

    for (const event of events) {
      await this.scheduleService.create(event);
    }

    console.log(`Seed: ${events.length} schedule events created`);
  }

  private async seedTasks() {
    const { total } = await this.taskService.findAll({ limit: 1 });
    if (total > 0) return;

    const tasks: CreateTaskInput[] = [
      {
        title: 'Revisar projeto de infraestrutura do site Norte',
        description: 'Revisar o projeto executivo e validar a lista de materiais antes da aprovação.',
        status: 'in_progress',
        priority: 'high',
        dueAt: '2026-08-04T17:00',
        project: 'Infraestrutura Site Norte',
        client: 'Operadora Alpha',
        assignedTo: 'Ana Pereira',
      },
      {
        title: 'Solicitar permissão de acesso ao site Morro do Cruzeiro',
        description: 'Enviar documentação e solicitar agendamento de acesso para a equipe de campo.',
        status: 'pending',
        priority: 'urgent',
        dueAt: '2026-08-03T12:00',
        project: 'Comissionamento 11 GHz',
        client: 'Operadora Beta',
        assignedTo: 'Rafael Santos',
      },
      {
        title: 'Preparar relatório de drive test da Zona Sul',
        description: 'Compilar métricas de cobertura e gerar o relatório técnico do drive test.',
        status: 'in_progress',
        priority: 'medium',
        dueAt: '2026-08-06T18:00',
        project: 'Otimização de Rede LTE',
        client: 'Operadora Beta',
        assignedTo: 'Mariana Oliveira',
      },
      {
        title: 'Atualizar inventário de equipamentos do CD',
        description: 'Lançar os equipamentos recebidos no inventário e conferir os códigos de série.',
        status: 'pending',
        priority: 'low',
        dueAt: '2026-08-08T15:00',
        project: 'Infraestrutura Site Norte',
        client: 'Operadora Alpha',
        assignedTo: 'João Lima',
      },
      {
        title: 'Agendar janela de migração 4G para 5G',
        description: 'Confirmar com a operadora a janela de migração e comunicar a equipe de campo.',
        status: 'pending',
        priority: 'high',
        dueAt: '2026-08-10T10:00',
        project: 'Migração 5G NSA',
        client: 'Operadora Alpha',
        assignedTo: 'Carlos Silva',
      },
      {
        title: 'Validar medições de potência da ERBS Centro',
        description: 'Conferir as medições de potência coletadas na manutenção preventiva.',
        status: 'completed',
        priority: 'medium',
        dueAt: '2026-08-01T17:00',
        project: 'Manutenção ERBS',
        client: 'Operadora Alpha',
        assignedTo: 'Carlos Silva',
      },
      {
        title: 'Elaborar plano de instalação de antenas',
        description: 'Detalhar o plano de instalação das antenas setoriais na torre do bairro industrial.',
        status: 'pending',
        priority: 'high',
        dueAt: '2026-08-12T16:00',
        project: 'Instalação Bairro Industrial',
        client: 'Operadora Gamma',
        assignedTo: 'Rafael Santos',
      },
      {
        title: 'Enviar proposta de manutenção corretiva',
        description: 'Preparar e enviar a proposta de manutenção corretiva do radio link para o cliente.',
        status: 'pending',
        priority: 'medium',
        dueAt: '2026-08-07T17:00',
        project: 'Manutenção Radio Link',
        client: 'Operadora Alpha',
        assignedTo: 'Ana Pereira',
      },
      {
        title: 'Treinar equipe em testes SAT/UAT',
        description: 'Realizar treinamento rápido sobre os procedimentos de teste de aceitação.',
        status: 'cancelled',
        priority: 'low',
        dueAt: '2026-08-03T09:00',
        project: 'Teste de Aceitação',
        client: 'Operadora Gamma',
        assignedTo: 'João Lima',
      },
      {
        title: 'Emitir relatório de aceitação da estação',
        description: 'Gerar e revisar o relatório de testes de aceitação da estação Jardim América.',
        status: 'in_progress',
        priority: 'high',
        dueAt: '2026-08-13T12:00',
        project: 'Teste de Aceitação',
        client: 'Operadora Gamma',
        assignedTo: 'Carlos Silva',
      },
    ];

    for (const task of tasks) {
      await this.taskService.create(task);
    }

    console.log(`Seed: ${tasks.length} tasks created`);
  }

  private async seedMsProject() {
    const { total } = await this.msProjectService.findAllPlans({ limit: 1 });
    if (total > 0) return;

    const project = await this.msProjectService.createPlan({
      name: 'Implantação de ERBS – Site Norte',
      description: 'Cronograma completo de implantação de estação rádio base no site Norte, do levantamento à entrega.',
      startDate: '2026-08-03',
      workingDays: [1, 2, 3, 4, 5],
    });

    const taskDefs: { name: string; durationDays?: number; milestone?: boolean; percentComplete?: number; priority?: 'low' | 'medium' | 'high' }[] = [
      { name: 'Levantamento topográfico', durationDays: 2, percentComplete: 100 },
      { name: 'Projeto executivo', durationDays: 3, percentComplete: 100 },
      { name: 'Aprovação do cliente', milestone: true },
      { name: 'Mobilização de equipe', durationDays: 1, percentComplete: 100 },
      { name: 'Fundação e infraestrutura civil', durationDays: 5, percentComplete: 60 },
      { name: 'Instalação da torre', durationDays: 3, percentComplete: 0 },
      { name: 'Instalação de antenas e rádios', durationDays: 2, percentComplete: 0 },
      { name: 'Cabeamento e energia', durationDays: 2, percentComplete: 0 },
      { name: 'Testes de comissionamento', durationDays: 2, percentComplete: 0 },
      { name: 'Entrega do site', milestone: true },
    ];

    const taskIds: number[] = [];
    for (const def of taskDefs) {
      const updated = await this.msProjectService.addTask(project.id, {
        name: def.name,
        durationDays: def.milestone ? 0 : (def.durationDays ?? 1),
        milestone: def.milestone ?? false,
        percentComplete: def.percentComplete ?? 0,
        priority: def.priority ?? 'medium',
      });
      const added = updated.tasks[updated.tasks.length - 1];
      taskIds.push(added.id);
    }

    const dependencies: { predecessor: number; successor: number; type: 'FS' | 'SS' | 'FF' | 'SF'; lagDays?: number }[] = [
      { predecessor: 1, successor: 2, type: 'FS' },
      { predecessor: 2, successor: 3, type: 'FS' },
      { predecessor: 3, successor: 4, type: 'FS' },
      { predecessor: 4, successor: 5, type: 'FS' },
      { predecessor: 5, successor: 6, type: 'FS' },
      { predecessor: 6, successor: 7, type: 'FS' },
      { predecessor: 6, successor: 8, type: 'SS', lagDays: 1 },
      { predecessor: 7, successor: 9, type: 'FS' },
      { predecessor: 8, successor: 9, type: 'FS' },
      { predecessor: 9, successor: 10, type: 'FS' },
    ];

    for (const dep of dependencies) {
      await this.msProjectService.addDependency(project.id, {
        taskId: taskIds[dep.successor - 1],
        predecessorTaskId: taskIds[dep.predecessor - 1],
        type: dep.type,
        lagDays: dep.lagDays ?? 0,
      });
    }

    const resources: { name: string; type: 'work' | 'material' | 'cost'; email: string; maxUnits: number }[] = [
      { name: 'Carlos Silva', type: 'work', email: 'carlos.silva@example.com', maxUnits: 100 },
      { name: 'Rafael Santos', type: 'work', email: 'rafael.santos@example.com', maxUnits: 100 },
      { name: 'Ana Pereira', type: 'work', email: 'ana.pereira@example.com', maxUnits: 100 },
      { name: 'João Lima', type: 'work', email: 'joao.lima@example.com', maxUnits: 80 },
    ];

    const resourceIds: number[] = [];
    for (const resource of resources) {
      const updated = await this.msProjectService.addResource(project.id, resource);
      const added = updated.resources[updated.resources.length - 1];
      resourceIds.push(added.id);
    }

    const assignments: { task: number; resource: number; units?: number; work?: number }[] = [
      { task: 1, resource: 4, units: 100, work: 16 },
      { task: 2, resource: 3, units: 100, work: 24 },
      { task: 4, resource: 1, units: 50, work: 4 },
      { task: 5, resource: 1, units: 100, work: 40 },
      { task: 6, resource: 2, units: 100, work: 24 },
      { task: 7, resource: 2, units: 100, work: 16 },
      { task: 8, resource: 4, units: 100, work: 16 },
      { task: 9, resource: 1, units: 100, work: 16 },
    ];

    for (const assignment of assignments) {
      await this.msProjectService.addAssignment(project.id, {
        taskId: taskIds[assignment.task - 1],
        resourceId: resourceIds[assignment.resource - 1],
        units: assignment.units ?? 100,
        work: assignment.work,
      });
    }

    await this.msProjectService.recomputeSchedule(project.id);
    console.log(`Seed: ms-project "${project.name}" created (${taskDefs.length} tasks, ${dependencies.length} dependencies, ${resources.length} resources, ${assignments.length} assignments)`);
  }

  private async seedSettings() {
    const settings = await this.settingsService.findAll();
    if (Object.keys(settings).length > 0) return;

    await this.settingsService.upsert({
      companyName: 'EA Projetos Telecom',
      companyCnpj: '12.345.678/0001-90',
      companyEmail: 'contato@eaprojetos.com.br',
      companyPhone: '(11) 4000-0000',
      companyAddress: 'Av. Paulista, 1000 – São Paulo/SP',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      currency: 'BRL',
    });

    console.log('Seed: system settings created');
  }

  private async seedCompanies() {
    const { total } = await this.companyService.findAll({ limit: 1 });
    if (total > 0) return;

    const companies: { nome: string; cnpj: string; email: string; telefone: string; endereco: string; cidade: string; uf: string; ativa: boolean; observacoes?: string }[] = [
      {
        nome: 'EA Projetos Telecom Ltda',
        cnpj: '12.345.678/0001-90',
        email: 'contato@eaprojetos.com.br',
        telefone: '(11) 4000-0000',
        endereco: 'Av. Paulista, 1000',
        cidade: 'São Paulo',
        uf: 'SP',
        ativa: true,
        observacoes: 'Empresa principal',
      },
      {
        nome: 'Norte Redes Ltda',
        cnpj: '98.765.432/0001-10',
        email: 'contato@norteredes.com.br',
        telefone: '(92) 3333-0000',
        endereco: 'Av. das Torres, 500',
        cidade: 'Manaus',
        uf: 'AM',
        ativa: true,
      },
    ];

    for (const company of companies) {
      await this.companyService.create(company);
    }

    console.log(`Seed: ${companies.length} companies created`);
  }

  private async seedUsers() {
    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const companyId = (nome: string) => companies.find((c) => c.nome === nome)?.id ?? null;

    const users: { name: string; email: string; company: string; role: 'master' | 'user' }[] = [
      { name: 'Ricardo Almeida', email: 'ricardo.almeida@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Fernanda Souza', email: 'fernanda.souza@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Bruno Carvalho', email: 'bruno.carvalho@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Carla Mendes', email: 'carla.mendes@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Diego Ferreira', email: 'diego.ferreira@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Elisa Rocha', email: 'elisa.rocha@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Fábio Nunes', email: 'fabio.nunes@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Gabriela Lima', email: 'gabriela.lima@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Henrique Castro', email: 'henrique.castro@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Isabela Ramos', email: 'isabela.ramos@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Jorge Prado', email: 'jorge.prado@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Vitor Hugo', email: 'vitor.hugo@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'user' },
      { name: 'Beatriz Campos', email: 'beatriz.campos@eaprojetos.com.br', company: 'EA Projetos Telecom Ltda', role: 'master' },
      { name: 'Karina Teixeira', email: 'karina.teixeira@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Leonardo Barbosa', email: 'leonardo.barbosa@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Marina Duarte', email: 'marina.duarte@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Nelson Azevedo', email: 'nelson.azevedo@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Olívia Martins', email: 'olivia.martins@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Paulo Henrique', email: 'paulo.henrique@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Renata Cardoso', email: 'renata.cardoso@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Samuel Freitas', email: 'samuel.freitas@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
      { name: 'Tatiane Gonçalves', email: 'tatiane.goncalves@norteredes.com.br', company: 'Norte Redes Ltda', role: 'user' },
    ];

    let created = 0;
    for (const u of users) {
      const existing = await this.usersService.findByEmail(u.email);
      if (existing) continue;
      const linkedCompanyId = companyId(u.company);
      if (linkedCompanyId == null) continue;

      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.usersService.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        companyId: linkedCompanyId,
        status: 'active',
      });
      created++;
    }

    console.log(`Seed: ${created} users created (password padrão: 123456)`);
  }

  private async seedCompanyMembers() {
    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const company = companies.find((c) => c.nome === 'EA Projetos Telecom Ltda');
    if (!company) return;

    const { data: collaborators } = await this.companyCollaboratorService.findAll(company.id, { limit: 100 });
    if (collaborators.length === 0) {
      const data = [
        { nome: 'Ricardo Almeida', cargo: 'Diretor Técnico', email: 'ricardo@eaprojetos.com.br', telefone: '(11) 4000-0001' },
        { nome: 'Fernanda Souza', cargo: 'Gerente de Projetos', email: 'fernanda@eaprojetos.com.br', telefone: '(11) 4000-0002' },
        { nome: 'Bruno Carvalho', cargo: 'Coordenador de Obras', email: 'bruno@eaprojetos.com.br', telefone: '(11) 4000-0003' },
      ];

      for (const col of data) {
        await this.companyCollaboratorService.create(company.id, col);
      }

      console.log(`Seed: ${data.length} collaborators created for company "${company.nome}"`);
    }

    const { data: linked } = await this.companyFreelancerService.findAll(company.id, { limit: 100 });
    if (linked.length > 0) return;

    const { data: freelancers } = await this.freelancersService.findAll({ limit: 100 });
    const toAssociate = freelancers.slice(0, 3);
    for (const freelancer of toAssociate) {
      await this.companyFreelancerService.associate(company.id, freelancer.id);
    }

    console.log(`Seed: ${toAssociate.length} freelancers linked to company "${company.nome}"`);
  }

  private async seedCompanyProjects() {
    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const company = companies.find((c) => c.nome === 'EA Projetos Telecom Ltda');
    if (!company) return;

    const { total } = await this.projectsService.findAll({ limit: 1 });
    if (total === 0) {
      const projects = [
        {
          nome: 'Infraestrutura Site Norte',
          cliente: 'Vivo',
          descricao: 'Implantação de infraestrutura de telecomunicações para o site Norte.',
          dataInicio: '2025-01-15',
          dataFim: '2025-06-30',
          status: 'ativo',
        },
        {
          nome: 'Comissionamento 11 GHz',
          cliente: 'Nokia',
          descricao: 'Comissionamento de enlace de rádio de 11 GHz.',
          dataInicio: '2025-03-01',
          dataFim: '2025-09-15',
          status: 'ativo',
        },
        {
          nome: 'Otimização de Rede LTE',
          cliente: 'Ericsson',
          descricao: 'Otimização de parâmetros de rede LTE em área urbana.',
          dataInicio: '2024-11-10',
          dataFim: '2025-02-28',
          status: 'inativo',
        },
      ];

      for (const project of projects) {
        await this.projectsService.create(project);
      }

      console.log(`Seed: ${projects.length} projects created`);
    }

    const { data: linked } = await this.projectsService.findByCompany(company.id, { limit: 100 });
    if (linked.length > 0) return;

    const { data: projects } = await this.projectsService.findAll({ limit: 100 });
    for (const project of projects.slice(0, 3)) {
      await this.projectsService.addCompany(project.id, company.id);
    }

    console.log(`Seed: ${Math.min(projects.length, 3)} projects linked to company "${company.nome}"`);
  }

  private async seedCollaborators() {
    const { total } = await this.collaboratorsService.findAllPaged({ limit: 1 });
    if (total > 0) return;

    const collaborators: { nome: string; cpf: string; cargo: string; email: string; telefone: string; cidade: string; uf: string; dataAdmissao: string; status: 'ativo' | 'inativo' }[] = [
      { nome: 'Adriana Costa', cpf: '111.111.111-01', cargo: 'Engenheira de Telecom', email: 'adriana.costa@eaprojetos.com.br', telefone: '(11) 91001-0001', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2018-03-12', status: 'ativo' },
      { nome: 'Bruno Martins', cpf: '111.111.111-02', cargo: 'Técnico de Campo', email: 'bruno.martins@eaprojetos.com.br', telefone: '(11) 91001-0002', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2019-07-01', status: 'ativo' },
      { nome: 'Camila Rocha', cpf: '111.111.111-03', cargo: 'Analista Financeira', email: 'camila.rocha@eaprojetos.com.br', telefone: '(11) 91001-0003', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2020-01-20', status: 'ativo' },
      { nome: 'Diego Nunes', cpf: '111.111.111-04', cargo: 'Coordenador de Obras', email: 'diego.nunes@eaprojetos.com.br', telefone: '(11) 91001-0004', cidade: 'Guarulhos', uf: 'SP', dataAdmissao: '2017-11-05', status: 'ativo' },
      { nome: 'Elaine Dias', cpf: '111.111.111-05', cargo: 'Projetista', email: 'elaine.dias@eaprojetos.com.br', telefone: '(11) 91001-0005', cidade: 'Osasco', uf: 'SP', dataAdmissao: '2021-04-18', status: 'ativo' },
      { nome: 'Felipe Araújo', cpf: '111.111.111-06', cargo: 'Técnico de Campo', email: 'felipe.araujo@eaprojetos.com.br', telefone: '(11) 91001-0006', cidade: 'São Bernardo do Campo', uf: 'SP', dataAdmissao: '2022-02-14', status: 'ativo' },
      { nome: 'Gabriela Freitas', cpf: '111.111.111-07', cargo: 'Analista de RH', email: 'gabriela.freitas@eaprojetos.com.br', telefone: '(11) 91001-0007', cidade: 'Santo André', uf: 'SP', dataAdmissao: '2019-09-30', status: 'inativo' },
      { nome: 'Henrique Lima', cpf: '111.111.111-08', cargo: 'Engenheiro de Redes', email: 'henrique.lima@eaprojetos.com.br', telefone: '(11) 91001-0008', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2016-05-22', status: 'ativo' },
      { nome: 'Isabela Souza', cpf: '111.111.111-09', cargo: 'Assistente Administrativa', email: 'isabela.souza@eaprojetos.com.br', telefone: '(11) 91001-0009', cidade: 'Barueri', uf: 'SP', dataAdmissao: '2023-03-06', status: 'ativo' },
      { nome: 'João Pedro Silva', cpf: '111.111.111-10', cargo: 'Técnico de Campo', email: 'joao.silva@eaprojetos.com.br', telefone: '(11) 91001-0010', cidade: 'Mauá', uf: 'SP', dataAdmissao: '2020-08-10', status: 'ativo' },
      { nome: 'Karina Melo', cpf: '111.111.111-11', cargo: 'Analista de Compras', email: 'karina.melo@eaprojetos.com.br', telefone: '(11) 91001-0011', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2021-10-25', status: 'ativo' },
      { nome: 'Lucas Prado', cpf: '111.111.111-12', cargo: 'Engenheiro Civil', email: 'lucas.prado@eaprojetos.com.br', telefone: '(11) 91001-0012', cidade: 'Campinas', uf: 'SP', dataAdmissao: '2018-12-03', status: 'ativo' },
      { nome: 'Mariana Castro', cpf: '111.111.111-13', cargo: 'Supervisora de Campo', email: 'mariana.castro@eaprojetos.com.br', telefone: '(11) 91001-0013', cidade: 'Sorocaba', uf: 'SP', dataAdmissao: '2017-02-27', status: 'ativo' },
      { nome: 'Nicolas Barros', cpf: '111.111.111-14', cargo: 'Técnico de Campo', email: 'nicolas.barros@eaprojetos.com.br', telefone: '(11) 91001-0014', cidade: 'Santos', uf: 'SP', dataAdmissao: '2022-06-13', status: 'inativo' },
      { nome: 'Olivia Cardoso', cpf: '111.111.111-15', cargo: 'Analista de TI', email: 'olivia.cardoso@eaprojetos.com.br', telefone: '(11) 91001-0015', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2019-01-07', status: 'ativo' },
      { nome: 'Paulo Otávio', cpf: '111.111.111-16', cargo: 'Motorista / Operador', email: 'paulo.otavio@eaprojetos.com.br', telefone: '(11) 91001-0016', cidade: 'Diadema', uf: 'SP', dataAdmissao: '2015-10-19', status: 'ativo' },
      { nome: 'Raquel Vieira', cpf: '111.111.111-17', cargo: 'Analista de Qualidade', email: 'raquel.vieira@eaprojetos.com.br', telefone: '(11) 91001-0017', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2020-05-11', status: 'ativo' },
      { nome: 'Samuel Ribeiro', cpf: '111.111.111-18', cargo: 'Técnico de Campo', email: 'samuel.ribeiro@eaprojetos.com.br', telefone: '(11) 91001-0018', cidade: 'Jundiaí', uf: 'SP', dataAdmissao: '2023-01-16', status: 'ativo' },
      { nome: 'Tatiane Gomes', cpf: '111.111.111-19', cargo: 'Secretária Executiva', email: 'tatiane.gomes@eaprojetos.com.br', telefone: '(11) 91001-0019', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2018-06-04', status: 'ativo' },
      { nome: 'Ubiratan Fonseca', cpf: '111.111.111-20', cargo: 'Eletricista', email: 'ubiratan.fonseca@eaprojetos.com.br', telefone: '(11) 91001-0020', cidade: 'Itapevi', uf: 'SP', dataAdmissao: '2016-09-28', status: 'ativo' },
      { nome: 'Vanessa Alves', cpf: '111.111.111-21', cargo: 'Engenheira de Projetos', email: 'vanessa.alves@eaprojetos.com.br', telefone: '(11) 91001-0021', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2017-08-21', status: 'ativo' },
      { nome: 'Wesley Santana', cpf: '111.111.111-22', cargo: 'Técnico de Campo', email: 'wesley.santana@eaprojetos.com.br', telefone: '(11) 91001-0022', cidade: 'Embu das Artes', uf: 'SP', dataAdmissao: '2021-12-09', status: 'inativo' },
    ];

    for (const collaborator of collaborators) {
      await this.collaboratorsService.create(collaborator);
    }

    console.log(`Seed: ${collaborators.length} collaborators created`);
  }

  private async seedAttachments() {
    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const company = companies.find((c) => c.nome === 'EA Projetos Telecom Ltda');
    if (!company) return;

    const { total } = await this.attachmentsService.findByCompany(company.id, { limit: 1 });
    if (total > 0) return;

    const pdf = (content: string) => Buffer.from(
      `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length ${content.length + 22} >>\nstream\nBT /F1 18 Tf 72 720 Td (${content}) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size 6 /Root 1 0 R >>\n%%EOF\n`,
      'utf8',
    );

    const attachments: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
    }[] = [
      {
        originalname: 'contrato-social-ea.pdf',
        mimetype: 'application/pdf',
        buffer: pdf('Contrato social - EA Projetos Telecom Ltda'),
      },
      {
        originalname: 'alvara-de-funcionamento.pdf',
        mimetype: 'application/pdf',
        buffer: pdf('Alvara de funcionamento - EA Projetos Telecom Ltda'),
      },
      {
        originalname: 'logo-ea.png',
        mimetype: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'),
      },
      {
        originalname: 'fatura-energia-junho-2026.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('Fatura de energia elétrica referente a junho/2026.\nTotal: R$ 1.847,90\nVencimento: 10/07/2026', 'utf8'),
      },
      {
        originalname: 'relatorio-empresas-ativas.csv',
        mimetype: 'text/csv',
        buffer: Buffer.from('nome;cnpj;cidade;uf\nEA Projetos Telecom Ltda;12.345.678/0001-90;São Paulo;SP\nNorte Redes Ltda;98.765.432/0001-10;Manaus;AM\n', 'utf8'),
      },
      {
        originalname: 'certificado-de-licitacao.pdf',
        mimetype: 'application/pdf',
        buffer: pdf('Certificado de habilitação em licitação pública'),
      },
      {
        originalname: 'proposta-comercial-norte-redes.pdf',
        mimetype: 'application/pdf',
        buffer: pdf('Proposta comercial - Parceria Norte Redes Ltda'),
      },
      {
        originalname: 'inventario-equipamentos.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('Inventário de equipamentos ativos e passivos\nRádio Ubiquiti - 3 unidades\nRádio Mimosa - 2 unidades\nAntena parabólica 1,2m - 1 unidade', 'utf8'),
      },
    ];

    for (const attachment of attachments) {
      await this.attachmentsService.uploadForCompany(company.id, {
        originalname: attachment.originalname,
        mimetype: attachment.mimetype,
        size: attachment.buffer.length,
        buffer: attachment.buffer,
      } as Express.Multer.File);
    }

    console.log(`Seed: ${attachments.length} attachments created for company "${company.nome}"`);
  }

  private async seedComments() {
    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const company = companies.find((c) => c.nome === 'EA Projetos Telecom Ltda');
    if (!company) return;

    const { total } = await this.commentsService.findByCompany(company.id, { limit: 1 });
    if (total > 0) return;

    const comments = [
      'Empresa principal do grupo, responsável pela gestão dos projetos de telecomunicações.',
      'CNPJ validado e documentos societários em dia no cadastro.',
      'Contrato anual de manutenção de enlaces renovado em julho/2026.',
      'Faturamento consolidado ao final de cada mês — conferir com o setor financeiro.',
    ];

    for (const content of comments) {
      await this.commentsService.createForCompany(company.id, { content }, 'admin@admin.com');
    }

    console.log(`Seed: ${comments.length} comments created for company "${company.nome}"`);
  }
}
