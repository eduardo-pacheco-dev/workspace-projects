import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { FreelancersService } from '../freelancers/freelancers.service';
import { JobsService } from '../jobs/jobs.service';
import { LpuService } from '../lpu/lpu.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    private readonly freelancersService: FreelancersService,
    private readonly jobsService: JobsService,
    private readonly lpuService: LpuService,
  ) {}

  async onApplicationBootstrap() {
    const enabled = process.env.NODE_ENV !== 'production' || process.env.SEED === 'true';
    if (!enabled) return;

    await this.seedAdmin();
    await this.seedFreelancers();
    await this.seedJobs();
    await this.seedLpus();
  }

  private async seedAdmin() {
    const admin = await this.usersService.findByEmail('admin@admin.com');
    if (admin) return;

    const hashedPassword = await bcrypt.hash('123456', 10);
    await this.usersService.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
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
}
