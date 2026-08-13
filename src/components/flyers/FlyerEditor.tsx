'use client';

import React, { useState, useRef } from 'react';
import { FlyerData, FlyerTemplateConfig } from '@/lib/types';
import { PRESET_TEMPLATES, DEFAULT_FLYER_DATA } from '@/lib/templates-preset';
import FlyerCanvasPreview from './FlyerCanvasPreview';
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Palette, 
  User, 
  Calendar, 
  Building2, 
  Sparkles, 
  Check, 
  RefreshCw,
  Share2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function FlyerEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<FlyerTemplateConfig>(PRESET_TEMPLATES[0]);
  const [flyerData, setFlyerData] = useState<FlyerData>(DEFAULT_FLYER_DATA);
  const [activeTab, setActiveTab] = useState<'deceased' | 'ceremony' | 'agency' | 'style'>('deceased');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  // Field change helper
  const handleChange = (field: keyof FlyerData, value: string | number) => {
    setFlyerData((prev) => ({ ...prev, [field]: value }));
  };

  // Export to PNG
  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setExportMessage('A gerar imagem PNG de alta resolução...');
    try {
      const dataUrl = await toPng(previewRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Flyer_${flyerData.deceasedName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      setExportMessage('PNG exportado com sucesso!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setExportMessage('Erro ao exportar PNG.');
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setExportMessage('A preparar documento PDF para impressão...');
    try {
      const dataUrl = await toPng(previewRef.current, { quality: 0.95, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Participacao_${flyerData.deceasedName.replace(/\s+/g, '_')}.pdf`);
      setExportMessage('PDF gerado com sucesso!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setExportMessage('Erro ao exportar PDF.');
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900/90 border border-navy-700/80 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Editor Visual de Flyers & Participações
              <span className="px-2 py-0.5 rounded text-[10px] bg-gold-500/20 text-gold-300 font-semibold border border-gold-500/30">
                Canvas HD
              </span>
            </h1>
            <p className="text-xs text-navy-300">
              Personalize imagens, fotos, logótipos e informações de velório/funeral em tempo real.
            </p>
          </div>
        </div>

        {/* Template Selector & Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                  : 'bg-navy-800 text-navy-200 hover:bg-navy-700 border border-navy-700'
              }`}
            >
              {tmpl.name}
            </button>
          ))}

          <div className="h-6 w-px bg-navy-700 mx-1 hidden sm:block"></div>

          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-all"
          >
            <ImageIcon className="w-4 h-4 text-gold-400" />
            <span>Exportar PNG</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 text-xs font-bold transition-all shadow-md shadow-gold-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Descarregar PDF</span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-3 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>{exportMessage}</span>
          </div>
          {isExporting && <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />}
        </div>
      )}

      {/* Main Workspace Layout (Left: Form Controls, Right: Canvas Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-6 space-y-4 bg-navy-900/80 border border-navy-800 rounded-2xl p-5 shadow-xl">
          {/* Tab Navigation */}
          <div className="flex rounded-xl bg-navy-950 p-1 border border-navy-800">
            <button
              onClick={() => setActiveTab('deceased')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'deceased'
                  ? 'bg-navy-800 text-gold-300 shadow border border-gold-500/20'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Falecido & Foto</span>
            </button>

            <button
              onClick={() => setActiveTab('ceremony')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'ceremony'
                  ? 'bg-navy-800 text-gold-300 shadow border border-gold-500/20'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Cerimónia</span>
            </button>

            <button
              onClick={() => setActiveTab('agency')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'agency'
                  ? 'bg-navy-800 text-gold-300 shadow border border-gold-500/20'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Agência</span>
            </button>
          </div>

          {/* TAB 1: Falecido & Foto */}
          {activeTab === 'deceased' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Título do Anúncio
                </label>
                <input
                  type="text"
                  value={flyerData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Nome Completo do Falecido
                </label>
                <input
                  type="text"
                  value={flyerData.deceasedName}
                  onChange={(e) => handleChange('deceasedName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-bold focus:border-gold-400 focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    Idade (Anos)
                  </label>
                  <input
                    type="number"
                    value={flyerData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    Local do Óbito
                  </label>
                  <input
                    type="text"
                    value={flyerData.deathLocation}
                    onChange={(e) => handleChange('deathLocation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  URL da Fotografia
                </label>
                <input
                  type="text"
                  value={flyerData.photoUrl}
                  onChange={(e) => handleChange('photoUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                />
                <p className="text-[10px] text-navy-400 mt-1">
                  Recomendado: foto vertical com boa definição.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Cerimónia */}
          {activeTab === 'ceremony' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Data e Hora do Funeral
                </label>
                <input
                  type="text"
                  value={flyerData.funeralDateFormatted}
                  onChange={(e) => handleChange('funeralDateFormatted', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  placeholder="Quarta-feira, dia 8 de julho, 17:00 horas"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Local da Cerimónia / Igreja Paroquial
                </label>
                <input
                  type="text"
                  value={flyerData.parishLocation}
                  onChange={(e) => handleChange('parishLocation', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Local do Cemitério
                </label>
                <input
                  type="text"
                  value={flyerData.cemeteryLocation}
                  onChange={(e) => handleChange('cemeteryLocation', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Informações de Velório / Observações
                </label>
                <textarea
                  rows={3}
                  value={flyerData.wakeDetailsFormatted}
                  onChange={(e) => handleChange('wakeDetailsFormatted', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Agência */}
          {activeTab === 'agency' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  Nome da Funerária
                </label>
                <input
                  type="text"
                  value={flyerData.agencyName}
                  onChange={(e) => handleChange('agencyName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-bold focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={flyerData.agencyAddress}
                    onChange={(e) => handleChange('agencyAddress', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    Localidade
                  </label>
                  <input
                    type="text"
                    value={flyerData.agencyLocation}
                    onChange={(e) => handleChange('agencyLocation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    Texto de Fundação
                  </label>
                  <input
                    type="text"
                    value={flyerData.agencyFounded}
                    onChange={(e) => handleChange('agencyFounded', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                    placeholder="DESDE 1890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    Website / Email
                  </label>
                  <input
                    type="text"
                    value={flyerData.agencyWebsite}
                    onChange={(e) => handleChange('agencyWebsite', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Canvas Preview Display */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="mb-2 text-xs font-semibold text-navy-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Pré-visualização em Tempo Real (Canvas Render)</span>
          </div>

          <div className="p-4 bg-navy-950/60 rounded-3xl border border-navy-800 shadow-2xl flex justify-center overflow-auto max-w-full">
            <FlyerCanvasPreview 
              data={flyerData} 
              template={selectedTemplate} 
              previewRef={previewRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
