'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  FileCheck, 
  Download, 
  ShieldAlert, 
  Lock,
  Calendar,
  FolderOpen
} from 'lucide-react';

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CERTIFICATE' | 'AUTHORIZATION' | 'CONTRACT'>('ALL');

  const documents = [
    {
      id: '1',
      title: 'Certidão de Óbito - Luís Freitas',
      type: 'CERTIFICATE',
      category: 'Certidões',
      size: '1.2 MB',
      date: '06 Jul 2026',
      funeral: 'LUÍS FILIPE DA SILVA FREITAS',
      verified: true,
    },
    {
      id: '2',
      title: 'Autorização de Trasladação e Sepultamento',
      type: 'AUTHORIZATION',
      category: 'Autorizações',
      size: '850 KB',
      date: '07 Jul 2026',
      funeral: 'LUÍS FILIPE DA SILVA FREITAS',
      verified: true,
    },
    {
      id: '3',
      title: 'Contrato de Prestação de Serviços Funerários #2026-089',
      type: 'CONTRACT',
      category: 'Contratos',
      size: '2.4 MB',
      date: '06 Jul 2026',
      funeral: 'LUÍS FILIPE DA SILVA FREITAS',
      verified: true,
    },
    {
      id: '4',
      title: 'Certidão Médica de Verificação de Óbito - Maria Ribeiro',
      type: 'CERTIFICATE',
      category: 'Certidões',
      size: '1.8 MB',
      date: '10 Aug 2026',
      funeral: 'MARIA JOAQUINA ALVES RIBEIRO',
      verified: true,
    },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.funeral.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || doc.type === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" />
            Gestão Documental & RGPD
          </h1>
          <p className="text-xs text-navy-300">
            Armazenamento encriptado de certidões, contratos e autorizações por funeral.
          </p>
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110">
          <UploadCloud className="w-4 h-4" />
          <span>Carregar Documento</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-navy-900/80 border border-navy-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por título ou nome do falecido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeCategory === 'ALL' ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 text-navy-300 hover:text-white'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveCategory('CERTIFICATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeCategory === 'CERTIFICATE' ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 text-navy-300 hover:text-white'}`}
          >
            Certidões
          </button>
          <button
            onClick={() => setActiveCategory('AUTHORIZATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeCategory === 'AUTHORIZATION' ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 text-navy-300 hover:text-white'}`}
          >
            Autorizações
          </button>
          <button
            onClick={() => setActiveCategory('CONTRACT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeCategory === 'CONTRACT' ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 text-navy-300 hover:text-white'}`}
          >
            Contratos
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between text-xs text-navy-400 font-bold uppercase tracking-wider">
          <span>Ficheiro</span>
          <span className="hidden md:inline">Funeral Associado</span>
          <span>Tamanho</span>
          <span>Ações</span>
        </div>

        <div className="divide-y divide-navy-800">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-navy-800/50 transition-colors">
              <div className="flex items-center space-x-3 max-w-[50%]">
                <div className="p-2.5 rounded-xl bg-navy-950 border border-gold-500/20 text-gold-400 shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs truncate">{doc.title}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-navy-400 mt-0.5">
                    <span>{doc.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Lock className="w-3 h-3" /> Encriptado
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block text-xs text-navy-200 truncate max-w-[200px]">
                {doc.funeral}
              </div>

              <div className="text-xs text-navy-400">
                {doc.size}
              </div>

              <button className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-gold-400 hover:text-gold-300 border border-navy-700">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
