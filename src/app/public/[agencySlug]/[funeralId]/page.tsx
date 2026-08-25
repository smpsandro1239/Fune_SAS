'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
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
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface PublicFuneral {
  funeral: {
    id: string;
    funeralDate: string;
    funeralTime: string | null;
    locationParish: string | null;
    cemeteryLocation: string | null;
    wakeLocation: string | null;
    wakeDate: string | null;
    wakeTime: string | null;
    notes: string | null;
    serviceType: string;
    deceased: {
      fullName: string;
      age: number | null;
      dateOfBirth: string | null;
      dateOfDeath: string | null;
      placeOfDeath: string | null;
      photoUrl: string | null;
    };
    condolences: {
      id: string;
      authorName: string;
      message: string;
      createdAt: string;
    }[];
  };
  agency: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    location: string | null;
    website: string | null;
  };
}

function formatDate(dateStr: string, timeStr?: string | null) {
  try {
    const d = new Date(dateStr);
    const formatted = d.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (timeStr) return `${formatted}, às ${timeStr}`;
    return formatted;
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora mesmo';
  if (mins < 60) return `Há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Há ${days}d`;
}

export default function PublicObituaryPage() {
  const params = useParams();
  const agencySlug = params.agencySlug as string;
  const funeralId = params.funeralId as string;

  const [data, setData] = useState<PublicFuneral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [authorName, setAuthorName] = useState('');
  const [condolenceText, setCondolenceText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const { data: result } = await axios.get(`${API_BASE}/public/${agencySlug}/${funeralId}`);
        setData(result);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Não foi possível carregar os dados deste funeral.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agencySlug, funeralId]);

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !condolenceText.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data: result } = await axios.post(
        `${API_BASE}/public/${agencySlug}/${funeralId}/condolences`,
        {
          authorName: authorName.trim(),
          message: condolenceText.trim(),
          ...(honeypot ? { website: honeypot } : {}),
        },
      );
      // Com moderação ativa a mensagem não aparece de imediato
      if (result?.moderated) {
        setSubmitted(false);
      } else {
        setData((prev) =>
          prev
            ? {
                ...prev,
                funeral: {
                  ...prev.funeral,
                  condolences: [
                    {
                      id: `local-${Date.now()}`,
                      authorName: authorName.trim(),
                      message: condolenceText.trim(),
                      createdAt: new Date().toISOString(),
                    },
                    ...prev.funeral.condolences,
                  ],
                },
              }
            : prev,
        );
        setSubmitted(true);
      }
      setSubmitMessage(result?.message || 'Condolência registada.');
      setCondolenceText('');
      setAuthorName('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError('Erro ao enviar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040B16] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#040B16] flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">Publicação não encontrada</h1>
          <p className="text-sm text-navy-300">{error || 'Dados indisponíveis.'}</p>
        </div>
      </div>
    );
  }

  const { funeral, agency } = data;
  const { deceased, condolences } = funeral;

  return (
    <div className="min-h-screen bg-[#040B16] text-white py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span>Participação Pública de Falecimento</span>
          </div>
          <p className="text-xs text-navy-300">Publicado por {agency.name}</p>
        </div>

        {/* Obituary Card */}
        <div className="bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-gold-400 shadow-xl shrink-0 bg-navy-800 flex items-center justify-center">
              {deceased.photoUrl ? (
                <img src={deceased.photoUrl} alt={deceased.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-serif font-bold text-gold-400/40">
                  {deceased.fullName.split(' ').map((w) => w[0]).join('').substring(0, 2)}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {deceased.age && (
                <span className="px-3 py-1 rounded-full bg-navy-950 text-gold-300 text-xs font-bold border border-gold-500/30 inline-block">
                  {deceased.age} ANOS
                </span>
              )}
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">{deceased.fullName}</h1>
              {deceased.dateOfDeath && (
                <p className="text-xs text-navy-300">
                  Faleceu a {new Date(deceased.dateOfDeath).toLocaleDateString('pt-PT')}
                  {deceased.placeOfDeath ? ` em ${deceased.placeOfDeath}` : ''}
                </p>
              )}
              <p className="text-xs text-navy-300">Comunica com profundo pesar o seu falecimento e convida para as exéquias fúnebres.</p>
            </div>
          </div>

          {/* Ceremony Info */}
          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 space-y-4 text-xs">
            {funeral.funeralDate && (
              <div>
                <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Cerimónia Funerária
                </span>
                <p className="text-white font-medium">{formatDate(funeral.funeralDate, funeral.funeralTime)}</p>
                {funeral.locationParish && <p className="text-navy-300">{funeral.locationParish}</p>}
              </div>
            )}
            {funeral.cemeteryLocation && (
              <div>
                <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Cross className="w-4 h-4" /> Cemitério
                </span>
                <p className="text-white font-medium">{funeral.cemeteryLocation}</p>
              </div>
            )}
            {funeral.wakeLocation && (
              <div>
                <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">Velório</span>
                <p className="text-navy-200">
                  {funeral.wakeLocation}
                  {funeral.wakeDate && ` — ${formatDate(funeral.wakeDate, funeral.wakeTime)}`}
                </p>
              </div>
            )}
            {funeral.notes && (
              <div>
                <span className="text-gold-400 font-bold uppercase tracking-wider block mb-1">Informações Adicionais</span>
                <p className="text-navy-200">{funeral.notes}</p>
              </div>
            )}
          </div>

          {/* Share */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy-800">
            <span className="text-xs text-navy-400 flex items-center gap-1">
              <Share2 className="w-4 h-4 text-gold-400" /> Partilhar anúncio:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-white border border-navy-700 font-medium"
              >
                Copiar Link
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold"
              >
                Facebook
              </button>
              <button
                onClick={() => setShowQr((v) => !v)}
                aria-expanded={showQr}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-gold-300 border border-gold-500/30 font-medium"
              >
                Código QR
              </button>
            </div>
          </div>

          {/* QR Code — para imprimir no velório */}
          {showQr && (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-navy-800">
              <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0">
                {pageUrl && <QRCodeSVG value={pageUrl} size={112} level="M" />}
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-sm font-bold text-white">Aponte a câmara do telemóvel</p>
                <p className="text-xs text-navy-300 leading-relaxed">
                  Mostre este código no velório: os convidados acedem ao anúncio completo e ao
                  livro de condolências digital sem instalar nada.
                </p>
                <p className="text-[10px] text-navy-500 break-all">{pageUrl}</p>
              </div>
            </div>
          )}
        </div>

        {/* Condolences */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gold-400" />
            Livro de Condolências Digital ({condolences.length})
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
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none resize-none"
              required
              maxLength={1000}
            />
            {/* Honeypot anti-spam — invisível para humanos */}
            <div aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            {submitError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Enviar Condolências</span>
            </button>
          </form>

          {submitted && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {submitMessage || 'A sua mensagem foi adicionada ao livro de condolências.'}
            </p>
          )}

          <div className="space-y-3 pt-4 border-t border-navy-800">
            {condolences.length === 0 && (
              <p className="text-xs text-navy-400 text-center py-4">Seja o primeiro a deixar uma mensagem de condolências.</p>
            )}
            {condolences.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gold-300">{m.authorName}</span>
                  <span className="text-[10px] text-navy-400">{timeAgo(m.createdAt)}</span>
                </div>
                <p className="text-xs text-navy-200 leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Footer */}
        <div className="text-center text-xs text-navy-400 space-y-1 pt-4 pb-8">
          <p className="font-bold text-white">{agency.name}</p>
          <p>
            {agency.address || ''}
            {agency.phone ? ` · ${agency.phone}` : ''}
          </p>
          {agency.email && <p>{agency.email}</p>}
        </div>
      </div>
    </div>
  );
}
