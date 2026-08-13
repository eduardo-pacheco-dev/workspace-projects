import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmObservationRepository } from './typeorm-observation.repository';
import { ServiceOrderObservationEntity } from './observation.entity';
import { ServiceOrderEntity } from '../../infrastructure/service-order.entity';
import { ServiceOrderObservation } from '../domain/observation.entity';

describe('TypeOrmObservationRepository', () => {
  let repository: TypeOrmObservationRepository;
  let moduleRef: TestingModule;
  let serviceOrderRepo: Repository<ServiceOrderEntity>;
  let serviceOrderId: number;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: [ServiceOrderEntity, ServiceOrderObservationEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([ServiceOrderEntity, ServiceOrderObservationEntity]),
      ],
      providers: [TypeOrmObservationRepository],
    }).compile();

    repository = moduleRef.get(TypeOrmObservationRepository);
    serviceOrderRepo = moduleRef.get<Repository<ServiceOrderEntity>>(getRepositoryToken(ServiceOrderEntity));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await serviceOrderRepo.clear();
    const serviceOrder = await serviceOrderRepo.save({ numero: 'OS-001', cliente: 'Vivo' });
    serviceOrderId = serviceOrder.id;
  });

  it('should create and find an observation', async () => {
    const created = await repository.create(
      new ServiceOrderObservation({ serviceOrderId, title: 'A', position: 0 }),
    );

    const found = await repository.findById(created.id!);
    expect(found?.title).toBe('A');
  });

  it('should compute the max position', async () => {
    await repository.create(new ServiceOrderObservation({ serviceOrderId, title: 'A', position: 2 }));
    await repository.create(new ServiceOrderObservation({ serviceOrderId, title: 'B', position: 5 }));

    expect(await repository.findMaxPosition(serviceOrderId)).toBe(5);
    expect(await repository.findMaxPosition(999)).toBe(0);
  });

  it('should list observations ordered by position', async () => {
    await repository.create(new ServiceOrderObservation({ serviceOrderId, title: 'A', position: 1 }));
    await repository.create(new ServiceOrderObservation({ serviceOrderId, title: 'B', position: 0 }));

    const rows = await repository.findByServiceOrder(serviceOrderId);
    expect(rows.map((row) => row.title)).toEqual(['B', 'A']);
  });

  it('should save an updated observation', async () => {
    const created = await repository.create(
      new ServiceOrderObservation({ serviceOrderId, title: 'A', position: 0 }),
    );
    created.title = 'Novo';

    const updated = await repository.save(created);
    expect(updated.title).toBe('Novo');
  });

  it('should save many and delete', async () => {
    const a = await repository.create(new ServiceOrderObservation({ serviceOrderId, title: 'A', position: 0 }));
    const b = await repository.create(new ServiceOrderObservation({ serviceOrderId, title: 'B', position: 1 }));
    a.position = 9;
    b.position = 8;
    await repository.saveMany([a, b]);

    const rows = await repository.findByServiceOrder(serviceOrderId);
    expect(rows.map((row) => row.position)).toEqual([8, 9]);

    await repository.delete(a.id!);
    expect(await repository.findById(a.id!)).toBeNull();
  });
});
