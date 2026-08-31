import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import jsPDF from 'jspdf';
import { FuneralData, AgencyData } from './pdf.helpers';
import { generatePresenca, PresencaData } from './templates/presenca.template';
import { generatePrograma, ProgramaData } from './templates/programa.template';
import { generateCremacao, CremacaoData } from './templates/cremacao.template';
import { generateTransporte, TransporteData } from './templates/transporte.template';
import { generateRelatorio, RelatorioData } from './templates/relatorio.template';
import { generateSepultura, SepulturaData } from './templates/sepultura.template';
import { generateCondolencia, CondolenciaData } from './templates/condolencia.template';
import { generateAtestadoObito, AtestadoObitoData } from './templates/atestado-obito.template';
import {
  generateAutorizacaoSepultamento,
  AutorizacaoSepultamentoData,
} from './templates/autorizacao-sepultamento.template';
import {
  generateContratoServico,
  ContratoServicoData,
} from './templates/contrato-servico.template';
import { generateGuiaPagamento, GuiaPagamentoData } from './templates/guia-pagamento.template';
import {
  generateDeclaracaoHerdeiros,
  DeclaracaoHerdeirosData,
} from './templates/declaracao-herdeiros.template';
import { generateOrcamento, OrcamentoData } from './templates/orcamento.template';
import {
  generateAutorizacaoTransporte,
  AutorizacaoTransporteData,
} from './templates/autorizacao-transporte.template';

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
  | 'DECLARACAO_HERDEIROS'
  | 'ORCAMENTO'
  | 'AUTORIZACAO_TRANSPORTE';

@Injectable()
export class DocumentsGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(
    agencyId: string,
    funeralId: string,
    type: DocType,
    extraData?: Record<string, any>,
    copies: number = 1,
  ): Promise<Buffer> {
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

    const totalCopies = Math.min(99, Math.max(1, Math.floor(copies) || 1));
    let doc = this.renderDoc(type, funeralData, agencyData, extraData);
    for (let i = 1; i < totalCopies; i++) {
      doc.addPage();
      this.renderDoc(type, funeralData, agencyData, extraData, doc);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  private renderDoc(
    type: DocType,
    funeralData: FuneralData,
    agencyData: AgencyData,
    extraData?: Record<string, any>,
    sharedDoc?: jsPDF,
  ): jsPDF {
    switch (type) {
      case 'PRESENCA':
        return generatePresenca(
          funeralData,
          agencyData,
          ((extraData || {}) as PresencaData),
          sharedDoc,
        );
      case 'PROGRAMA':
        return generatePrograma(funeralData, agencyData, ((extraData || {}) as ProgramaData), sharedDoc);
      case 'CREMACAO':
        return generateCremacao(
          funeralData,
          agencyData,
          ((extraData || {}) as CremacaoData),
          sharedDoc,
        );
      case 'TRANSPORTE_DOCS':
        return generateTransporte(
          funeralData,
          agencyData,
          ((extraData || {}) as TransporteData),
          sharedDoc,
        );
      case 'RELATORIO':
        return generateRelatorio(
          funeralData,
          agencyData,
          ((extraData || {}) as RelatorioData),
          sharedDoc,
        );
      case 'SEPULTURA':
        return generateSepultura(funeralData, agencyData, ((extraData || {}) as SepulturaData), sharedDoc);
      case 'CONDOLENCIA':
        return generateCondolencia(
          funeralData,
          agencyData,
          ((extraData || {}) as CondolenciaData),
          sharedDoc,
        );
      case 'ATESTADO_OBITO':
        return generateAtestadoObito(
          funeralData,
          agencyData,
          ((extraData || {}) as AtestadoObitoData),
          sharedDoc,
        );
      case 'AUTORIZACAO_SEPULTAMENTO':
        return generateAutorizacaoSepultamento(
          funeralData,
          agencyData,
          ((extraData || {}) as AutorizacaoSepultamentoData),
          sharedDoc,
        );
      case 'CONTRATO_SERVICO':
        return generateContratoServico(
          funeralData,
          agencyData,
          ((extraData || {}) as ContratoServicoData),
          sharedDoc,
        );
      case 'GUIA_PAGAMENTO':
        return generateGuiaPagamento(
          funeralData,
          agencyData,
          ((extraData || {}) as GuiaPagamentoData),
          sharedDoc,
        );
      case 'DECLARACAO_HERDEIROS':
        return generateDeclaracaoHerdeiros(
          funeralData,
          agencyData,
          ((extraData || {}) as DeclaracaoHerdeirosData),
          sharedDoc,
        );
      case 'ORCAMENTO':
        return generateOrcamento(
          funeralData,
          agencyData,
          ((extraData || {}) as OrcamentoData),
          sharedDoc,
        );
      case 'AUTORIZACAO_TRANSPORTE':
        return generateAutorizacaoTransporte(
          funeralData,
          agencyData,
          ((extraData || {}) as AutorizacaoTransporteData),
          sharedDoc,
        );
      default:
        throw new BadRequestException(`Tipo de documento não suportado: ${type}`);
    }
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
      ORCAMENTO: `Orcamento_Servicos_Funerarios_${safe}`,
      AUTORIZACAO_TRANSPORTE: `Autorizacao_Transporte_Restos_Mortais_${safe}`,
    };
    return names[type] || `Documento_${safe}`;
  }
}
