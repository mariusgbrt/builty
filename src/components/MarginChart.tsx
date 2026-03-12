import { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';

interface Project {
  id: string;
  actual_margin_rate: number;
  created_at: string;
  end_date?: string | null;
}

interface MarginChartProps {
  projects: Project[];
}

interface MarginData {
  period: string;
  margin: number;
  count: number;
}

export function MarginChart({ projects }: MarginChartProps) {
  const marginData = useMemo((): MarginData[] => {
    const now = new Date();

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    const getProjectsInPeriod = (startDate: Date) => {
      return projects.filter(project => {
        const projectDate = project.end_date
          ? new Date(project.end_date)
          : new Date(project.created_at);
        return projectDate >= startDate && projectDate <= now;
      });
    };

    const calculateAverageMargin = (projectList: Project[]) => {
      if (projectList.length === 0) return 0;
      const totalMargin = projectList.reduce(
        (sum, project) => sum + (Number(project.actual_margin_rate) || 0),
        0
      );
      return totalMargin / projectList.length;
    };

    const oneMonthProjects = getProjectsInPeriod(oneMonthAgo);
    const sixMonthsProjects = getProjectsInPeriod(sixMonthsAgo);
    const twelveMonthsProjects = getProjectsInPeriod(twelveMonthsAgo);

    return [
      {
        period: '1 mois',
        margin: calculateAverageMargin(oneMonthProjects),
        count: oneMonthProjects.length,
      },
      {
        period: '6 mois',
        margin: calculateAverageMargin(sixMonthsProjects),
        count: sixMonthsProjects.length,
      },
      {
        period: '12 mois',
        margin: calculateAverageMargin(twelveMonthsProjects),
        count: twelveMonthsProjects.length,
      },
    ];
  }, [projects]);

  const { maxScale, yAxisLabels } = useMemo(() => {
    const maxDataMargin = Math.max(...marginData.map(d => d.margin), 0);

    let scale: number;
    let step: number;

    if (maxDataMargin === 0) {
      scale = 30;
      step = 5;
    } else if (maxDataMargin <= 30) {
      scale = 30;
      step = 5;
    } else if (maxDataMargin <= 50) {
      scale = 50;
      step = 10;
    } else if (maxDataMargin <= 100) {
      scale = 100;
      step = 20;
    } else {
      scale = Math.ceil(maxDataMargin / 25) * 25;
      step = scale / 5;
    }

    const numLabels = Math.floor(scale / step) + 1;
    const labels = Array.from({ length: numLabels }, (_, i) => i * step);

    return { maxScale: scale, yAxisLabels: labels };
  }, [marginData]);

  // Calcul des statistiques globales
  const stats = useMemo(() => {
    if (marginData.length === 0 || marginData.every(d => d.count === 0)) {
      return { avg: 0, max: 0, min: 0, trend: 'stable' as const };
    }

    const validMargins = marginData.filter(d => d.count > 0).map(d => d.margin);
    const avg = validMargins.reduce((sum, m) => sum + m, 0) / validMargins.length;
    const max = Math.max(...validMargins);
    const min = Math.min(...validMargins);

    // Tendance : comparer 1 mois vs 6 mois
    const oneMonthMargin = marginData.find(d => d.period === '1 mois')?.margin || 0;
    const sixMonthsMargin = marginData.find(d => d.period === '6 mois')?.margin || 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (oneMonthMargin > sixMonthsMargin + 1) trend = 'up';
    else if (oneMonthMargin < sixMonthsMargin - 1) trend = 'down';

    return { avg, max, min, trend };
  }, [marginData]);

  return (
    <div className="space-y-8">
      {/* En-tête avec stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-builty-blue/10 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-builty-blue" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-builty-gray">Évolution des marges</h3>
            <p className="text-sm text-builty-gray-light">Analyse de rentabilité par période</p>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="flex gap-3">
            {/* Marge moyenne */}
            <div className="px-4 py-3 bg-builty-blue/5 rounded-xl border border-builty-blue/20">
              <p className="text-xs text-builty-gray-light font-medium mb-1">Moyenne</p>
              <p className="text-2xl font-extrabold text-builty-blue">{stats.avg.toFixed(1)}%</p>
            </div>

            {/* Tendance */}
            <div className={`px-4 py-3 rounded-xl border ${
              stats.trend === 'up' 
                ? 'bg-green-50 border-green-200' 
                : stats.trend === 'down'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-xs text-builty-gray-light font-medium mb-1">Tendance</p>
              <div className="flex items-center gap-1">
                {stats.trend === 'up' ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-bold text-green-700">Hausse</span>
                  </>
                ) : stats.trend === 'down' ? (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-bold text-red-700">Baisse</span>
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">Stable</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-builty-gray-lighter flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-builty-gray-light" />
          </div>
          <p className="text-builty-gray font-bold text-lg mb-2">Aucun chantier disponible</p>
          <p className="text-sm text-builty-gray-light">Les données d'analyse apparaîtront une fois que vous aurez créé des chantiers</p>
        </div>
      ) : (
        <div className="relative bg-builty-gray-lighter/30 rounded-2xl p-6 border-2 border-gray-100">
          <div className="flex gap-4">
            {/* Axe Y */}
            <div className="w-14 flex flex-col justify-between" style={{ height: '360px' }}>
              {yAxisLabels.slice().reverse().map((label, index) => (
                <div key={index} className="flex items-center justify-end h-0">
                  <span className="text-sm font-bold text-builty-gray-light">
                    {label}%
                  </span>
                </div>
              ))}
            </div>

            {/* Zone de graphique */}
            <div className="flex-1">
              {/* Conteneur avec lignes et barres */}
              <div className="relative" style={{ height: '360px' }}>
                {/* Lignes horizontales */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yAxisLabels.slice().reverse().map((label, index) => (
                    <div key={index} className="border-t border-gray-200 h-0" />
                  ))}
                </div>

                {/* Barres - alignées avec les lignes */}
                <div className="absolute inset-0 flex items-end justify-around gap-6 px-8">
                  {marginData.map((data, index) => {
                    const heightPercent = (data.margin / maxScale) * 100;
                    const showLabelInside = heightPercent >= 15;

                    // Couleurs alternées premium
                    const colors = [
                      { from: 'from-builty-blue', via: 'via-builty-blue-light', to: 'to-blue-400', bg: 'bg-builty-blue' },
                      { from: 'from-green-600', via: 'via-green-500', to: 'to-green-400', bg: 'bg-green-600' },
                      { from: 'from-builty-orange', via: 'via-orange-500', to: 'to-orange-400', bg: 'bg-builty-orange' },
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={data.period} className="flex-1 max-w-[160px] flex flex-col items-center group h-full">
                        <div className="w-full relative flex-1 flex items-end">
                          {data.count === 0 ? (
                            <div className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center shadow-sm" style={{ height: '80px' }}>
                              <span className="text-sm text-builty-gray-light font-semibold">Pas de données</span>
                            </div>
                          ) : data.margin === 0 ? (
                            <div className="w-full flex flex-col items-center">
                              <div className={`absolute -top-10 ${color.bg} text-white text-sm font-extrabold px-4 py-2 rounded-xl shadow-lg`}>
                                0.0%
                              </div>
                              <div className={`w-full h-2 ${color.bg} rounded-full shadow-md`} />
                            </div>
                          ) : (
                            <div className="w-full relative" style={{ height: `${heightPercent}%` }}>
                              {!showLabelInside && (
                                <div
                                  className={`absolute left-1/2 -translate-x-1/2 -top-12 ${color.bg} text-white text-sm font-extrabold px-4 py-2 rounded-xl shadow-lg whitespace-nowrap z-10`}
                                >
                                  {data.margin.toFixed(1)}%
                                </div>
                              )}
                              <div
                                className={`w-full h-full rounded-t-2xl bg-gradient-to-t ${color.from} ${color.via} ${color.to} shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-start justify-center border-2 border-white`}
                                style={{
                                  paddingTop: showLabelInside ? '16px' : '0px',
                                }}
                              >
                                {showLabelInside && (
                                  <span className="text-white font-extrabold text-lg drop-shadow-lg">
                                    {data.margin.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Labels en dessous */}
              <div className="flex items-start justify-around gap-6 px-8 mt-4">
                {marginData.map((data) => (
                  <div key={data.period} className="flex-1 max-w-[160px]">
                    <div className="text-center space-y-1.5 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 hover:border-builty-blue/30 transition-all">
                      <div className="text-base font-extrabold text-builty-gray">{data.period}</div>
                      <div className={`text-xs font-bold ${
                        data.count === 0 ? 'text-gray-400' : 'text-builty-blue'
                      }`}>
                        {data.count} chantier{data.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
