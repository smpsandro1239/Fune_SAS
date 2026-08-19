import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsGeneratorService } from './documents-generator.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DocumentsGeneratorService', () => {
  let service: DocumentsGeneratorService;
  let prisma: {
    funeral: { findFirst: jest.Mock };
    agency: { findUnique: jest.Mock };
  };

  const mockAgency = {
    id: 'agency-1',
    name: 'Funerária Teste',
    phone: '+351 999 999 999',
    email: 'teste@teste.pt',
    address: 'Rua Teste, 1',
    location: 'Braga',
    website: 'https://teste.pt',
    logoUrl: null,
  };

  const mockFuneral = {
    id: 'funeral-1',
    agencyId: 'agency-1',
    funeralDate: new Date('2026-08-20T10:00:00Z'),
    funeralTime: '10:00',
    locationParish: 'Igreja de São Victor',
    cemeteryLocation: 'Cemitério Municipal',
    wakeLocation: 'Capela Mortuária',
    wakeDate: new Date('2026-08-19T18:00:00Z'),
    wakeTime: '18:00',
    serviceType: 'CERIMONIA',
    deceased: {
      fullName: 'Manuel António da Silva',
      age: 78,
      dateOfBirth: new Date('1948-03-15'),
      dateOfDeath: new Date('2026-08-18'),
      placeOfDeath: 'Hospital de Braga',
    },
  };

  beforeEach(async () => {
    prisma = {
      funeral: { findFirst: jest.fn() },
      agency: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsGeneratorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DocumentsGeneratorService>(DocumentsGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    beforeEach(() => {
      prisma.funeral.findFirst.mockResolvedValue(mockFuneral);
      prisma.agency.findUnique.mockResolvedValue(mockAgency);
    });

    it('should throw NotFoundException if funeral not found', async () => {
      prisma.funeral.findFirst.mockResolvedValue(null);

      await expect(service.generate('agency-1', 'bad-id', 'PRESENCA')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if agency not found', async () => {
      prisma.agency.findUnique.mockResolvedValue(null);

      await expect(service.generate('agency-1', 'funeral-1', 'PRESENCA')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unsupported type', async () => {
      await expect(service.generate('agency-1', 'funeral-1', 'INVALID' as any)).rejects.toThrow(BadRequestException);
    });

    it('should generate a PRESENCA document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'PRESENCA', { presentName: 'João Silva', presentRelation: 'Sobrinho' });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PROGRAMA document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'PROGRAMA');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a CREMACAO document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'CREMACAO', {
        requesterName: 'Filho Silva',
        requesterId: '123456789',
        requesterRelation: 'Filho',
        requesterAddress: 'Rua X, Braga',
      });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a TRANSPORTE_DOCS document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'TRANSPORTE_DOCS', {
        origin: 'Hospital de Braga',
        destination: 'Cemitério Municipal',
        vehicleType: 'Viatura Funerária',
        vehiclePlate: 'AA-12-BB',
        driverName: 'Carlos Santos',
      });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a RELATORIO document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'RELATORIO', {
        clientName: 'Maria Silva',
        items: [{ description: 'Preparação do corpo', quantity: 1, unitPrice: 500 }],
      });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a SEPULTURA document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'SEPULTURA');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a CONDOLENCIA document', async () => {
      const buffer = await service.generate('agency-1', 'funeral-1', 'CONDOLENCIA', { familyName: 'Família Silva' });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('getFilename', () => {
    it('should return correct filenames for all types', () => {
      expect(service.getFilename('PRESENCA', 'Manuel Silva')).toBe('Declaracao_Presenca_Manuel_Silva');
      expect(service.getFilename('PROGRAMA', 'Manuel Silva')).toBe('Programa_Funeral_Manuel_Silva');
      expect(service.getFilename('CREMACAO', 'Manuel Silva')).toBe('Autorizacao_Cremacao_Manuel_Silva');
      expect(service.getFilename('TRANSPORTE_DOCS', 'Manuel Silva')).toBe('Guia_Transporte_Manuel_Silva');
      expect(service.getFilename('RELATORIO', 'Manuel Silva')).toBe('Relatorio_Servico_Manuel_Silva');
      expect(service.getFilename('SEPULTURA', 'Manuel Silva')).toBe('Certidao_Sepultura_Manuel_Silva');
      expect(service.getFilename('CONDOLENCIA', 'Manuel Silva')).toBe('Carta_Condolencia_Manuel_Silva');
    });

    it('should handle unknown type gracefully', () => {
      const result = service.getFilename('UNKNOWN' as any, 'Test');
      expect(result).toBe('Documento_Test');
    });
  });
});
