import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '../../components/EmptyState';
import { SectionCard } from '../../components/SectionCard';
import { analyzeEntries } from '../../services/analyticsService';
import { generateInsights } from '../../services/insightEngine';
import { trackingRepository } from '../../storage/trackingRepository';
import type { TrackingEntry } from '../../types/tracking';
import { formatHourLabel } from '../../utils/entryDisplay';

import { InsightCard } from './InsightCard';

export function AnalysePage() {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);

  useEffect(() => {
    void trackingRepository.listEntries().then(setEntries);
  }, []);

  const analytics = useMemo(() => analyzeEntries(entries), [entries]);
  const insights = useMemo(() => generateInsights(entries), [entries]);

  return (
    <main className="app-shell__surface">
      <SectionCard eyebrow="Analyse" title="Check-ins programmes">
        {analytics.scheduledCheckIns.energyTrend.length === 0 ? (
          <EmptyState
            description="Les courbes apparaitront apres quelques check-ins programmes."
            title="Pas encore de check-ins programmes"
          />
        ) : (
          <div className="chart-stack">
            <ChartBlock
              data={analytics.scheduledCheckIns.energyTrend}
              lineKeys={[{ key: 'average', label: 'Energie', color: '#4f7a67' }]}
              title="Energie dans le temps"
              xKey="date"
            />
            <ChartBlock
              data={analytics.scheduledCheckIns.averageEnergyByHour.map((point) => ({
                ...point,
                hourLabel: formatHourLabel(point.hour)
              }))}
              title="Moyenne energie par heure"
              xKey="hourLabel"
            />
            <ChartBlock
              data={analytics.scheduledCheckIns.averageStressByHour.map((point) => ({
                ...point,
                hourLabel: formatHourLabel(point.hour)
              }))}
              barColor="#b26a4a"
              title="Moyenne stress par heure"
              xKey="hourLabel"
            />
          </div>
        )}
      </SectionCard>

      <SectionCard eyebrow="Forme" title="Tendances et comparaisons">
        {analytics.form.dailyAverage.length === 0 ? (
          <EmptyState
            description="Ajoutez quelques entrees de forme pour commencer a voir les tendances."
            title="Pas encore de donnees de forme"
          />
        ) : (
          <div className="chart-stack">
            <ChartBlock
              data={analytics.form.dailyAverage}
              lineKeys={[{ key: 'average', label: 'Forme', color: '#4f7a67' }]}
              title="Moyenne quotidienne"
              xKey="date"
            />
            <ChartBlock data={analytics.comparisons.sleepDuration} title="Forme vs sommeil" xKey="label" />
            <ChartBlock data={analytics.comparisons.stress} title="Forme vs stress" xKey="label" />
            <ChartBlock data={analytics.comparisons.mentalLoad} title="Forme vs charge mentale" xKey="label" />
          </div>
        )}
      </SectionCard>

      <SectionCard eyebrow="Migraine" title="Frequence et intensite">
        {analytics.migraine.frequency.totalEpisodes === 0 ? (
          <EmptyState
            description="Les cartes migraines s activeront des que vous noterez un premier episode."
            title="Aucun episode de migraine"
          />
        ) : (
          <div className="chart-stack">
            <div className="stat-grid">
              <StatTile label="Episodes" value={String(analytics.migraine.frequency.totalEpisodes)} />
              <StatTile
                label="Jours avec episode"
                value={String(analytics.migraine.frequency.daysWithEpisodes)}
              />
              <StatTile
                label="Douleur moyenne"
                value={analytics.migraine.intensity.averagePain?.toString() ?? '-'}
              />
            </div>
            <ChartBlock
              data={analytics.migraine.byHour.map((point) => ({
                ...point,
                hourLabel: formatHourLabel(point.hour),
                averagePain: point.averagePain ?? 0
              }))}
              title="Douleur moyenne par heure"
              xKey="hourLabel"
            />
            <ChartBlock data={analytics.migraine.vsStress} title="Episodes vs stress" xKey="label" />
            <ChartBlock data={analytics.migraine.vsCaffeine} title="Episodes vs cafeine" xKey="label" />
          </div>
        )}
      </SectionCard>

      <SectionCard eyebrow="Meditation" title="Pratique par semaine">
        {analytics.meditation.totalSessions === 0 ? (
          <EmptyState
            description="Ajoutez vos seances pour faire apparaitre cette section."
            title="Aucune seance de meditation"
          />
        ) : (
          <div className="chart-stack">
            <div className="stat-grid">
              <StatTile label="Seances" value={String(analytics.meditation.totalSessions)} />
              <StatTile label="Minutes totales" value={String(analytics.meditation.totalMinutes)} />
              <StatTile label="Moyenne" value={`${analytics.meditation.averageMinutes} min`} />
            </div>
            <ChartBlock data={analytics.meditation.weekly} title="Meditation par semaine" xKey="weekStart" />
          </div>
        )}
      </SectionCard>

      <SectionCard eyebrow="Insights" title="Lectures prudentes">
        <div className="insight-list">
          {insights.map((insight) => (
            <InsightCard insight={insight} key={insight.id} />
          ))}
        </div>
      </SectionCard>
    </main>
  );
}

interface ChartBlockProps<TData extends object = Record<string, string | number>> {
  barColor?: string;
  data: TData[];
  lineKeys?: Array<{ color: string; key: string; label: string }>;
  title: string;
  xKey: Extract<keyof TData, string>;
}

function ChartBlock<TData extends object>({
  barColor = '#4f7a67',
  data,
  lineKeys,
  title,
  xKey
}: ChartBlockProps<TData>) {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <strong>{title}</strong>
      </div>
      <div className="chart-card__surface">
        <ResponsiveContainer height={220} width="100%">
          {lineKeys ? (
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(108, 88, 61, 0.12)" vertical={false} />
              <XAxis dataKey={xKey} hide={data.length > 7} />
              <YAxis />
              <Tooltip />
              {lineKeys.map((lineKey) => (
                <Line
                  dataKey={lineKey.key}
                  dot={false}
                  key={lineKey.key}
                  name={lineKey.label}
                  stroke={lineKey.color}
                  strokeWidth={3}
                  type="monotone"
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(108, 88, 61, 0.12)" vertical={false} />
              <XAxis dataKey={xKey} hide={data.length > 7} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={pickPrimaryMetric(data)} fill={barColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function pickPrimaryMetric<TData extends object>(data: TData[]): string {
  const firstRow = data[0];
  if (!firstRow) {
    return 'average';
  }

  return (
    Object.entries(firstRow).find(([, value]) => typeof value === 'number')?.[0] ?? 'average'
  );
}
