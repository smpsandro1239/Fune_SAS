'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle2,
  CalendarClock,
  FileText,
  Palette,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DashboardSummary,
  FuneralsPerPeriod,
  ServicesUsage,
  ServiceType,
  apiErrorMessage,
  apiService,
} from '@/lib/api';

const SERVICE_LABELS: Record<ServiceType, string> = {
  CERIMONIA: 'Cerimónia',
  VELORIO: 'Velório',
  CREMACAO: 'Cremação',
  TRANSPORTE: 'Transporte',
  ACOLHIMENTO: 'Acolhimento',
  OUTRO: 'Outro',
};

const CHART_COLORS = ['#d4af37', '#93c5fd', '#6ee7b7', '#fcd34d', '#c4b5fd', '#94a3b8'];

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [period, setPeriod] = useState<FuneralsPerPeriod | null>(null);
  const [usage, setUsage] = useState<ServicesUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      const data = await apiService.reports.export();
      const blob = new Blob([data.content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível exportar o relatório.'));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiService.reports.dashboard(),
      apiService.reports.funeralsPerPeriod('month'),
      apiService.reports.servicesUsage(),
    ])
      .then(([dash, per, use]) => {
        if (cancelled) return;
        setDashboard(dash);
        setPeriod(per);
        setUsage(use);
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, 'Não foi possível carregar os relatórios.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
      </div>
    );
  }

  const metrics = dashboard
    ? [
        { title: 'Funerais Registados', value: String(dashboard.funerals), icon: Users, color: 'text-blue-400' },
        { title: 'Concluídos', value: String(dashboard.completed), icon: CheckCircle2, color: 'text-emerald-400' },
        { title: 'Agendados / Em Curso', value: String(dashboard.scheduled), icon: CalendarClock, color: 'text-amber-400' },
        { title: 'Documentos Arquivados', value: String(dashboard.documents), icon: FileText, color: 'text-gold-400' },
      ]
    : [];

  const periodData =
    period?.periods.map((p) => {
      const [year, month] = p.period.split('-');
      const label = month
        ? new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('pt-PT', { month: 'short' })
        : year;
      return { period: label, count: p.count };
    }) || [];

  const usageData =
    usage?.services.map((s) => ({
      name: SERVICE_LABELS[s.serviceType] || s.serviceType,
      value: s.count,
      percentage: s.percentage,
    })) || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-400" />
            Relatórios & Métricas
          </h1>
          <p className="text-xs text-navy-300">
            Estatísticas reais da agência: funerais, documentos e distribuição de serviços.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold shadow-lg transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Cartões de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.title} className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-2 shadow-lg">
              <span className="text-xs font-semibold text-navy-300">{m.title}</span>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">{m.value}</div>
                <div className={`p-2.5 rounded-xl bg-navy-950 border border-navy-800 ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dashboard && (
        <p className="flex items-center gap-1.5 text-[11px] text-navy-400">
          <Palette className="w-3.5 h-3.5 text-gold-500/70" />
          {dashboard.templates} modelos de flyer disponíveis na galeria.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de funerais por período */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Funerais por Mês
              </h2>
              <p className="text-xs text-navy-300">Distribuição mensal de cerimónias (últimos 12 meses)</p>
            </div>
            <span className="text-xs font-bold text-gold-400 px-2.5 py-1 rounded-lg bg-gold-500/15 border border-gold-500/30">
              Total: {period?.total ?? 0}
            </span>
          </div>

          {periodData.length === 0 ? (
            <p className="text-xs text-navy-400 py-10 text-center">Sem dados para o período.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 700 }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  <Bar dataKey="count" name="Funerais" fill="#d4af37" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico de serviços */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-400" />
                Serviços Mais Utilizados
              </h2>
              <p className="text-xs text-navy-300">Distribuição por tipo de serviço</p>
            </div>
            <span className="text-xs font-bold text-gold-400 px-2.5 py-1 rounded-lg bg-gold-500/15 border border-gold-500/30">
              Total: {usage?.total ?? 0}
            </span>
          </div>

          {usageData.length === 0 ? (
            <p className="text-xs text-navy-400 py-10 text-center">Sem dados de serviços.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value, name) => {
                      const v = Number(value ?? 0);
                      return [`${v} (${((v / (usage?.total || 1)) * 100).toFixed(0)}%)`, String(name)];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ maxHeight: 72, overflowY: 'auto', lineHeight: '18px', fontSize: 11 }}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
