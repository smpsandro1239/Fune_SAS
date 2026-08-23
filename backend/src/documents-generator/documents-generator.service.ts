import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generatePresenca, PresencaData } from './templates/presenca.template';
import { generatePrograma, ProgramaData } from './templates/programa.template';
import { generateCremacao, CremacaoData } from './templates/cremacao.template';
import { generateTransporte, TransporteData } from './templates/transporte.template';
import { generateRelatorio, RelatorioData } from './templates/relatorio.template';
import { generateSepultura, SepulturaData } from './templates/sepultura.template';
import { generateCondolencia, CondolenciaData } from './templates/condolencia.template';
import { generateAtestadoObito, AtestadoObitoData } from './templates/atestado-obito.template';
import { generateAutorizacaoSepultamento, AutorizacaoSepultamentoData } from './templates/autorizacao-sepultamento.template';
import { generateContratoServico, ContratoServicoData } from './templates/contrato-servico.template';
import { generateGuiaPagamento, GuiaPagamentoData } from './templates/guia-pagamento.template';
import { generateDeclaracaoHerdeiros, DeclaracaoHerdeirosData } from './templates/declaracao-herdeiros.template';

export type DocType =
  | 'PRESENCA'
  | 'PROGRAMA'
  | 'CREMACAO'
  | 'TRANSPORTE_DOCS'
  | 'RELATORIO'
  | 'SEPULTURA'
  | 'CONDOLENCIA'
  | 'ATESTADO_OBITO'
  | 'AUTORIZACAO_SEPULTAMENTO'
  | 'CONTRATO_SERVICO'
  | 'GUIA_PAGAMENTO'
  | 'DECLARACAO_HERDEIROS';

@Injectable()
export class DocumentsGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(agencyId: string, funeralId: string, type: DocType, extraData?: Record<string, any>): Promise<Buffer> {
    const funeral = await this.prisma.funeral.findFirst({
      where: { id: funeralId, agencyId },
      include: { deceased: true },
    });
    if (!funeral) throw new NotFoundException('Funeral não encontrado.');

    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency) throw new NotFoundException('Agência não encontrada.');

    const funeralData = {
      deceasedName: funeral.deceased.fullName,
      age: funeral.deceased.age,
      dateOfBirth: funeral.deceased.dateOfBirth?.toISOString(),
      dateOfDeath: funeral.deceased.dateOfDeath?.toISOString(),
      placeOfDeath: funeral.deceased.placeOfDeath,
      funeralDate: funeral.funeralDate.toISOString(),
      funeralTime: funeral.funeralTime,
      locationParish: funeral.locationParish,
      cemeteryLocation: funeral.cemeteryLocation,
      wakeLocation: funeral.wakeLocation,
      wakeDate: funeral.wakeDate?.toISOString(),
      wakeTime: funeral.wakeTime,
      serviceType: funeral.serviceType,
    };

    const agencyData = {
      name: agency.name,
      phone: agency.phone,
      email: agency.email,
      address: agency.address,
      location: agency.location,
      website: agency.website,
      logoUrl: agency.logoUrl,
    };

    let doc;

    switch (type) {
      case 'PRESENCA':
        doc = generatePresenca(funeralData, agencyData, extraData as PresencaData || { presentName: '', presentRelation: '' });
        break;
      case 'PROGRAMA':
        doc = generatePrograma(funeralData, agencyData, extraData as ProgramaData || {});
        break;
      case 'CREMACAO':
        doc = generateCremacao(funeralData, agencyData, extraData as CremacaoData || { requesterName: '', requesterId: '', requesterRelation: '', requesterAddress: '' });
        break;
      case 'TRANSPORTE_DOCS':
        doc = generateTransporte(funeralData, agencyData, extraData as TransporteData || { origin: '', destination: '', vehicleType: '', vehiclePlate: '', driverName: '' });
        break;
      case 'RELATORIO':
        doc = generateRelatorio(funeralData, agencyData, extraData as RelatorioData || { clientName: '', items: [] });
        break;
      case 'SEPULTURA':
        doc = generateSepultura(funeralData, agencyData, extraData as SepulturaData || {});
        break;
      case 'CONDOLENCIA':
        doc = generateCondolencia(funeralData, agencyData, extraData as CondolenciaData || { familyName: '' });
        break;
      case 'ATESTADO_OBITO':
        doc = generateAtestadoObito(funeralData, agencyData, extraData as AtestadoObitoData || {});
        break;
      case 'AUTORIZACAO_SEPULTAMENTO':
        doc = generateAutorizacaoSepultamento(funeralData, agencyData, extraData as AutorizacaoSepultamentoData || {
          requesterName: '', requesterId: '', requesterRelation: '',
        });
        break;
      case 'CONTRATO_SERVICO':
        doc = generateContratoServico(funeralData, agencyData, extraData as ContratoServicoData || {
          clientName: '', clientId: '', clientAddress: '', clientPhone: '', clientEmail: '', items: [],
        });
        break;
      case 'GUIA_PAGAMENTO':
        doc = generateGuiaPagamento(funeralData, agencyData, extraData as GuiaPagamentoData || {
          clientName: '', clientId: '', paymentMethod: '', items: [],
        });
        break;
      case 'DECLARACAO_HERDEIROS':
        doc = generateDeclaracaoHerdeiros(funeralData, agencyData, extraData as DeclaracaoHerdeirosData || {
          heirs: [],
        });
        break;
      default:
        throw new BadRequestException(`Tipo de documento não suportado: ${type}`);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  getFilename(type: DocType, deceasedName: string): string {
    const safe = deceasedName.replace(/\s+/g, '_');
    const names: Record<DocType, string> = {
      PRESENCA: `Declaracao_Presenca_${safe}`,
      PROGRAMA: `Programa_Funeral_${safe}`,
      CREMACAO: `Autorizacao_Cremacao_${safe}`,
      TRANSPORTE_DOCS: `Guia_Transporte_${safe}`,
      RELATORIO: `Relatorio_Servico_${safe}`,
      SEPULTURA: `Certidao_Sepultura_${safe}`,
      CONDOLENCIA: `Carta_Condolencia_${safe}`,
      ATESTADO_OBITO: `Atestado_Obito_${safe}`,
      AUTORIZACAO_SEPULTAMENTO: `Autorizacao_Sepultamento_${safe}`,
      CONTRATO_SERVICO: `Contrato_Servico_${safe}`,
      GUIA_PAGAMENTO: `Guia_Pagamento_${safe}`,
      DECLARACAO_HERDEIROS: `Declaracao_Herdeiros_${safe}`,
    };
    return names[type] || `Documento_${safe}`;
  }
}
