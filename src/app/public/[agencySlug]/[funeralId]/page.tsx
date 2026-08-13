'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  Flame, 
  Calendar, 
  MapPin, 
  Cross, 
  Share2, 
  MessageSquare, 
  Send, 
  Building2, 
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function PublicObituaryPage({ params }: { params: { agencySlug: string; funeralId: string } }) {
  const [condolenceText, setCondolenceText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', name: 'Família Martins', text: 'Os nossos mais sentidos pêsames a toda a família e amigos neste momento de dor.', date: 'Há 2 horas' },
    { id: '2', name: 'António & Maria Silva', text: 'Que a sua alma descanse em paz. Sentidas condolências.', date: 'Há 5 horas' },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const deceased = {
    name: 'LUÍS FILIPE DA SILVA FREITAS',
    age: 27,
    funeralDate: 'Quarta-feira, dia 8 de julho, 17:00 horas',
    parish: 'Igreja Paroquial da Ventosa, Braga',
    cemetery: 'Ventosa, Vieira do Minho',
    wake: 'Quarta-feira, dia 8 de julho, 15:30 horas, na Igreja Paroquial da Ventosa',
    hospital: 'Hospital de Braga',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    agency: 'Funerária Casa Hortas, Lda',
    agencyAddress: 'Rua das Maceirinhas, Cabreiros, Braga',
    agencyPhone: '+351 253 123 456',
  };

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !condolenceText.trim()) return;
    setMessages([
      { id: Date.now().toString(), name: authorName, text: condolenceText, date: 'Agora mesmo' },
      ...messages,
    ]);
    setCondolenceText('');
    setAuthorName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#040B16] text-white py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Public Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span>Participação Pública de Falecimento</span>
          </div>
          <p className="text-xs text-navy-300">Publicado por {deceased.agency}</p>
        </div>

        {/* Obituary Card */}
        <div className="bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Photo & Name */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-gold-400 shadow-xl shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={deceased.photo} alt={deceased.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-navy-950 text-gold-300 text-xs font-bold border border-gold-500/30 inline-block">
                {deceased.age} ANOS
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">{deceased.name}</h1>
              <p className="text-xs text-navy-300">Comunica com profundo pesar o seu falecimento e convida para as exéquias fúnebres.</p>
            </div>
          </div>

          {/* Ceremony Information */}
          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 space-y-4 text-xs">
            <div>
              <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4" /> Cerimónia Funerária
              </span>
              <p className="text-white font-medium">{deceased.funeralDate}</p>
              <p className="text-navy-300">{deceased.parish}</p>
            </div>

            <div>
              <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Cross className="w-4 h-4" /> Cemitério
              </span>
              <p className="text-white font-medium">{deceased.cemetery}</p>
            </div>

            <div>
              <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">Velório & Informações</span>
              <p className="text-navy-200">{deceased.wake}</p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-navy-800">
            <span className="text-xs text-navy-400 flex items-center gap-1">
              <Share2 className="w-4 h-4 text-gold-400" /> Partilhar anúncio:
            </span>
            <div className="flex gap-2">
              <button onClick={() => alert('Ligação copiada para partilha!')} className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-white border border-navy-700 font-medium">
                Copiar Link
              </button>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold">
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Condolences Section */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gold-400" />
            Livro de Condolências Digital ({messages.length})
          </h2>

          <form onSubmit={handleAddMessage} className="space-y-3">
            <input
              type="text"
              placeholder="O seu nome ou família..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
              required
            />
            <textarea
              rows={3}
              placeholder="Escreva a sua mensagem de condolências para a família..."
              value={condolenceText}
              onChange={(e) => setCondolenceText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Condolências</span>
            </button>
          </form>

          {submitted && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> A sua mensagem foi adicionada ao livro de condolências.
            </p>
          )}

          <div className="space-y-3 pt-4 border-t border-navy-800">
            {messages.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gold-300">{m.name}</span>
                  <span className="text-[10px] text-navy-400">{m.date}</span>
                </div>
                <p className="text-xs text-navy-200 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Footer */}
        <div className="text-center text-xs text-navy-400 space-y-1 pt-4">
          <p className="font-bold text-white">{deceased.agency}</p>
          <p>{deceased.agencyAddress} • {deceased.agencyPhone}</p>
        </div>
      </div>
    </div>
  );
}
