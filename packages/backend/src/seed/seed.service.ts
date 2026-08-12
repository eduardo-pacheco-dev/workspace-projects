import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
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
import { StationsService } from '../stations/stations.service';
import { RadioLinksService } from '../radio-links/radio-links.service';
import { ServiceOrdersService } from '../service-orders/service-orders.service';
import { ClientsService } from '../clients/clients.service';
import { PdcaService } from '../pdca/pdca.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
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
    private readonly stationsService: StationsService,
    private readonly radioLinksService: RadioLinksService,
    private readonly serviceOrdersService: ServiceOrdersService,
    private readonly clientsService: ClientsService,
    private readonly pdcaService: PdcaService,
  ) {}

  async onApplicationBootstrap() {
    const enabled = process.env.NODE_ENV !== 'production' || process.env.SEED === 'true';
    if (!enabled) return;

    await this.seedAdmin();
    await this.seedCompanies();
    await this.seedFreelancers();
    await this.seedJobs();
    await this.seedLpus();
    await this.seedScheduleEvents();
    await this.seedTasks();
    await this.seedMsProject();
    await this.seedSettings();
    await this.seedUsers();
    await this.seedCompanyMembers();
    await this.seedCompanyProjects();
    await this.seedCollaborators();
    await this.seedStations();
    await this.seedRadiolinks();
    await this.seedServiceOrders();
    await this.seedClients();
    await this.seedPdca();
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
    const { total } = await this.collaboratorsService.findAllPaged({ limit: 1, isFreelancer: true });
    if (total > 0) return;

    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const firstCompanyId = companies[0]?.id;

    type SeedFreelancer = {
      firstName: string;
      lastName: string;
      email: string;
      bio: string;
      hourlyRate: number;
      skills: string;
      portfolio: string;
      experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
      availability: 'available' | 'busy' | 'unavailable';
    };

    const freelancers: SeedFreelancer[] = [
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
        experienceLevel: 'mid',
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
        experienceLevel: 'mid',
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
      await this.collaboratorsService.create({ ...freelancer, companyId: firstCompanyId, isFreelancer: true });
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
    const { data: freelancers } = await this.collaboratorsService.findAllPaged({ limit: 100, isFreelancer: true });
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

    const { data: freelancers } = await this.collaboratorsService.findAllPaged({ limit: 100, isFreelancer: true });
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
    const { total } = await this.collaboratorsService.findAllPaged({ limit: 1, isFreelancer: false });
    if (total > 0) return;

    const { data: companies } = await this.companyService.findAll({ limit: 100 });
    const companyId = (nome: string) => companies.find((c) => c.nome === nome)?.id;

    const collaborators: { nome: string; cpf: string; cargo: string; email: string; telefone: string; cidade: string; uf: string; dataAdmissao: string; status: 'ativo' | 'inativo'; company: string }[] = [
      { nome: 'Adriana Costa', cpf: '111.111.111-01', cargo: 'Engenheira de Telecom', email: 'adriana.costa@eaprojetos.com.br', telefone: '(11) 91001-0001', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2018-03-12', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Bruno Martins', cpf: '111.111.111-02', cargo: 'Técnico de Campo', email: 'bruno.martins@eaprojetos.com.br', telefone: '(11) 91001-0002', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2019-07-01', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Camila Rocha', cpf: '111.111.111-03', cargo: 'Analista Financeira', email: 'camila.rocha@eaprojetos.com.br', telefone: '(11) 91001-0003', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2020-01-20', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Diego Nunes', cpf: '111.111.111-04', cargo: 'Coordenador de Obras', email: 'diego.nunes@eaprojetos.com.br', telefone: '(11) 91001-0004', cidade: 'Guarulhos', uf: 'SP', dataAdmissao: '2017-11-05', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Elaine Dias', cpf: '111.111.111-05', cargo: 'Projetista', email: 'elaine.dias@eaprojetos.com.br', telefone: '(11) 91001-0005', cidade: 'Osasco', uf: 'SP', dataAdmissao: '2021-04-18', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Felipe Araújo', cpf: '111.111.111-06', cargo: 'Técnico de Campo', email: 'felipe.araujo@eaprojetos.com.br', telefone: '(11) 91001-0006', cidade: 'São Bernardo do Campo', uf: 'SP', dataAdmissao: '2022-02-14', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Gabriela Freitas', cpf: '111.111.111-07', cargo: 'Analista de RH', email: 'gabriela.freitas@eaprojetos.com.br', telefone: '(11) 91001-0007', cidade: 'Santo André', uf: 'SP', dataAdmissao: '2019-09-30', status: 'inativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Henrique Lima', cpf: '111.111.111-08', cargo: 'Engenheiro de Redes', email: 'henrique.lima@eaprojetos.com.br', telefone: '(11) 91001-0008', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2016-05-22', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Isabela Souza', cpf: '111.111.111-09', cargo: 'Assistente Administrativa', email: 'isabela.souza@eaprojetos.com.br', telefone: '(11) 91001-0009', cidade: 'Barueri', uf: 'SP', dataAdmissao: '2023-03-06', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'João Pedro Silva', cpf: '111.111.111-10', cargo: 'Técnico de Campo', email: 'joao.silva@eaprojetos.com.br', telefone: '(11) 91001-0010', cidade: 'Mauá', uf: 'SP', dataAdmissao: '2020-08-10', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Karina Melo', cpf: '111.111.111-11', cargo: 'Analista de Compras', email: 'karina.melo@eaprojetos.com.br', telefone: '(11) 91001-0011', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2021-10-25', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Lucas Prado', cpf: '111.111.111-12', cargo: 'Engenheiro Civil', email: 'lucas.prado@eaprojetos.com.br', telefone: '(11) 91001-0012', cidade: 'Campinas', uf: 'SP', dataAdmissao: '2018-12-03', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Mariana Castro', cpf: '111.111.111-13', cargo: 'Supervisora de Campo', email: 'mariana.castro@eaprojetos.com.br', telefone: '(11) 91001-0013', cidade: 'Sorocaba', uf: 'SP', dataAdmissao: '2017-02-27', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Nicolas Barros', cpf: '111.111.111-14', cargo: 'Técnico de Campo', email: 'nicolas.barros@eaprojetos.com.br', telefone: '(11) 91001-0014', cidade: 'Santos', uf: 'SP', dataAdmissao: '2022-06-13', status: 'inativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Olivia Cardoso', cpf: '111.111.111-15', cargo: 'Analista de TI', email: 'olivia.cardoso@eaprojetos.com.br', telefone: '(11) 91001-0015', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2019-01-07', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Paulo Otávio', cpf: '111.111.111-16', cargo: 'Motorista / Operador', email: 'paulo.otavio@eaprojetos.com.br', telefone: '(11) 91001-0016', cidade: 'Diadema', uf: 'SP', dataAdmissao: '2015-10-19', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Raquel Vieira', cpf: '111.111.111-17', cargo: 'Analista de Qualidade', email: 'raquel.vieira@eaprojetos.com.br', telefone: '(11) 91001-0017', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2020-05-11', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Samuel Ribeiro', cpf: '111.111.111-18', cargo: 'Técnico de Campo', email: 'samuel.ribeiro@eaprojetos.com.br', telefone: '(11) 91001-0018', cidade: 'Jundiaí', uf: 'SP', dataAdmissao: '2023-01-16', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Tatiane Gomes', cpf: '111.111.111-19', cargo: 'Secretária Executiva', email: 'tatiane.gomes@eaprojetos.com.br', telefone: '(11) 91001-0019', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2018-06-04', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Ubiratan Fonseca', cpf: '111.111.111-20', cargo: 'Eletricista', email: 'ubiratan.fonseca@eaprojetos.com.br', telefone: '(11) 91001-0020', cidade: 'Itapevi', uf: 'SP', dataAdmissao: '2016-09-28', status: 'ativo', company: 'EA Projetos Telecom Ltda' },
      { nome: 'Vanessa Alves', cpf: '111.111.111-21', cargo: 'Engenheira de Projetos', email: 'vanessa.alves@eaprojetos.com.br', telefone: '(11) 91001-0021', cidade: 'São Paulo', uf: 'SP', dataAdmissao: '2017-08-21', status: 'ativo', company: 'Norte Redes Ltda' },
      { nome: 'Wesley Santana', cpf: '111.111.111-22', cargo: 'Técnico de Campo', email: 'wesley.santana@eaprojetos.com.br', telefone: '(11) 91001-0022', cidade: 'Embu das Artes', uf: 'SP', dataAdmissao: '2021-12-09', status: 'inativo', company: 'Norte Redes Ltda' },
    ];

    for (const collaborator of collaborators) {
      const id = companyId(collaborator.company);
      if (id == null) continue;
      await this.collaboratorsService.create({
        nome: collaborator.nome,
        cpf: collaborator.cpf,
        cargo: collaborator.cargo,
        email: collaborator.email,
        telefone: collaborator.telefone,
        cidade: collaborator.cidade,
        uf: collaborator.uf,
        dataAdmissao: collaborator.dataAdmissao,
        status: collaborator.status,
        companyId: id,
      });
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

  private async seedStations() {
    const { total } = await this.stationsService.findAll({ limit: 1 });
    if (total > 0) return;

    type SeedStation = {
      siteId: string;
      endId: string;
      endereco: string;
      latitude: number;
      longitude: number;
      operadora: 'TIM' | 'CLARO' | 'VIVO' | 'Outras';
      observacoes?: string;
      status: 'ativo' | 'inativo';
    };

    const stations: SeedStation[] = [
      { siteId: 'SP-0001', endId: 'SP0001', endereco: 'Av. Paulista, 1000 – Centro', latitude: -23.5614, longitude: -46.6559, operadora: 'VIVO', observacoes: 'ERBS urbana com 3 setores', status: 'ativo' },
      { siteId: 'SP-0002', endId: 'SP0002', endereco: 'Rua Augusta, 2500 – Consolação', latitude: -23.5561, longitude: -46.6604, operadora: 'CLARO', observacoes: 'Micro célula em cobertura rooftop', status: 'ativo' },
      { siteId: 'SP-0003', endId: 'SP0003', endereco: 'Av. Brigadeiro Faria Lima, 3000 – Itaim', latitude: -23.5862, longitude: -46.6824, operadora: 'TIM', status: 'ativo' },
      { siteId: 'SP-0004', endId: 'SP0004', endereco: 'Av. das Nações Unidas, 14000 – Brooklin', latitude: -23.6018, longitude: -46.6936, operadora: 'VIVO', observacoes: 'Radio link 11 GHz para site vizinho', status: 'ativo' },
      { siteId: 'SP-0005', endId: 'SP0005', endereco: 'Rua Oscar Freire, 900 – Jardins', latitude: -23.5661, longitude: -46.6751, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'SP-0006', endId: 'SP0006', endereco: 'Av. Ibirapuera, 3100 – Moema', latitude: -23.5874, longitude: -46.6576, operadora: 'TIM', observacoes: 'Antena setorial em poste', status: 'ativo' },
      { siteId: 'SP-0007', endId: 'SP0007', endereco: 'Av. do Estado, 3500 – Mooca', latitude: -23.5596, longitude: -46.6164, operadora: 'VIVO', status: 'inativo' },
      { siteId: 'SP-0008', endId: 'SP0008', endereco: 'Rua Tabapuã, 1200 – Itaim', latitude: -23.5828, longitude: -46.6809, operadora: 'CLARO', observacoes: 'Indoor solution (DAS)', status: 'ativo' },
      { siteId: 'SP-0009', endId: 'SP0009', endereco: 'Av. Luiz Carlos Berrini, 1500 – Berrini', latitude: -23.6105, longitude: -46.6966, operadora: 'TIM', status: 'ativo' },
      { siteId: 'SP-0010', endId: 'SP0010', endereco: 'Praça da Sé, 1 – Centro', latitude: -23.5505, longitude: -46.6333, operadora: 'VIVO', observacoes: 'Torre em edifício histórico', status: 'ativo' },
      { siteId: 'SP-0011', endId: 'SP0011', endereco: 'Av. Marginal Tietê, 3000 – Vila Maria', latitude: -23.5156, longitude: -46.5875, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'SP-0012', endId: 'SP0012', endereco: 'Rua do Gasômetro, 800 – Brás', latitude: -23.5457, longitude: -46.6134, operadora: 'TIM', status: 'inativo' },
      { siteId: 'RJ-0001', endId: 'RJ0001', endereco: 'Av. Atlântica, 2000 – Copacabana', latitude: -22.9711, longitude: -43.1822, operadora: 'VIVO', observacoes: 'ERBS próxima ao calçadão', status: 'ativo' },
      { siteId: 'RJ-0002', endId: 'RJ0002', endereco: 'Av. das Américas, 5000 – Barra da Tijuca', latitude: -23.0063, longitude: -43.3239, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'RJ-0003', endId: 'RJ0003', endereco: 'Rua Voluntários da Pátria, 450 – Botafogo', latitude: -22.9519, longitude: -43.1842, operadora: 'TIM', observacoes: 'Site compartilhado (colocation)', status: 'ativo' },
      { siteId: 'RJ-0004', endId: 'RJ0004', endereco: 'Estrada das Canoas, 1200 – São Conrado', latitude: -22.9931, longitude: -43.2703, operadora: 'VIVO', observacoes: 'Cobertura em morro', status: 'ativo' },
      { siteId: 'RJ-0005', endId: 'RJ0005', endereco: 'Av. Brasil, 10000 – Maré', latitude: -22.8707, longitude: -43.2719, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'RJ-0006', endId: 'RJ0006', endereco: 'Praia de Botafogo, 700 – Botafogo', latitude: -22.9468, longitude: -43.1832, operadora: 'TIM', status: 'ativo' },
      { siteId: 'RJ-0007', endId: 'RJ0007', endereco: 'Av. Nossa Senhora de Copacabana, 1200 – Copacabana', latitude: -22.9679, longitude: -43.1839, operadora: 'VIVO', status: 'ativo' },
      { siteId: 'RJ-0008', endId: 'RJ0008', endereco: 'Estrada do Galeão, 1500 – Ilha do Governador', latitude: -22.8116, longitude: -43.2016, operadora: 'CLARO', observacoes: 'Suporte à cobertura do aeroporto', status: 'ativo' },
      { siteId: 'RJ-0009', endId: 'RJ0009', endereco: 'Rua do Ouvidor, 100 – Centro', latitude: -22.9035, longitude: -43.1796, operadora: 'TIM', status: 'inativo' },
      { siteId: 'MG-0001', endId: 'MG0001', endereco: 'Av. Afonso Pena, 2500 – Funcionários', latitude: -19.9227, longitude: -43.9451, operadora: 'VIVO', observacoes: 'ERBS com painel solar', status: 'ativo' },
      { siteId: 'MG-0002', endId: 'MG0002', endereco: 'Av. do Contorno, 6500 – Savassi', latitude: -19.9318, longitude: -43.9359, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'MG-0003', endId: 'MG0003', endereco: 'Av. Antônio Carlos, 4000 – Pampulha', latitude: -19.8466, longitude: -43.9485, operadora: 'TIM', observacoes: 'Site próximo ao campus universitário', status: 'ativo' },
      { siteId: 'MG-0004', endId: 'MG0004', endereco: 'Av. Cristiano Machado, 3500 – Venda Nova', latitude: -19.8528, longitude: -43.9378, operadora: 'VIVO', status: 'ativo' },
      { siteId: 'MG-0005', endId: 'MG0005', endereco: 'Rua da Bahia, 1800 – Centro', latitude: -19.9265, longitude: -43.9346, operadora: 'CLARO', status: 'inativo' },
      { siteId: 'RS-0001', endId: 'RS0001', endereco: 'Av. Ipiranga, 6681 – Partenon', latitude: -30.0553, longitude: -51.1717, operadora: 'VIVO', observacoes: 'Site universitário com alta demanda', status: 'ativo' },
      { siteId: 'RS-0002', endId: 'RS0002', endereco: 'Av. Borges de Medeiros, 800 – Centro', latitude: -30.0318, longitude: -51.2302, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'RS-0003', endId: 'RS0003', endereco: 'Av. Assis Brasil, 1200 – Passo D´Areia', latitude: -30.0063, longitude: -51.1654, operadora: 'TIM', status: 'ativo' },
      { siteId: 'PR-0001', endId: 'PR0001', endereco: 'Av. Sete de Setembro, 3000 – Rebouças', latitude: -25.4385, longitude: -49.2781, operadora: 'VIVO', observacoes: 'ERBS em torre de concreto', status: 'ativo' },
      { siteId: 'PR-0002', endId: 'PR0002', endereco: 'Rua XV de Novembro, 1500 – Centro', latitude: -25.4286, longitude: -49.2715, operadora: 'CLARO', status: 'ativo' },
      { siteId: 'SC-0001', endId: 'SC0001', endereco: 'Av. Beira-Mar Norte, 1500 – Centro', latitude: -27.5935, longitude: -48.5483, operadora: 'TIM', observacoes: 'Cobertura da orla', status: 'ativo' },
      { siteId: 'BA-0001', endId: 'BA0001', endereco: 'Av. Oceânica, 2000 – Ondina', latitude: -13.0068, longitude: -38.4954, operadora: 'VIVO', observacoes: 'Site litorâneo em edifício', status: 'ativo' },
    ];

    for (const station of stations) {
      await this.stationsService.create(station);
    }

    console.log(`Seed: ${stations.length} stations created`);
  }

  private async seedRadiolinks() {
    const { total } = await this.radioLinksService.findAll({ limit: 1 });
    if (total > 0) return;

    const { data: stations } = await this.stationsService.findAll({ limit: 100 });
    if (stations.length === 0) return;

    type SeedRadioLink = {
      aIdx: number;
      bIdx: number;
      frequencia?: string;
      capacidade?: string;
      observacoes?: string;
      status: 'ativo' | 'inativo';
    };

    const radioLinks: SeedRadioLink[] = [
      { aIdx: 0, bIdx: 1, frequencia: '18 GHz', capacidade: '1 Gbps', observacoes: 'Enlace urbano de baixa distância', status: 'ativo' },
      { aIdx: 2, bIdx: 3, frequencia: '23 GHz', capacidade: '2 Gbps', observacoes: 'Backbone local', status: 'ativo' },
      { aIdx: 4, bIdx: 5, frequencia: '11 GHz', capacidade: '300 Mbps', status: 'ativo' },
      { aIdx: 6, bIdx: 7, frequencia: '5.8 GHz', capacidade: '100 Mbps', status: 'inativo' },
      { aIdx: 8, bIdx: 9, frequencia: '13 GHz', capacidade: '500 Mbps', status: 'ativo' },
      { aIdx: 10, bIdx: 11, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 0, bIdx: 3, frequencia: '23 GHz', capacidade: '2 Gbps', observacoes: 'Rede em anel - caminho de reserva', status: 'ativo' },
      { aIdx: 0, bIdx: 9, frequencia: '11 GHz', capacidade: '300 Mbps', status: 'ativo' },
      { aIdx: 12, bIdx: 13, frequencia: '18 GHz', capacidade: '1 Gbps', observacoes: 'Enlace costeiro', status: 'ativo' },
      { aIdx: 14, bIdx: 15, frequencia: '23 GHz', capacidade: '2 Gbps', status: 'ativo' },
      { aIdx: 16, bIdx: 17, frequencia: '11 GHz', capacidade: '300 Mbps', status: 'ativo' },
      { aIdx: 18, bIdx: 19, frequencia: '13 GHz', capacidade: '500 Mbps', status: 'ativo' },
      { aIdx: 12, bIdx: 16, frequencia: '5.8 GHz', capacidade: '100 Mbps', observacoes: 'Suporte a cobertura de evento', status: 'inativo' },
      { aIdx: 21, bIdx: 22, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 23, bIdx: 24, frequencia: '23 GHz', capacidade: '2 Gbps', status: 'ativo' },
      { aIdx: 26, bIdx: 27, frequencia: '18 GHz', capacidade: '1 Gbps', observacoes: 'Travessia urbana', status: 'ativo' },
      { aIdx: 29, bIdx: 30, frequencia: '23 GHz', capacidade: '2 Gbps', status: 'ativo' },
      { aIdx: 20, bIdx: 21, frequencia: '11 GHz', capacidade: '300 Mbps', observacoes: 'Backbone inter-cidade', status: 'ativo' },
      { aIdx: 25, bIdx: 26, frequencia: '13 GHz', capacidade: '500 Mbps', observacoes: 'Enlace de longa distância', status: 'ativo' },
      { aIdx: 28, bIdx: 29, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 31, bIdx: 32, frequencia: '11 GHz', capacidade: '300 Mbps', observacoes: 'Enlace costeiro Norte-Sul', status: 'ativo' },
      { aIdx: 3, bIdx: 5, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 5, bIdx: 7, frequencia: '11 GHz', capacidade: '300 Mbps', status: 'ativo' },
      { aIdx: 7, bIdx: 9, frequencia: '23 GHz', capacidade: '2 Gbps', status: 'ativo' },
      { aIdx: 9, bIdx: 11, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 12, bIdx: 18, frequencia: '23 GHz', capacidade: '2 Gbps', observacoes: 'Rede em anel - orla', status: 'ativo' },
      { aIdx: 13, bIdx: 19, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 14, bIdx: 16, frequencia: '11 GHz', capacidade: '300 Mbps', status: 'inativo' },
      { aIdx: 21, bIdx: 23, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 26, bIdx: 28, frequencia: '23 GHz', capacidade: '2 Gbps', observacoes: 'Backbone regional', status: 'ativo' },
      { aIdx: 0, bIdx: 2, frequencia: '11 GHz', capacidade: '300 Mbps', status: 'ativo' },
      { aIdx: 2, bIdx: 4, frequencia: '18 GHz', capacidade: '1 Gbps', status: 'ativo' },
      { aIdx: 4, bIdx: 6, frequencia: '23 GHz', capacidade: '2 Gbps', status: 'ativo' },
    ];

    let created = 0;
    for (const link of radioLinks) {
      const stationA = stations[link.aIdx];
      const stationB = stations[link.bIdx];
      if (!stationA || !stationB) continue;

      await this.radioLinksService.create({
        nome: `${stationA.siteId} – ${stationB.siteId}`,
        frequencia: link.frequencia,
        capacidade: link.capacidade,
        stationAId: stationA.id,
        stationBId: stationB.id,
        observacoes: link.observacoes,
        status: link.status,
      });
      created++;
    }

    console.log(`Seed: ${created} radio links created`);
  }

  private async seedServiceOrders() {
    const { total } = await this.serviceOrdersService.findAll({ limit: 1 });
    if (total > 0) return;

    const { data: stations } = await this.stationsService.findAll({ limit: 100 });

    type SeedServiceOrder = {
      cliente: string;
      descricao: string;
      stationIdx?: number;
      operadora?: 'TIM' | 'CLARO' | 'VIVO' | 'Outras';
      dataInicio: string;
      dataFim: string;
      status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';
      observacoes?: string;
    };

    const serviceOrders: SeedServiceOrder[] = [
      { cliente: 'Operadora Alpha', descricao: 'Instalação de antena setorial e rádio na estação do centro.', stationIdx: 0, dataInicio: '2026-08-03', dataFim: '2026-08-05', status: 'em_andamento', observacoes: 'Equipe alocada: Carlos Silva.' },
      { cliente: 'Operadora Beta', descricao: 'Alinhamento de enlace ponto a ponto de 18 GHz.', stationIdx: 1, dataInicio: '2026-08-04', dataFim: '2026-08-04', status: 'concluida' },
      { cliente: 'Operadora Gamma', descricao: 'Manutenção preventiva: limpeza, aperto de conectores e medições de potência.', stationIdx: 2, dataInicio: '2026-08-06', dataFim: '2026-08-06', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Comissionamento de rádio link 11 GHz com testes de throughput.', stationIdx: 3, dataInicio: '2026-08-07', dataFim: '2026-08-08', status: 'em_andamento', observacoes: 'Aguardando janela de acesso.' },
      { cliente: 'Operadora Beta', descricao: 'Substituição de rádio danificado por incêndio.', stationIdx: 4, dataInicio: '2026-08-10', dataFim: '2026-08-11', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Atualização de firmware da BTS.', stationIdx: 5, dataInicio: '2026-08-12', dataFim: '2026-08-12', status: 'concluida' },
      { cliente: 'Operadora Gamma', descricao: 'Instalação de CFTV e controle de acesso no site.', stationIdx: 6, dataInicio: '2026-08-13', dataFim: '2026-08-15', status: 'em_andamento' },
      { cliente: 'Operadora Beta', descricao: 'Otimização de cobertura da região central.', stationIdx: 7, dataInicio: '2026-08-17', dataFim: '2026-08-18', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Migração de célula 4G para 5G NSA.', stationIdx: 8, dataInicio: '2026-08-19', dataFim: '2026-08-19', status: 'cancelada', observacoes: 'Cancelada pela operadora.' },
      { cliente: 'Operadora Gamma', descricao: 'Levantamento topográfico para nova ERBS.', stationIdx: 9, dataInicio: '2026-08-20', dataFim: '2026-08-21', status: 'em_andamento' },
      { cliente: 'Operadora Alpha', descricao: 'Teste de aceitação (SAT/UAT) da estação recém-instalada.', stationIdx: 10, dataInicio: '2026-08-24', dataFim: '2026-08-25', status: 'aberta' },
      { cliente: 'Operadora Beta', descricao: 'Instalação de rádio 5.8 GHz para ponto de internet rural.', stationIdx: 11, dataInicio: '2026-08-26', dataFim: '2026-08-27', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Manutenção corretiva de perda de sinal no enlace.', stationIdx: 12, dataInicio: '2026-08-03', dataFim: '2026-08-03', status: 'concluida' },
      { cliente: 'Operadora Gamma', descricao: 'Instalação de painéis solares e banco de baterias.', stationIdx: 13, dataInicio: '2026-08-05', dataFim: '2026-08-08', status: 'em_andamento' },
      { cliente: 'Operadora Beta', descricao: 'Conectorização e emenda de fibra óptica na DIO.', stationIdx: 14, dataInicio: '2026-08-06', dataFim: '2026-08-06', status: 'concluida' },
      { cliente: 'Operadora Alpha', descricao: 'Revisão de inventário de equipamentos ativos e passivos.', stationIdx: 15, dataInicio: '2026-08-10', dataFim: '2026-08-11', status: 'aberta' },
      { cliente: 'Operadora Gamma', descricao: 'Instalação de rádio de backup com failover automático.', stationIdx: 16, dataInicio: '2026-08-12', dataFim: '2026-08-14', status: 'em_andamento' },
      { cliente: 'Operadora Beta', descricao: 'Georreferenciamento das coordenadas do site.', stationIdx: 17, dataInicio: '2026-08-13', dataFim: '2026-08-13', status: 'concluida' },
      { cliente: 'Operadora Alpha', descricao: 'Ampliação da capacidade do enlace de retorno.', stationIdx: 18, dataInicio: '2026-08-17', dataFim: '2026-08-19', status: 'aberta' },
      { cliente: 'Operadora Gamma', descricao: 'Pintura e adequação de segurança da torre.', stationIdx: 19, dataInicio: '2026-08-20', dataFim: '2026-08-22', status: 'em_andamento' },
      { cliente: 'Operadora Beta', descricao: 'Instalação de iluminação de obstrução na torre.', stationIdx: 20, dataInicio: '2026-08-24', dataFim: '2026-08-25', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Análise de interferência no enlace de 23 GHz.', stationIdx: 21, dataInicio: '2026-08-26', dataFim: '2026-08-27', status: 'aberta' },
      { cliente: 'Operadora Gamma', descricao: 'Instalação de rádios 13 GHz e realinhamento de antenas.', stationIdx: 22, dataInicio: '2026-08-03', dataFim: '2026-08-04', status: 'concluida' },
      { cliente: 'Operadora Beta', descricao: 'Manutenção preventiva de energia e aterramento.', stationIdx: 23, dataInicio: '2026-08-06', dataFim: '2026-08-06', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Comissionamento de enlace de 18 GHz entre torres.', stationIdx: 24, dataInicio: '2026-08-07', dataFim: '2026-08-08', status: 'em_andamento' },
      { cliente: 'Operadora Gamma', descricao: 'Instalação de antena parabólica de 1,2m.', stationIdx: 25, dataInicio: '2026-08-10', dataFim: '2026-08-11', status: 'aberta' },
      { cliente: 'Operadora Beta', descricao: 'Atualização de licença de software do rádio.', stationIdx: 26, dataInicio: '2026-08-13', dataFim: '2026-08-13', status: 'concluida' },
      { cliente: 'Operadora Alpha', descricao: 'Troca de cabos de alimentação da torre.', stationIdx: 27, dataInicio: '2026-08-14', dataFim: '2026-08-15', status: 'em_andamento' },
      { cliente: 'Operadora Gamma', descricao: 'Levantamento de visada para novo enlace.', stationIdx: 28, dataInicio: '2026-08-17', dataFim: '2026-08-18', status: 'aberta' },
      { cliente: 'Operadora Beta', descricao: 'Instalação de quadros de energia e disjuntores.', stationIdx: 29, dataInicio: '2026-08-19', dataFim: '2026-08-20', status: 'aberta' },
      { cliente: 'Operadora Alpha', descricao: 'Teste de failover e comutação automática de enlace.', stationIdx: 30, dataInicio: '2026-08-21', dataFim: '2026-08-21', status: 'em_andamento' },
      { cliente: 'Operadora Gamma', descricao: 'Reaperto de conectores e medições de VSWR.', stationIdx: 31, dataInicio: '2026-08-24', dataFim: '2026-08-24', status: 'aberta' },
      { cliente: 'Operadora Beta', descricao: 'Inspeção e laudo fotográfico da estação.', stationIdx: 32, dataInicio: '2026-08-26', dataFim: '2026-08-27', status: 'aberta' },
    ];

    let created = 0;
    for (const so of serviceOrders) {
      const station = so.stationIdx != null ? stations[so.stationIdx] : undefined;
      await this.serviceOrdersService.create({
        cliente: so.cliente,
        descricao: so.descricao,
        siteId: station?.siteId,
        endId: station?.endId,
        operadora: (so.operadora ?? station?.mobileCarrier ?? 'Outras') as 'TIM' | 'CLARO' | 'VIVO' | 'Outras',
        endereco: station?.address ?? undefined,
        dataInicio: so.dataInicio,
        dataFim: so.dataFim,
        status: so.status,
        observacoes: so.observacoes,
      });
      created++;
    }

    console.log(`Seed: ${created} service orders created`);
  }

  private async seedClients() {
    const { total } = await this.clientsService.findAll({ limit: 1 });
    if (total > 0) return;

    type SeedClient = {
      nome: string;
      documento?: string;
      email?: string;
      telefone?: string;
      endereco?: string;
      cidade?: string;
      uf?: string;
      observacoes?: string;
      status: 'ativo' | 'inativo';
    };

    const clients: SeedClient[] = [
      { nome: 'Operadora Alpha Telecom', documento: '12.345.678/0001-90', email: 'contato@alpha.com.br', telefone: '(11) 4000-1001', endereco: 'Av. Paulista, 1000', cidade: 'São Paulo', uf: 'SP', observacoes: 'Contrato anual de manutenção de enlaces.', status: 'ativo' },
      { nome: 'Operadora Beta Mobile', documento: '23.456.789/0001-01', email: 'contato@betamobile.com.br', telefone: '(11) 4000-1002', endereco: 'Av. Faria Lima, 2000', cidade: 'São Paulo', uf: 'SP', status: 'ativo' },
      { nome: 'Operadora Gamma Fiber', documento: '34.567.890/0001-12', email: 'contato@gammafiber.com.br', telefone: '(11) 4000-1003', endereco: 'Av. Ibirapuera, 2500', cidade: 'São Paulo', uf: 'SP', observacoes: 'Expandindo rede de fibra em condomínios.', status: 'ativo' },
      { nome: 'Norte Redes Telecom', documento: '45.678.901/0001-23', email: 'contato@norteredestelecom.com.br', telefone: '(92) 3000-1004', endereco: 'Av. das Torres, 500', cidade: 'Manaus', uf: 'AM', status: 'ativo' },
      { nome: 'Sul Conecta Ltda', documento: '56.789.012/0001-34', email: 'contato@sulconecta.com.br', telefone: '(51) 3000-1005', endereco: 'Av. Ipiranga, 1500', cidade: 'Porto Alegre', uf: 'RS', status: 'ativo' },
      { nome: 'Leste Fibra Óptica', documento: '67.890.123/0001-45', email: 'contato@lestefibra.com.br', telefone: '(21) 3000-1006', endereco: 'Av. das Américas, 3000', cidade: 'Rio de Janeiro', uf: 'RJ', status: 'ativo' },
      { nome: 'Centro Telecom SP', documento: '78.901.234/0001-56', email: 'contato@centrotelecom.com.br', telefone: '(11) 3000-1007', endereco: 'Rua da Consolação, 1500', cidade: 'São Paulo', uf: 'SP', status: 'ativo' },
      { nome: 'Vale Rádio Comunicações', documento: '89.012.345/0001-67', email: 'contato@valeradio.com.br', telefone: '(12) 3000-1008', endereco: 'Av. Paraibuna, 900', cidade: 'São José dos Campos', uf: 'SP', observacoes: 'Enlaces rurais de longa distância.', status: 'ativo' },
      { nome: 'Serra Antenas Ltda', documento: '90.123.456/0001-78', email: 'contato@serraantenas.com.br', telefone: '(27) 3000-1009', endereco: 'Av. Nossa Senhora da Penha, 700', cidade: 'Vitória', uf: 'ES', status: 'ativo' },
      { nome: 'Praia Net Banda Larga', documento: '11.234.567/0001-89', email: 'contato@praianet.com.br', telefone: '(48) 3000-1010', endereco: 'Av. Beira-Mar, 800', cidade: 'Florianópolis', uf: 'SC', status: 'ativo' },
      { nome: 'Campo Wireless', documento: '22.345.678/0001-90', email: 'contato@campowireless.com.br', telefone: '(62) 3000-1011', endereco: 'Av. Goiás, 1200', cidade: 'Goiânia', uf: 'GO', status: 'ativo' },
      { nome: 'Sertão Telecom', documento: '33.456.789/0001-01', email: 'contato@sertaotelecom.com.br', telefone: '(81) 3000-1012', endereco: 'Av. Agamenon Magalhães, 800', cidade: 'Recife', uf: 'PE', status: 'inativo' },
      { nome: 'Bahia Link', documento: '44.567.890/0001-12', email: 'contato@bahialink.com.br', telefone: '(71) 3000-1013', endereco: 'Av. Oceânica, 2000', cidade: 'Salvador', uf: 'BA', status: 'ativo' },
      { nome: 'Centro-Oeste Comunic', documento: '55.678.901/0001-23', email: 'contato@centrooestecomunic.com.br', telefone: '(67) 3000-1014', endereco: 'Av. Afonso Pena, 1500', cidade: 'Campo Grande', uf: 'MS', status: 'ativo' },
      { nome: 'Norte Forte Telecom', documento: '66.789.012/0001-34', email: 'contato@norteforte.com.br', telefone: '(91) 3000-1015', endereco: 'Av. Presidente Vargas, 500', cidade: 'Belém', uf: 'PA', status: 'ativo' },
      { nome: 'Nordeste Digital', documento: '77.890.123/0001-45', email: 'contato@nordestedigital.com.br', telefone: '(85) 3000-1016', endereco: 'Av. Bezerra de Menezes, 1800', cidade: 'Fortaleza', uf: 'CE', status: 'ativo' },
      { nome: 'Minas Conecta', documento: '88.901.234/0001-56', email: 'contato@minasconecta.com.br', telefone: '(31) 3000-1017', endereco: 'Av. Afonso Pena, 2500', cidade: 'Belo Horizonte', uf: 'MG', observacoes: 'Projeto de expansão 5G.', status: 'ativo' },
      { nome: 'Paraná Rádio Enlaces', documento: '99.012.345/0001-67', email: 'contato@paranaradio.com.br', telefone: '(41) 3000-1018', endereco: 'Av. Sete de Setembro, 3000', cidade: 'Curitiba', uf: 'PR', status: 'ativo' },
      { nome: 'Catarina Fibra', documento: '10.987.654/0001-78', email: 'contato@catarinafibra.com.br', telefone: '(49) 3000-1019', endereco: 'Rua Frei Gabriel, 400', cidade: 'Blumenau', uf: 'SC', status: 'inativo' },
      { nome: 'Rio Grande Net', documento: '21.876.543/0001-89', email: 'contato@riograndenet.com.br', telefone: '(53) 3000-1020', endereco: 'Av. Rio Branco, 600', cidade: 'Pelotas', uf: 'RS', status: 'ativo' },
      { nome: 'Goiás Rural Link', documento: '32.765.432/0001-90', email: 'contato@goiasrural.com.br', telefone: '(64) 3000-1021', endereco: 'Av. Paranaíba, 300', cidade: 'Rio Verde', uf: 'GO', observacoes: 'Internet rural via rádio.', status: 'ativo' },
      { nome: 'Mato Grosso Fibra', documento: '43.654.321/0001-01', email: 'contato@mtfibra.com.br', telefone: '(65) 3000-1022', endereco: 'Av. Fernando Corrêa da Costa, 700', cidade: 'Cuiabá', uf: 'MT', status: 'ativo' },
      { nome: 'Tocantins Telecom', documento: '54.543.210/0001-12', email: 'contato@totelecom.com.br', telefone: '(63) 3000-1023', endereco: 'Av. Joaquim Teotônio Segurado, 1000', cidade: 'Palmas', uf: 'TO', status: 'ativo' },
      { nome: 'Amazônia Link', documento: '65.432.109/0001-23', email: 'contato@amazonialink.com.br', telefone: '(92) 3000-1024', endereco: 'Av. Constantino Nery, 800', cidade: 'Manaus', uf: 'AM', status: 'ativo' },
      { nome: 'Rondônia Conecta', documento: '76.321.098/0001-34', email: 'contato@roconecta.com.br', telefone: '(69) 3000-1025', endereco: 'Av. Presidente Dutra, 600', cidade: 'Porto Velho', uf: 'RO', status: 'ativo' },
      { nome: 'Acre Net', documento: '87.210.987/0001-45', email: 'contato@acrenet.com.br', telefone: '(68) 3000-1026', endereco: 'Av. Ceará, 400', cidade: 'Rio Branco', uf: 'AC', status: 'inativo' },
      { nome: 'Espírito Santo Rádio', documento: '98.109.876/0001-56', email: 'contato@esradio.com.br', telefone: '(27) 3000-1027', endereco: 'Av. Dante Michelini, 1000', cidade: 'Vitória', uf: 'ES', status: 'ativo' },
      { nome: 'Pernambuco Digital', documento: '09.098.765/0001-67', email: 'contato@pe-digital.com.br', telefone: '(81) 3000-1028', endereco: 'Av. Caxangá, 1200', cidade: 'Recife', uf: 'PE', status: 'ativo' },
      { nome: 'Ceará Wireless', documento: '01.987.654/0001-78', email: 'contato@cearawireless.com.br', telefone: '(85) 3000-1029', endereco: 'Av. Washington Soares, 900', cidade: 'Fortaleza', uf: 'CE', status: 'ativo' },
      { nome: 'Alagoas Link', documento: '02.876.543/0001-89', email: 'contato@alagolaslink.com.br', telefone: '(82) 3000-1030', endereco: 'Av. Fernandes Lima, 800', cidade: 'Maceió', uf: 'AL', status: 'ativo' },
      { nome: 'Sergipe Net', documento: '03.765.432/0001-90', email: 'contato@sergipenet.com.br', telefone: '(79) 3000-1031', endereco: 'Av. Tancredo Neves, 1000', cidade: 'Aracaju', uf: 'SE', status: 'ativo' },
      { nome: 'Paraíba Conecta', documento: '04.654.321/0001-01', email: 'contato@pbconecta.com.br', telefone: '(83) 3000-1032', endereco: 'Av. Epitácio Pessoa, 1200', cidade: 'João Pessoa', uf: 'PB', status: 'ativo' },
      { nome: 'Piauí Telecom', documento: '05.543.210/0001-12', email: 'contato@piauitelecom.com.br', telefone: '(86) 3000-1033', endereco: 'Av. Maranhão, 700', cidade: 'Teresina', uf: 'PI', status: 'ativo' },
    ];

    for (const client of clients) {
      await this.clientsService.create(client);
    }

    console.log(`Seed: ${clients.length} clients created`);
  }

  private async seedPdca() {
    const { total } = await this.pdcaService.findAll({ limit: 1 });
    if (total > 0) return;

    const { data: projects } = await this.projectsService.findAll({ limit: 100 });
    const projectId = (index: number) => projects[index]?.id ?? null;

    const ciclos = [
      {
        projectId: projectId(0),
        titulo: 'Reduzir indisponibilidade do enlace Norte',
        problema: 'Enlace do site Norte apresenta indisponibilidade recorrente em horário comercial.',
        impacto: 'Cliente sem conectividade em horário de pico.',
        areaSetor: 'Operações / Rede',
        responsavelCiclo: 'Diego Nunes',
        tecnicaAnalise: '5-porques',
        causaRaiz: 'Falta de manutenção preventiva nos rádios do enlace.',
        meta: 'Reduzir indisponibilidade para menos de 1% no mês.',
        fase: 'plan',
        statusCiclo: 'aberto',
        observacoes: 'Ciclo inicial de melhoria contínua.',
      },
      {
        projectId: projectId(1),
        titulo: 'Otimizar comissionamento 11 GHz',
        problema: 'Comissionamento do enlace de 11 GHz está levando mais tempo que o planejado.',
        impacto: 'Atraso na entrega para o cliente.',
        areaSetor: 'Implantação',
        responsavelCiclo: 'Bruno Martins',
        tecnicaAnalise: 'ishikawa',
        causaRaiz: 'Falta de checklist padronizado de comissionamento.',
        meta: 'Reduzir tempo médio de comissionamento em 30%.',
        fase: 'do',
        statusCiclo: 'em_execucao',
      },
      {
        projectId: projectId(2),
        titulo: 'Melhorar qualidade da rede LTE',
        problema: 'Indicadores de drop rate acima da meta em área urbana.',
        impacto: 'Reclamações de clientes.',
        areaSetor: 'Qualidade de Rede',
        responsavelCiclo: 'Adriana Costa',
        tecnicaAnalise: 'livre',
        causaRaiz: 'Parâmetros de handover desajustados.',
        meta: 'Reduzir drop rate para abaixo de 2%.',
        fase: 'check',
        statusCiclo: 'em_verificacao',
        resultadoCheck: 'Drop rate reduzido de 4,1% para 2,3%.',
        kpi: 'Drop rate (%)',
        resultadoMedicao: 'Medição por drive test em 15 dias.',
        statusValidacao: 'sucesso_parcial',
        dataVerificacao: '2026-07-20',
        responsavelValidacao: 'Adriana Costa',
      },
      {
        projectId: projectId(0),
        titulo: 'Padronizar manutenção preventiva',
        problema: 'Manutenções preventivas executadas de forma não padronizada entre equipes.',
        impacto: 'Variação na qualidade dos enlaces.',
        areaSetor: 'Operações / Rede',
        responsavelCiclo: 'Diego Nunes',
        tecnicaAnalise: '5-porques',
        causaRaiz: 'Ausência de procedimento operacional padrão.',
        meta: 'Documentar e aplicar POP de manutenção preventiva.',
        fase: 'act',
        statusCiclo: 'concluido',
        resultadoCheck: 'POP aplicado em 100% das estações da região.',
        statusValidacao: 'sucesso',
        dataVerificacao: '2026-06-10',
        responsavelValidacao: 'Diego Nunes',
        decisoesAct: 'Padronizar POP de manutenção preventiva em todas as unidades.',
        pop: 'POP-MAN-001: Manutenção preventiva mensal de rádios.',
        licaoAprendida: 'Checklist padronizado reduziu tempo e erros de execução.',
        dataConclusao: '2026-06-15',
      },
    ];

    const created: number[] = [];
    for (const ciclo of ciclos) {
      const saved = await this.pdcaService.create(ciclo);
      created.push(saved.id);
    }

    console.log(`Seed: ${ciclos.length} PDCA cycles created`);

    const acoesPorCiclo: Record<
      number,
      {
        what: string;
        why?: string;
        ondeAplicacao?: string;
        whenInicio?: string;
        whenPrazo?: string;
        who?: string;
        how?: string;
        howMuch?: number;
        status?: string;
        progresso?: number;
        observacoes?: string;
      }[]
    > = {
      [created[1]]: [
        { what: 'Criar checklist de comissionamento', why: 'Padronizar a execução', ondeAplicacao: 'Campo', whenInicio: '2026-05-01', whenPrazo: '2026-05-10', who: 'Bruno Martins', how: 'Elaborar checklist com base nas boas práticas', status: 'concluido', progresso: 100 },
        { what: 'Capacitar equipe no novo checklist', why: 'Garantir aderência da equipe', ondeAplicacao: 'Implantação', whenInicio: '2026-05-15', whenPrazo: '2026-05-25', who: 'Bruno Martins', how: 'Treinamento prático em campo', status: 'em_andamento', progresso: 60 },
        { what: 'Medir tempo médio de comissionamento', why: 'Avaliar resultado da melhoria', ondeAplicacao: 'Backoffice', whenInicio: '2026-06-01', whenPrazo: '2026-06-15', who: 'Camila Rocha', how: 'Levantamento a partir das ordens de serviço', status: 'pendente', progresso: 0 },
      ],
      [created[2]]: [
        { what: 'Ajustar parâmetros de handover', why: 'Corrigir drop rate', ondeAplicacao: 'Rede LTE', whenInicio: '2026-06-01', whenPrazo: '2026-06-20', who: 'Adriana Costa', how: 'Reconfiguração remota via sistema', status: 'concluido', progresso: 100 },
        { what: 'Realizar drive test de validação', why: 'Validar melhoria', ondeAplicacao: 'Área urbana', whenInicio: '2026-07-01', whenPrazo: '2026-07-10', who: 'Adriana Costa', status: 'concluido', progresso: 100 },
      ],
      [created[3]]: [
        { what: 'Elaborar POP de manutenção preventiva', why: 'Padronizar procedimento', ondeAplicacao: 'Operações', whenInicio: '2026-05-01', whenPrazo: '2026-05-20', who: 'Diego Nunes', how: 'Documentar procedimento em conjunto com a equipe', status: 'concluido', progresso: 100 },
        { what: 'Divulgar POP para todas as equipes', why: 'Aplicar padronização', ondeAplicacao: 'Todas as unidades', whenInicio: '2026-05-25', whenPrazo: '2026-06-05', who: 'Diego Nunes', status: 'concluido', progresso: 100 },
      ],
    };

    let totalAcoes = 0;
    for (const [pdcaId, acoes] of Object.entries(acoesPorCiclo)) {
      for (const acao of acoes) {
        await this.pdcaService.createAction(Number(pdcaId), acao);
        totalAcoes++;
      }
    }

    console.log(`Seed: ${totalAcoes} PDCA actions created`);
  }
}
