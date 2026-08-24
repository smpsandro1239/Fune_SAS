import { Test, TestingModule } from '@nestjs/testing';
import { DraftsController } from './drafts.controller';
import { DraftsService } from './drafts.service';

describe('DraftsController', () => {
  let controller: DraftsController;
  let service: DraftsService;

  const mockDraftsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DraftsController],
      providers: [{ provide: DraftsService, useValue: mockDraftsService }],
    }).compile();

    controller = module.get<DraftsController>(DraftsController);
    service = module.get<DraftsService>(DraftsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return drafts for the agency', async () => {
      const mockDrafts = [
        { id: '1', name: 'Teste', layoutStyle: 'elegante-minimal', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockDraftsService.findAll.mockResolvedValue(mockDrafts);

      const result = controller.findAll({ user: { agencyId: 'agency-1' } });

      expect(result).resolves.toEqual(mockDrafts);
      expect(mockDraftsService.findAll).toHaveBeenCalledWith('agency-1');
    });
  });

  describe('findOne', () => {
    it('should return a single draft', async () => {
      const mockDraft = { id: '1', name: 'Teste', data: {}, layoutStyle: 'elegante-minimal' };
      mockDraftsService.findOne.mockResolvedValue(mockDraft);

      const result = await controller.findOne('1', { user: { agencyId: 'agency-1' } });

      expect(result).toEqual(mockDraft);
      expect(mockDraftsService.findOne).toHaveBeenCalledWith('1', 'agency-1');
    });
  });

  describe('create', () => {
    it('should create a new draft', async () => {
      const body = { name: 'Novo Rascunho', layoutStyle: 'elegante-minimal', data: { title: 'Teste' } };
      mockDraftsService.create.mockResolvedValue({ id: 'new-id', ...body });

      const result = await controller.create(body, { user: { agencyId: 'agency-1', id: 'user-1' } });

      expect(result).toHaveProperty('id', 'new-id');
      expect(mockDraftsService.create).toHaveBeenCalledWith(body, 'agency-1', 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a draft', async () => {
      mockDraftsService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove('1', { user: { agencyId: 'agency-1' } });

      expect(result).toEqual({ id: '1' });
      expect(mockDraftsService.remove).toHaveBeenCalledWith('1', 'agency-1');
    });
  });
});
