"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell as RechartsCell, Legend, LabelList } from "recharts"
import { Users, MessageSquare, Gift, BotIcon as Robot, BarChart2 } from "lucide-react"
import { useState, useEffect, useMemo, useCallback, memo, lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getBirthdayReportByStore, getDetailedBirthdayReportByStore, BirthdayReportData, DetailedBirthdayReportData } from "@/lib/birthday-report-service"
import { getCashbackData, CashbackData } from "@/lib/cashback-service"
import { getRespostasPesquisasByStore, getRespostasPesquisasStats, RespostaPesquisaData, RespostasPesquisasStats } from "@/lib/respostas-pesquisas-service"
import { clearAllCache } from "@/lib/dashboard-optimizations"
import { getPesquisasEnviadasCount, getPromocoesCount } from "@/lib/dashboard-counters-service"

import { StoreListDialog } from "@/components/ui/store-list-dialog"
import { Button } from "@/components/ui/button"
import { ExcelExportButton } from "@/components/ui/excel-export-button"
import { PromocoesExcelExportButton } from "@/components/ui/promocoes-excel-export-button"
import { PromocoesSemanaisExcelExportButton } from "@/components/ui/promocoes-semanais-excel-export-button"
import { PromocoesAnuaisExcelExportButton } from "@/components/ui/promocoes-anuais-excel-export-button"
import { PesquisasEnviadasExcelExportButton } from "@/components/ui/pesquisas-enviadas-excel-export-button"
import { CashbackDetalhadoExcelExportButton } from "@/components/ui/cashback-detalhado-excel-export-button"
import { AniversariosGeraisExcelExportButton } from "@/components/ui/aniversarios-gerais-excel-export-button"
import { AniversariosDetalhadoExcelExportButton } from "@/components/ui/aniversarios-detalhado-excel-export-button"
import { RespostasPesquisasExcelExportButton } from "@/components/ui/respostas-pesquisas-excel-export-button"

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: string | number;
    name: string;
    color?: string;
    dataKey?: string;
    payload: any;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 text-white p-3 rounded shadow-md text-sm">
        <p className="font-medium text-gray-100">{label}</p>
        {payload.map((item, index: number) => (
          <p key={index} className="text-gray-200">
            <span style={{ color: "black" }}>Loja: </span>{item.name.replace(/Loja/g, '')}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RespostasPesquisasTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 mb-2">Loja {label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span style={{ color: entry.color }} className="font-medium">
              {entry.dataKey}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Tooltip = (props: any) => <RechartsTooltip content={<CustomTooltip />} {...props} />;

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: any; // Tipo do é­cone do Lucide
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  iconBg: string;
  dataComponentName?: string; // Propriedade opcional para o data-component-name
}

const statsData: StatCardProps[] = [
  {
    title: "Total de Clientes",
    value: "1,234",
    change: "+12%",
    icon: Users,
    bgGradient: "from-blue-400 via-blue-500 to-blue-600",
    borderColor: "border-blue-600",
    iconColor: "text-blue-400",
    textColor: "text-white",
    iconBg: "bg-blue-100"
  },
  {
    title: "Pesquisas",
    value: "0",
    change: "+5%",
    icon: MessageSquare,
    bgGradient: "from-purple-500 via-purple-600 to-purple-700",
    borderColor: "border-purple-700",
    iconColor: "text-purple-400",
    textColor: "text-white",
    iconBg: "bg-purple-100"
  },
  {
    title: "Promoções",
    value: "6",
    change: "+8%",
    icon: Gift,
    bgGradient: "from-amber-400 via-amber-500 to-amber-600",
    borderColor: "border-amber-600",
    iconColor: "text-amber-400",
    textColor: "text-white",
    iconBg: "bg-amber-100"
  },
  {
    title: "Robôs Conectados",
    value: "12",
    change: "+2%",
    icon: Robot,
    bgGradient: "from-emerald-400 via-emerald-500 to-emerald-600",
    borderColor: "border-emerald-600",
    iconColor: "text-emerald-400",
    textColor: "text-white",
    iconBg: "bg-emerald-100"
  },
]

const salesData = [
  { name: "Jan", vendas: 4000, clientes: 2400 },
  { name: "Fev", vendas: 3000, clientes: 1398 },
  { name: "Mar", vendas: 2000, clientes: 9800 },
  { name: "Abr", vendas: 2780, clientes: 3908 },
  { name: "Mai", vendas: 1890, clientes: 4800 },
  { name: "Jun", vendas: 2390, clientes: 3800 },
  { name: "Jul", vendas: 3490, clientes: 4200 },
  { name: "Ago", vendas: 4120, clientes: 3950 },
  { name: "Set", vendas: 4680, clientes: 4300 },
  { name: "Out", vendas: 5230, clientes: 4800 },
  { name: "Nov", vendas: 5890, clientes: 5200 },
  { name: "Dez", vendas: 6450, clientes: 5800 },
]

const storeData = [
  { name: "Loja 1", value: 400 },
  { name: "Loja 2", value: 300 },
  { name: "Loja 3", value: 300 },
  { name: "Loja 4", value: 200 },
]

// Dados estáticos para o gráfico de Envios de Promoções da semana
const envioSemanaData = [
  { dataEnvio: "Julho 6, 2025", cat1: 330, cat2: 5, cat3: 200, cat4: 10 },
  { dataEnvio: "Julho 7, 2025", cat1: 130, cat2: 0, cat3: 20, cat4: 5 },
  { dataEnvio: "Julho 8, 2025", cat1: 0, cat2: 0, cat3: 190, cat4: 0 },
  { dataEnvio: "Julho 9, 2025", cat1: 0, cat2: 400, cat3: 120, cat4: 0 },
  { dataEnvio: "Julho 10, 2025", cat1: 0, cat2: 300, cat3: 130, cat4: 0 },
  { dataEnvio: "Julho 11, 2025", cat1: 5, cat2: 0, cat3: 0, cat4: 0 },
];

const satisfactionData = [
  { name: "Bom", value: 30, fill: "#4b5563" },
  { name: "Regular", value: 15, fill: "#6b7280" },
  { name: "Ruim", value: 10, fill: "#9ca3af" },
] as const;

// Dados estáticos para o gráfico de Respostas Pesquisas (removidos - dados vêm do Supabase)




const COLORS = ["#7f10e6", "#6b7280", "#9ca3af", "#d1d5db"]

interface ClientCount {
  count: number;
}

interface PromocaoCount {
  count: number;
}

interface BotsCount {
  count: number;
}

interface LegendItem {
  value?: string;
  color?: string;
  [key: string]: any;
}

interface LegendComponentProps {
  payload?: ReadonlyArray<LegendItem>;
  highlightedItem: string | null;
  onHighlightChange: (item: string | null) => void;
  onShowMoreChange: (show: boolean) => void;
  showMore: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const LegendComponent = ({
  payload,
  highlightedItem,
  onHighlightChange,
  onShowMoreChange,
  showMore,
  currentPage,
  onPageChange
}: LegendComponentProps) => {
  const MAX_ITEMS = 10;
  const payloadItems = Array.isArray(payload)
    ? [...payload].sort((a, b) => {
      const numA = parseInt(a.value || "0");
      const numB = parseInt(b.value || "0");
      return numA - numB;
    })
    : [];
  const hasMore = payloadItems.length > MAX_ITEMS;
  const hiddenItems = hasMore ? payloadItems.slice(MAX_ITEMS) : [];
  const visibleItems = showMore ? payloadItems : payloadItems.slice(0, MAX_ITEMS);

  return (
    <div className="relative mt-4" data-component-name="legend-container">
      <ul className="space-y-1">
        {visibleItems?.map((entry, index) => {
          const itemKey = entry.value || `item-${index}`;
          const isHighlighted = highlightedItem === null || highlightedItem === itemKey;

          return (
            <li
              key={`legend-${index}`}
              className="flex items-center p-1 rounded cursor-pointer transition-colors hover:bg-gray-50"
              onMouseEnter={() => onHighlightChange(itemKey)}
              onMouseLeave={() => onHighlightChange(null)}
            >
              <div
                className="w-3 h-3 rounded-sm mr-2"
                style={{
                  backgroundColor: entry.color,
                  opacity: isHighlighted ? 1 : 0.5,
                  transition: "opacity 0.2s ease-in-out"
                }}
              />
              <span
                className="text-sm"
                style={{
                  color: isHighlighted ? "#111827" : "#6B7280",
                  fontWeight: isHighlighted ? 500 : 400,
                  transition: "all 0.2s ease-in-out"
                }}
              >
                {itemKey}
              </span>
            </li>
          );
        })}

        {hasMore && (
          <li className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowMoreChange(!showMore);
              }}
              className={`flex items-center p-1 text-sm rounded transition-colors ${showMore
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              +{hiddenItems.length} mais
            </button>

            {showMore && (
              <div
                className="absolute z-10 left-0 top-full mt-1 py-1 bg-white rounded-md shadow-lg border border-gray-200 flex items-center"
                onMouseLeave={() => {
                  onShowMoreChange(false);
                  onPageChange(0);
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageChange(Math.max(0, currentPage - 1));
                  }}
                  disabled={currentPage === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                <div className="flex">
                  {hiddenItems.slice(currentPage * 3, (currentPage * 3) + 3).map((entry, index) => {
                    const itemKey = entry.value || `hidden-${index}`;
                    const isHighlighted = highlightedItem === null || highlightedItem === itemKey;

                    return (
                      <div
                        key={`more-${index}`}
                        className="flex-shrink-0 flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
                        onMouseEnter={() => onHighlightChange(itemKey)}
                        onMouseLeave={() => onHighlightChange(null)}
                      >
                        <div
                          className="w-3 h-3 rounded-sm mr-2"
                          style={{
                            backgroundColor: entry.color,
                            opacity: isHighlighted ? 1 : 0.5,
                            transition: "opacity 0.2s ease-in-out"
                          }}
                        />
                        <span
                          className="text-sm whitespace-nowrap"
                          style={{
                            color: isHighlighted ? "#111827" : "#6B7280",
                            fontWeight: isHighlighted ? 500 : 400,
                            transition: "all 0.2s ease-in-out"
                          }}
                        >
                          {itemKey}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageChange(Math.min(Math.ceil(hiddenItems.length / 3) - 1, currentPage + 1));
                  }}
                  disabled={currentPage >= Math.ceil(hiddenItems.length / 3) - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default function DashboardPage() {
  // Função para formatar a data no formato Dia/mês/Ano
  const formatDate = (date: Date): string => {
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const [currentUtcDateTime, setCurrentUtcDateTime] = useState(formatDate(new Date()));

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const utcDateTime = formatDate(now);
      setCurrentUtcDateTime(utcDateTime);
    };

    // Atualiza a data/hora inicial
    updateDateTime();

    // Cria um intervalo para atualizar a cada segundo
    const intervalId = setInterval(updateDateTime, 1000);

    // Limpa o intervalo quando o componente é© desmontado
    return () => clearInterval(intervalId);
  }, []);
  const { user } = useAuth();
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [promocaoCount, setPromocaoCount] = useState<number | null>(null);
  const [pesquisasEnviadasCount, setPesquisasEnviadasCount] = useState<number | null>(null);
  // Lojas presentes nos dados semanais para gerar barras dinâmicas
  const [lojasSemanaisKeys, setLojasSemanaisKeys] = useState<string[]>([]);
  // Paleta simples para até 8 lojas
  const lojaColors = ["#8B5CF6", "#60A5FA", "#A78BFA", "#F472B6", "#6366F1", "#7C3AED", "#C084FC", "#4F46E5", "#818CF8", "#DB2777", "#EC4899", "#9D174D", "#0EA5E9", "#14B8A6", "#06B6D4", "#3B82F6", "#4338CA"];
  // Paleta anual compartilhará o mesmo array
  const lojaAnoColors = lojaColors;
  // Estado para armazenar a data atual do sistema
  const [currentDate, setCurrentDate] = useState(new Date());

  const [botsOpenCount, setBotsOpenCount] = useState<number | null>(null);
  const [birthdayReportData, setBirthdayReportData] = useState<BirthdayReportData[]>([]);
  const [detailedBirthdayReportData, setDetailedBirthdayReportData] = useState<DetailedBirthdayReportData[]>([]);
  const [birthdayDetailedLojas, setBirthdayDetailedLojas] = useState<string[]>([]);
  const [showMoreBirthdayLojas, setShowMoreBirthdayLojas] = useState<boolean>(false);
  const [currentBirthdayPage, setCurrentBirthdayPage] = useState<number>(0);
  const [highlightedBirthdayLoja, setHighlightedBirthdayLoja] = useState<string | null>(null);
  const [cashbackTemTotalData, setCashbackTemTotalData] = useState<CashbackData[]>([]);
  const [cashbackTemTotalLojas, setCashbackTemTotalLojas] = useState<string[]>([]);
  const [showMoreLojas, setShowMoreLojas] = useState<boolean>(false);
  const [currentPageLojas, setCurrentPageLojas] = useState<number>(0);
  const [hoveredLojaCashback, setHoveredLojaCashback] = useState<string | null>(null);


  // useEffect para fechar o pop-up quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMoreLojas && !target.closest(".popup-lojas-container")) {
        setShowMoreLojas(false);
      }
      if (showMoreBirthdayLojas && !target.closest(".popup-birthday-lojas-container")) {
        setShowMoreBirthdayLojas(false);
      }
    };

    if (showMoreLojas || showMoreBirthdayLojas) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreLojas, showMoreBirthdayLojas]);
  const [cashbackData, setCashbackData] = useState<any[]>([]);
  const [respostasPesquisasData, setRespostasPesquisasData] = useState<RespostaPesquisaData[]>([]);
  const [respostasPesquisasStats, setRespostasPesquisasStats] = useState<RespostasPesquisasStats | null>(null);
  const [isLoadingRespostasPesquisas, setIsLoadingRespostasPesquisas] = useState(true);
  const [respostasPesquisasError, setRespostasPesquisasError] = useState<string | null>(null);

  // Estados para o card de Relatório de Pesquisas
  const [isSurveyReportModalOpen, setIsSurveyReportModalOpen] = useState(false);
  const [selectedSurveyFields, setSelectedSurveyFields] = useState<string[]>([]);
  const [surveyStartDate, setSurveyStartDate] = useState('');
  const [surveyEndDate, setSurveyEndDate] = useState('');

  // Estados para filtros de data do cashback
  const [cashbackStartDate, setCashbackStartDate] = useState('');
  const [cashbackEndDate, setCashbackEndDate] = useState('');
  const [surveyResponseFilter, setSurveyResponseFilter] = useState<string>(''); // Para o dropdown de filtro de respostas

  // ----- gráfico anual -----
  interface PesquisaMensal {
    mes: string;
    [loja: string]: string | number; // Permite chaves dinâmicas para as lojas
  }

  interface PromocaoMensal {
    mes: string; // label pt-BR
    [loja: string]: string | number;  // Permite tanto string (para "mes") quanto number (para as lojas)
  }

  const fetchPromocoesAno = async () => {
    try {
      setIsLoadingPromocoesAno(true);
      if (!user?.empresa) return;
      const { supabase } = await import("@/lib/supabase");

      const sixMonthsAgo = new Date(currentDate);
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

      const { data, error } = await supabase
        .from("Relatorio Envio de Promoções")
        .select("Loja, Data_Envio")
        .eq("Enviado", "sim")
        .eq("Rede", user.empresa) // Filtra pela empresa do usuário
        .gte("Data_Envio", sixMonthsAgo.toISOString().split("T")[0]); // Filtra por data maior ou igual a 6 meses atrás

      if (error) throw error;
      if (!data || data.length === 0) {
        setPromocoesAno([]);
        return;
      }

      // Agrupar dados por mês e loja
      const grouped: Record<string, Record<string, number>> = {};
      const lojasSet: Set<string> = new Set();

      // Primeiro, coletar todas as lojas únicas
      data.forEach(item => {
        if (item.Loja) {
          const loja = item.Loja.trim();
          lojasSet.add(loja);
        }
      });

      // Agrupar os dados
      data.forEach(item => {
        if (!item.Data_Envio || !item.Loja) return;
        const date = new Date(item.Data_Envio);
        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; // yyyy-MM
        const loja = item.Loja.trim();

        if (!grouped[monthKey]) {
          grouped[monthKey] = {};
          // Inicializar todas as lojas com 0 para esse mês
          Array.from(lojasSet).forEach(l => grouped[monthKey][l] = 0);
        }

        grouped[monthKey][loja] = (grouped[monthKey][loja] || 0) + 1;
      });

      // Criar array final mantendo todas as lojas em ordem consistente
      const allLojas = Array.from(lojasSet).sort();
      const mesesArray: PromocaoMensal[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);

        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

        const obj: PromocaoMensal = {
          mes: date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        } as PromocaoMensal;

        // Adicionar dados das lojas para este mês (0 se não houver dados)
        allLojas.forEach(loja => {
          (obj as any)[loja] = grouped[monthKey]?.[loja] ?? 0;
        });

        mesesArray.push(obj);
      }

      setLojasAnoKeys(allLojas);
      setPromocoesAno(mesesArray);
    } catch (err) {
      console.error("Erro ao buscar Promoções anuais:", err);
    } finally {
      setIsLoadingPromocoesAno(false);
    }
  };

  // Buscar dados quando o componente for montado
  useEffect(() => {
    fetchPromocoesAno();
  }, []);

  const [promocoesAno, setPromocoesAno] = useState<PromocaoMensal[]>([]);
  const [isLoadingPromocoesAno, setIsLoadingPromocoesAno] = useState<boolean>(false);
  const [lojasAnoKeys, setLojasAnoKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCashback, setIsLoadingCashback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botsData, setBotsData] = useState<Array<{ status: string, count: number }>>([]);
  const [isLoadingBots, setIsLoadingBots] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<number>(1); // 1, 2 ou 3 meses
  const [promocoesHoje, setPromocoesHoje] = useState<Array<{ loja: string; quantidade: number }>>([]);
  const [isLoadingPromocoes, setIsLoadingPromocoes] = useState<boolean>(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState<boolean>(false);
  interface PromocaoNaoEnviada {
    loja: string;
    botDesconectado: number;
    numeroInvalido: number;
  }

  const [promocoesNaoEnviadas, setPromocoesNaoEnviadas] = useState<PromocaoNaoEnviada[]>([]);
  const [isLoadingPromocoesNaoEnviadas, setIsLoadingPromocoesNaoEnviadas] = useState(true);
  const [hoveredStoreIndex, setHoveredStoreIndex] = useState<number | null>(null);

  // Estilos base para as barras
  const barStyle = {
    transition: "opacity 0.2s ease-in-out",
    cursor: "pointer"
  } as const;

  const botBarStyle = {
    ...barStyle,
    filter: "drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
  };

  const numBarStyle = {
    ...barStyle,
    filter: "drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3))"
  };

  // Função para verificar se uma barra deve estar destacada
  const isBarHighlighted = (index: number) => {
    return hoveredStoreIndex === null || hoveredStoreIndex === index;
  };

  // Manipuladores de eventos para as barras
  const handleBarMouseEnter = (index: number) => {
    setHoveredStoreIndex(index);
  };

  const handleBarMouseLeave = () => {
    setHoveredStoreIndex(null);
  };

  // Componente personalizado para renderizar as barras com destaque
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, index, isHighlighted, style } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          style={{
            ...style,
            opacity: isHighlighted ? 1 : 0.3,
            transition: "opacity 0.2s ease-in-out"
          }}
          onMouseEnter={() => handleBarMouseEnter(index)}
          onMouseLeave={handleBarMouseLeave}
          cursor="pointer"
        />
      </g>
    );
  };


  interface PromocaoSemanal {
    dataEnvio: string;
    [key: string]: string | number; // suporta contagens dinâmicas por loja
  }

  const [promocoesSemanais, setPromocoesSemanais] = useState<PromocaoSemanal[]>([]);
  const [isLoadingPromocoesSemanais, setIsLoadingPromocoesSemanais] = useState(true);
  const [promocoesSemanaisCarregadas, setPromocoesSemanaisCarregadas] = useState(false);
const [formattedDate, setFormattedDate] = useState<string>("");
const [highlightedBarSemanal, setHighlightedBarSemanal] = useState<string | null>(null);
const [highlightedBarAnual, setHighlightedBarAnual] = useState<string | null>(null);
const [highlightedBarPesquisas, setHighlightedBarPesquisas] = useState<string | null>(null);
const [showMoreStores, setShowMoreStores] = useState(false);
const [currentPage, setCurrentPage] = useState(0);

// Estado para o gráfico de Pesquisas Enviadas
const [pesquisasEnviadas, setPesquisasEnviadas] = useState<any[]>([]);
const [lojasPesquisas, setLojasPesquisas] = useState<string[]>([]);
const [isLoadingPesquisas, setIsLoadingPesquisas] = useState(true);
const [hoveredLoja, setHoveredLoja] = useState<string | null>(null);

  // Função para buscar dados de pesquisas enviadas do Supabase
  const fetchPesquisasEnviadas = async () => {
    try {
      console.log("[DEBUG] Iniciando fetchPesquisasEnviadas");
      setIsLoadingPesquisas(true);
      if (!user?.empresa) {
        console.log("[DEBUG] Usuário não logado ou empresa não definida");
        setPesquisasEnviadas([]);
        setLojasPesquisas([]);
        return;
      }

      console.log(`[DEBUG] Buscando dados para empresa: ${user.empresa}`);
      const { supabase } = await import("@/lib/supabase");

      // Calcula a data de 6 meses atrás
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
      const seisMesesAtrasISO = seisMesesAtras.toISOString();
      console.log(`[DEBUG] Data de 6 meses atrás: ${seisMesesAtrasISO}`);

      // Busca dados de pesquisas enviadas filtrados pela empresa do usuário
      const { data, error } = await supabase
        .from("pesquisas_enviadas")
        .select("criado_em, loja, rede")
        .eq("rede", user.empresa)
        .gte("criado_em", seisMesesAtrasISO)
        .order("criado_em", { ascending: true });

      if (error) {
        console.error("[DEBUG] Erro na consulta Supabase:", error);
        throw error;
      }

      console.log(`[DEBUG] Dados recebidos: ${data?.length || 0} registros`);

      // Agrupar dados por mês e loja
      const groupedData: Record<string, Record<string, number>> = {};
      const lojasSet: Set<string> = new Set();

      // Primeiro, coletar todas as lojas únicas
      data.forEach(item => {
        if (item.loja) {
          const loja = item.loja.trim();
          lojasSet.add(loja);
        }
      });

      console.log(`[DEBUG] Lojas encontradas: ${Array.from(lojasSet).join(', ')}`);

      // Agrupar os dados por mês
      data.forEach(item => {
        if (!item.criado_em || !item.loja) return;
        
        const date = new Date(item.criado_em);
        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; // yyyy-MM
        const loja = item.loja.trim();

        if (!groupedData[monthKey]) {
          groupedData[monthKey] = {};
          // Inicializar todas as lojas com 0 para esse mês
          Array.from(lojasSet).forEach(l => groupedData[monthKey][l] = 0);
          // Inicializar o Total com 0
          groupedData[monthKey]["Total"] = 0;
        }

        groupedData[monthKey][loja] = (groupedData[monthKey][loja] || 0) + 1;
        groupedData[monthKey]["Total"] = (groupedData[monthKey]["Total"] || 0) + 1;
      });

      console.log("[DEBUG] Dados agrupados por mês:", groupedData);

      // Criar array final com os últimos 6 meses
      const allLojas = Array.from(lojasSet).sort();
      const mesesArray = [];

      // Obter os últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        const monthName = date.toLocaleDateString("pt-BR", { month: "short" }).charAt(0).toUpperCase() + date.toLocaleDateString("pt-BR", { month: "short" }).slice(1);

        const obj: any = {
          mes: monthName
        };

        // Adicionar Total
        obj["Total"] = groupedData[monthKey]?.["Total"] ?? 0;

        // Adicionar dados das lojas para este mês (0 se não houver dados)
        allLojas.forEach(loja => {
          obj[loja] = groupedData[monthKey]?.[loja] ?? 0;
        });

        mesesArray.push(obj);
      }

      console.log("[DEBUG] Array final de meses:", mesesArray);
      setLojasPesquisas(allLojas);
      setPesquisasEnviadas(mesesArray);
      console.log("[DEBUG] Estados atualizados com sucesso");
    } catch (error) {
      console.error("[DEBUG] Erro ao buscar dados de pesquisas enviadas:", error);
      setPesquisasEnviadas([]);
      setLojasPesquisas([]);
    } finally {
      setIsLoadingPesquisas(false);
    }
  };

  // Carregar dados reais de pesquisas enviadas quando o componente for montado
  useEffect(() => {
    if (user?.empresa) {
      fetchPesquisasEnviadas();
    }
  }, [user]);

  // Dados de Pesquisas Enviadas removidos para evitar duplicação e conexões com Supabase
  // As variáveis de estado pesquisasEnviadas, lojasPesquisas, isLoadingPesquisas e hoveredLoja
  // foram mantidas para não quebrar referências em outros componentes
  
  // Removido o useEffect de inicialização de dados de exemplo, pois agora está integrado no useEffect principal

  // Função para buscar dados de Promoções semanais
  const fetchPromocoesSemanais = async () => {
    // Evita múltiplas chamadas na mesma sessão
    if (promocoesSemanaisCarregadas) return;

    try {
      setIsLoadingPromocoesSemanais(true);
      if (!user?.empresa) throw new Error("Dados insuficientes para buscar Promoções");

      const { supabase } = await import("@/lib/supabase");

      const hoje = new Date();
      const seteDiasAtras = new Date();

      const hojeISO = hoje.toISOString().split("T")[0];
      const seteDiasAtrasISO = seteDiasAtras.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("Relatorio Envio de Promoções")
        .select("Loja, Data_Envio")
        .gte("Data_Envio", seteDiasAtrasISO)
        .lte("Data_Envio", hojeISO)
        .eq("Rede", user.empresa)
        .order("Data_Envio", { ascending: true });

      if (error) throw error;

      // Agrupar dados por data e loja
      const groupedData: Record<string, Record<string, number>> = {};
      const lojasSet: Set<string> = new Set();
      data.forEach(item => {
        const dateKey = item.Data_Envio; // ISO yyyy-mm-dd
        const loja = item.Loja || "Desconhecida";
        lojasSet.add(loja);
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {};
        }
        groupedData[dateKey][loja] = (groupedData[dateKey][loja] || 0) + 1;
      });

      const allLojas = Array.from(lojasSet);

      const diasArray: PromocaoSemanal[] = [];
      for (let i = 0; i <= 6; i++) {
        const dia = new Date(seteDiasAtras);
        dia.setUTCDate(seteDiasAtras.getUTCDate() + i);
        const iso = dia.toISOString().split("T")[0];
        const diaObj: PromocaoSemanal = {
          dataEnvio: dia.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
        };
        allLojas.forEach(loja => {
          diaObj[loja] = groupedData[iso]?.[loja] ?? 0;
        });
        diasArray.push(diaObj);
      }

      setLojasSemanaisKeys(allLojas);
      setPromocoesSemanais(diasArray);
      setPromocoesSemanaisCarregadas(true); // Marca como carregado
    } catch (error) {
      console.error("Erro ao buscar dados de Promoções semanais:", error);
    } finally {
      setIsLoadingPromocoesSemanais(false);
    }
  };

  // Buscar dados de Promoções semanais quando o usuário estiver logado (apenas uma vez por sessão)
  useEffect(() => {
    if (user?.empresa && !promocoesSemanaisCarregadas) {
      fetchPromocoesSemanais();
    }
  }, [user, promocoesSemanaisCarregadas]);

  // Limpar cache quando sair do dashboard
  useEffect(() => {
    return () => {
      clearAllCache();
    };
  }, []);

  // useEffect removido - será chamado mais abaixo após a definição da função

    // useEffect para buscar dados de gênero foi removido

  // useEffects serão adicionados após as declarações das funções



    // Função fetchGenderData removida - gráfico de gênero dos clientes foi removido

  // Função para buscar dados do relatório de aniversérios (memoizada) - REMOVIDA TEMPORARIAMENTE
  // const fetchBirthdayReportData = useCallback(async () => {
  //   try {
  //     const userData = JSON.parse(localStorage.getItem("ps_user") || "{}");
  //     if (!userData || !userData.empresa) {
  //       console.log("usuário não logado ou empresa não definida");
  //       setBirthdayReportData([]);
  //       return;
  //     }

  //     console.log("Buscando dados do relatório de aniversérios para a empresa:", userData.empresa);
  //     const data = await getBirthdayReportByStore(userData.empresa);
  //     setBirthdayReportData(data);
  //     console.log("Dados do relatório de aniversérios carregados:", data);
  //   } catch (error) {
  //     console.error("Erro ao buscar dados do relatório de aniversérios:", error);
  //     setBirthdayReportData([]);
  //   }
  // }, []);





  // Função utilitária para retry com backoff exponencial
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Backoff exponencial: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  // Função para buscar dados de respostas de pesquisas (memoizada)
  const fetchRespostasPesquisasData = useCallback(async () => {
    try {
      if (!user?.empresa) {
        setRespostasPesquisasData([]);
        setRespostasPesquisasStats(null);
        setRespostasPesquisasError(null);
        return;
      }

      setIsLoadingRespostasPesquisas(true);
      setRespostasPesquisasError(null);
      
      // Busca dados do gráfico e estatísticas em paralelo com retry
      const [data, stats] = await Promise.all([
        retryWithBackoff(() => getRespostasPesquisasByStore(user.empresa || '')),
        retryWithBackoff(() => getRespostasPesquisasStats(user.empresa || ''))
      ]);
      
      setRespostasPesquisasData(data);
      setRespostasPesquisasStats(stats);
      setRespostasPesquisasError(null);
    } catch (error) {
      console.error("Erro ao carregar dados de respostas de pesquisas:", error);
      
      // Define mensagem de erro específica baseada no tipo de erro
      let errorMessage = "Erro ao carregar dados de pesquisas";
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Tempo limite excedido. Tente novamente em alguns instantes.";
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = "Sem permissão para acessar os dados de pesquisas.";
        }
      }
      
      setRespostasPesquisasData([]);
      setRespostasPesquisasStats(null);
      setRespostasPesquisasError(errorMessage);
    } finally {
      setIsLoadingRespostasPesquisas(false);
    }
  }, [user]);

  // Função para buscar dados detalhados do relatório de aniversérios (memoizada)
  const fetchDetailedBirthdayReportData = useCallback(async () => {
    try {
      if (!user?.empresa) {
        console.log("usuário não logado ou empresa não definida");
        setDetailedBirthdayReportData([]);
        setBirthdayDetailedLojas([]);
        return;
      }

      console.log("Buscando dados detalhados do relatório de aniversérios para a empresa:", user.empresa);
      const data = await getDetailedBirthdayReportByStore(user.empresa);
      console.log("Dados detalhados do relatório de aniversérios carregados:", data);

      setDetailedBirthdayReportData(data);

      // Extrair lojas dos dados detalhados
      if (data.length > 0) {
        const lojas = Object.keys(data[0]).filter(key => key !== "mes").sort((a, b) => {
          const aNum = parseInt(a);
          const bNum = parseInt(b);

          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }

          return a.localeCompare(b);
        });
        setBirthdayDetailedLojas(lojas);
      } else {
        setBirthdayDetailedLojas([]);
      }

    } catch (error) {
      console.error("Erro ao buscar dados detalhados do relatório de aniversérios:", error);
      setDetailedBirthdayReportData([]);
      setBirthdayDetailedLojas([]);
    }
  }, [user]);

  // Função para buscar dados de cashback (memoizada)
  const fetchCashbackData = useCallback(async () => {
    try {
      if (!user?.empresa) {
        console.log("ℹ️ Usuário não logado ou empresa não definida - limpando dados de cashback detalhado");
        setCashbackTemTotalData([]);
        setCashbackTemTotalLojas([]);
        return;
      }

      console.log(`🔍 Buscando dados de cashback detalhado para a empresa: ${user.empresa}`);
      const result = await getCashbackData(user.empresa);
      setCashbackTemTotalData(result.data);
      setCashbackTemTotalLojas(result.lojas);
      
      console.log(`✅ Dados de cashback detalhado carregados:`, {
        empresa: user.empresa,
        totalMeses: result.data.length,
        totalLojas: result.lojas.length
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("❌ Erro ao buscar dados de cashback detalhado:", {
        error: errorMessage,
        empresa: user?.empresa
      });
      
      // Limpar dados em caso de erro
      setCashbackTemTotalData([]);
      setCashbackTemTotalLojas([]);
      
      // Aqui poderia adicionar um estado de erro específico para o cashback detalhado se necessário
      // setErrorCashbackDetalhado(errorMessage);
    }
  }, [user]);

  // useEffects para buscar dados após as declarações das funções
  // useEffect(() => {
  //   if (user && user.empresa) {
  //     fetchBirthdayReportData();
  //   }
  // }, [user, fetchBirthdayReportData]);

  // Nova função para buscar dados de Aniversários Gerais
  const fetchAniversariosGerais = useCallback(async () => {
    try {
      if (!user?.empresa) {
        setBirthdayReportData([]);
        return;
      }

      const { supabase } = await import("@/lib/supabase");

      // Calcular data de 6 meses atrás
      const currentDate = new Date();
      const seisMesesAtras = new Date(currentDate);
      seisMesesAtras.setMonth(currentDate.getMonth() - 6);
      const dataInicio = seisMesesAtras.toISOString().split('T')[0];
      const dataFim = currentDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('loja, criado_em, rede, mensagem_entrege')
        .eq('rede', user.empresa)
        .eq('mensagem_entrege', 'sim')
        .gte('criado_em', dataInicio)
        .lte('criado_em', dataFim);

      if (error) {
        console.error("Erro ao buscar aniversários gerais:", error);
        setBirthdayReportData([]);
        return;
      }

      if (!data || data.length === 0) {
        setBirthdayReportData([]);
        return;
      }

      // Agrupar dados por loja e contar
      const storeCount: Record<string, number> = {};

      data.forEach((item) => {
        if (!item.loja) return;
        const loja = item.loja.trim();
        storeCount[loja] = (storeCount[loja] || 0) + 1;
      });

      // Converter para formato do gráfico
      const result = Object.entries(storeCount)
        .map(([loja, count]) => ({
          name: loja,
          valor: count
        }))
        .sort((a, b) => {
          const aNum = parseInt(a.name);
          const bNum = parseInt(b.name);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          return a.name.localeCompare(b.name);
        });

      setBirthdayReportData(result);

    } catch (error) {
      console.error("Erro ao carregar dados dos aniversários:", error);
      setBirthdayReportData([]);
    }
  }, [user]);

  // useEffect para carregar dados de Aniversários Gerais
  useEffect(() => {
    fetchAniversariosGerais();
  }, [fetchAniversariosGerais]);

  useEffect(() => {
    if (user?.empresa) {
      fetchDetailedBirthdayReportData();
    }
  }, [user, fetchDetailedBirthdayReportData]);

  useEffect(() => {
    if (user?.empresa) {
      fetchRespostasPesquisasData();
    }
  }, [user, fetchRespostasPesquisasData]);







  useEffect(() => {
    if (user?.empresa) {
      fetchCashbackData();
    }
  }, [user, fetchCashbackData]);

  // Função para buscar dados de Promoções não enviadas (bot desconectado e número inválido)
  const fetchPromocoesNaoEnviadas = async () => {
    try {
      setIsLoadingPromocoesNaoEnviadas(true);

      if (!user?.empresa) {
        throw new Error("Dados insuficientes para buscar Promoções não enviadas");
      }

      // Importa o cliente do Supabase
      const { supabase } = await import("@/lib/supabase");

      // Buscar dados da tabela "Relatorio Envio de Promoções" com filtro para Obs = "bot desconectado" ou "numero invalido"
      const { data, error } = await supabase
        .from("Relatorio Envio de Promoções")
        .select("Loja, Obs, Data_Envio")
        .eq("Rede", user.empresa)
        .or("Obs.eq.bot desconectado,Obs.eq.numero invalido")
        .order("Data_Envio", { ascending: false });

      if (error) {
        console.error("Erro ao buscar dados de Promoções não enviadas:", error);
        setPromocoesNaoEnviadas([]);
        setIsLoadingPromocoesNaoEnviadas(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("Nenhum dado de Promoções não enviadas encontrado");
        setPromocoesNaoEnviadas([]);
        setIsLoadingPromocoesNaoEnviadas(false);
        return;
      }

      // Agrupar por loja e contar por tipo de observação
      const lojaStats: Record<string, { botDesconectado: number; numeroInvalido: number }> = {};

      data.forEach(item => {
        if (!item.Loja) return;

        const loja = item.Loja.trim();
        if (!lojaStats[loja]) {
          lojaStats[loja] = { botDesconectado: 0, numeroInvalido: 0 };
        }

        if (item.Obs === "bot desconectado") {
          lojaStats[loja].botDesconectado += 1;
        } else if (item.Obs === "numero invalido") {
          lojaStats[loja].numeroInvalido += 1;
        }
      });

      // Converter para o formato esperado pelo gráfico
      const formattedData = Object.entries(lojaStats)
        .map(([loja, stats]) => ({
          loja: loja,
          botDesconectado: stats.botDesconectado,
          numeroInvalido: stats.numeroInvalido,
        }))
        .sort((a, b) => b.botDesconectado + b.numeroInvalido - (a.botDesconectado + a.numeroInvalido));

      setPromocoesNaoEnviadas(formattedData);
      setIsLoadingPromocoesNaoEnviadas(false);
    } catch (error) {
      console.error("Erro ao buscar dados de Promoções não enviadas:", error);
      setPromocoesNaoEnviadas([]);
      setIsLoadingPromocoesNaoEnviadas(false);
    }
  };

  const fetchPromocoesHoje = async () => {
    try {
      setIsLoadingPromocoes(true);

      if (!user?.empresa) {
        throw new Error("Dados insuficientes para buscar Promoções");
      }

      // Importa o cliente do Supabase
      const { supabase } = await import("@/lib/supabase");

      // Calcula a data de dois meses atrás
      const hoje = new Date();
      const doisMesesAtras = new Date();
      doisMesesAtras.setMonth(hoje.getMonth() - 2);

      // Formata as datas para o formato YYYY-MM-DD
      const dataInicio = doisMesesAtras.toISOString().split("T")[0];
      const dataFim = hoje.toISOString().split("T")[0];

      console.log(`Buscando dados de envio de Promoções com números inválidos de ${dataInicio} até ${dataFim}`);

      // Buscar dados da tabela "Relatorio Envio de Promoções" com filtro para Obs = "numero invalido"
      console.log("Buscando dados de Promoções hoje para a empresa:", user.empresa);
      const { data, error } = await supabase
        .from("Relatorio Envio de Promoções")
        .select("Loja, Obs, Rede")
        .gte("Data_Envio", dataInicio) // Data maior ou igual a dois meses atrás
        .lte("Data_Envio", dataFim)   // Data menor ou igual a hoje
        .eq("Rede", user.empresa)     // Filtra pela rede do usuário logado
        .eq("Obs", "numero invalido")
        .order("Data_Envio", { ascending: false }); // Ordena por data mais recente

      if (error) {
        console.error("Erro ao buscar dados de Promoções hoje:", error);
        throw error;
      }

      console.log("Dados de Promoções hoje encontrados:", data);


      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("Nenhum dado de envio de Promoções encontrado para hoje");
        setPromocoesHoje([]);
        return;
      }

      // Agrupar por loja e contar
      const lojaCount: Record<string, number> = {};

      data.forEach(item => {
        const loja = item.Loja || "Sem Loja";
        lojaCount[loja] = (lojaCount[loja] || 0) + 1;
      });

      // Converter para o formato esperado pelo gráfico
      const formattedData = Object.entries(lojaCount).map(([loja, quantidade]) => ({
        loja,
        quantidade
      }));

      console.log("Dados de envio de Promoções formatados:", formattedData);
      setPromocoesHoje(formattedData);

    } catch (err) {
      console.error("Erro ao buscar dados de envio de Promoções:", err);
      setPromocoesHoje([]);
    } finally {
      setIsLoadingPromocoes(false);
    }
  };



  // Função para buscar o total de bots com status "open"
  const fetchBotsOpenCount = async (userEmpresa: string) => {
    try {
      const url = new URL('/api/bots', window.location.origin);

      // Filtra por status "open" e empresa do usuário
      url.searchParams.append("status", "eq.open");
      if (userEmpresa) {
        url.searchParams.append("rede", `eq.${userEmpresa}`);
      }

      const response = await fetch(url.toString(), {
        method: "HEAD",
        headers: {
          "Range-Unit": "items",
          "Prefer": "count=planned"
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar total de bots ativos");
      }

      const contentRange = response.headers.get("content-range");
      return contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;
    } catch (err) {
      console.error("Erro ao buscar contagem de bots ativos:", err);
      return 0;
    }
  };



  // Função para buscar dados de cashback por loja, filtrando por peré­odo
  // Função para buscar dados de cashback por loja, filtrando por período ou datas específicas
  const fetchCashbackPorLoja = async (meses?: number, startDate?: string, endDate?: string) => {
    try {
      setIsLoadingCashback(true);
      setError(null);

      // Validação da empresa do usuário
      if (!user?.empresa) {
        const errorMsg = "Usuário não autenticado ou sem empresa definida";
        console.error(`❌ Erro no fetchCashbackPorLoja: ${errorMsg}`);
        setError("Erro de autenticação. Faça login novamente.");
        return [];
      }

      console.log(`🔍 Iniciando busca de dados de cashback para empresa: ${user.empresa}`);

      let dataInicialISO: string | undefined;
      let dataFinalISO: string | undefined;

      // Se datas específicas foram fornecidas, usar elas
      if (startDate && endDate) {
        dataInicialISO = startDate;
        dataFinalISO = endDate;
        console.log(`📅 Usando filtro de datas específicas: ${startDate} até ${endDate}`);
      } else if (meses) {
        // Calcula a data inicial com base no período selecionado
        const dataInicial = new Date();
        dataInicial.setMonth(dataInicial.getMonth() - meses);
        dataInicialISO = dataInicial.toISOString().split("T")[0]; // Formato YYYY-MM-DD
        dataFinalISO = new Date().toISOString().split("T")[0];
        console.log(`📅 Usando filtro de período: ${meses} meses (${dataInicialISO} até ${dataFinalISO})`);
      }

      // Usar o serviço melhorado de cashback
      const { data: cashbackData, lojas } = await getCashbackData(
        user.empresa,
        dataInicialISO,
        dataFinalISO
      );

      // Converter os dados para o formato esperado pelo gráfico
      const formattedData = lojas.map(loja => {
        // Somar todas as ocorrências da loja em todos os meses
        const quantidade = cashbackData.reduce((total, monthData) => {
          const lojaKey = `loja${loja}`;
          return total + (typeof monthData[lojaKey] === 'number' ? monthData[lojaKey] as number : 0);
        }, 0);

        return {
          loja,
          quantidade
        };
      }).filter(item => item.quantidade > 0); // Filtrar lojas sem dados

      console.log(`✅ Dados de cashback processados:`, {
        empresa: user.empresa,
        totalLojas: formattedData.length,
        dados: formattedData
      });

      if (formattedData.length === 0) {
        console.log("ℹ️ Nenhum dado de cashback encontrado para os filtros aplicados");
        setError("Nenhum dado de cashback encontrado para a sua empresa.");
        return [];
      }

      return formattedData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("❌ Erro ao buscar dados de cashback:", {
        error: errorMessage,
        empresa: user?.empresa,
        startDate,
        endDate,
        meses
      });
      
      setError(`Erro ao carregar dados de cashback: ${errorMessage}`);

      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    } finally {
      setIsLoadingCashback(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Busca os dados iniciais
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Busca a contagem de clientes usando Supabase
        const { supabase } = await import("@/lib/supabase");
        
        const { count: clientesCount, error: clientesError } = await supabase
          .from("clientes_decorfabril")
          .select("*", { count: "exact", head: true })
          .eq("Rede", user.empresa || "");

        if (clientesError) {
          console.error("Erro ao buscar clientes:", clientesError);
          throw clientesError;
        }

        // Busca os dados em paralelo
        const [
          pesquisasCount,
          promocoesCount,
          botsAbertos
        ] = await Promise.all([
          getPesquisasEnviadasCount(user.empresa || ""),
          getPromocoesCount(user.empresa || ""),
          fetchBotsOpenCount(user.empresa || "")
        ]);

        // Atualiza os estados
        setClientCount(clientesCount);
        setPesquisasEnviadasCount(pesquisasCount);
        setPromocaoCount(promocoesCount);
        setBotsOpenCount(botsAbertos);
        setError(null);

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("não foi possé­vel carregar os dados. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Formata o número com separadores de milhar
  const formatNumber = (num: number | null) => {
    if (num === null) return "...";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };



  // Buscar dados de envio de Promoções quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchPromocoesHoje();
      fetchPromocoesNaoEnviadas();
    }
  }, [user]);

  // Busca os dados dos bots
  useEffect(() => {
    if (!user) return;

    const fetchBotsData = async () => {
      try {
        setIsLoadingBots(true);

        // Cria a URL com os paré¢metros de consulta
        const url = new URL('/api/bots', window.location.origin);
        url.searchParams.append("select", "status,rede");

        // Adiciona filtro por empresa do usuário, se disponé­vel
        if (user.empresa) {
          url.searchParams.append("rede", `eq.${user.empresa}`);
        }

        const response = await fetch(url.toString(), {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados dos bots");
        }

        const data = await response.json();

        // Conta a quantidade de cada status
        const statusCounts = data.reduce((acc: Record<string, number>, bot: { status: string }) => {
          const status = bot.status?.toLowerCase() || "close";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Garante que todos os status existam, mesmo que com contagem zero
        const allStatus = ["open", "qrcode", "close"];
        const formattedData = allStatus.map(status => ({
          status,
          count: statusCounts[status] || 0
        }));

        setBotsData(formattedData);
      } catch (err) {
        console.error("Erro ao buscar dados dos bots:", err);
        setError("Erro ao carregar dados dos bots");
        // Define valores padré£o em caso de erro
        setBotsData([
          { status: "open", count: 0 },
          { status: "qrcode", count: 0 },
          { status: "close", count: 0 }
        ]);
      } finally {
        setIsLoadingBots(false);
      }
    };

    fetchBotsData();
  }, [user]);

  // Atualiza o gráfico de cashback quando o período ou datas mudam
  useEffect(() => {
    if (!user) return;

    const carregarCashback = async () => {
      // Se há datas específicas definidas, usar elas; senão usar período
      if (cashbackStartDate && cashbackEndDate) {
        const dados = await fetchCashbackPorLoja(undefined, cashbackStartDate, cashbackEndDate);
        setCashbackData(dados);
      } else {
        const dados = await fetchCashbackPorLoja(periodoSelecionado);
        setCashbackData(dados);
      }
    };

    carregarCashback();
  }, [periodoSelecionado, user, cashbackStartDate, cashbackEndDate]);

  // Atualiza os dados estáticos com os valores reais
  const updatedStatsData = [...statsData];
  updatedStatsData[0].value = formatNumber(clientCount || 0);
  updatedStatsData[1].value = formatNumber(pesquisasEnviadasCount || 0);
  updatedStatsData[2].value = formatNumber(promocaoCount || 0);

  // Encontra o card de Robôs conectados e adiciona o data-component-name
  const robosCard = updatedStatsData[3];
  robosCard.dataComponentName = "_c8";
  const totalBots = botsData.reduce((sum, item) => sum + item.count, 0);
  // Encontra o número de bots com status "open"
  const openBots = botsData.find(item => item.status === "open")?.count || 0;
  // Atualiza o valor do card para mostrar apenas os bots "open"
  robosCard.value = formatNumber(openBots);

  return (
    <>
      {/* Card de Data */}
      <Card className="border-0 shadow-sm mb-6 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center text-black" data-component-name="DashboardPage">
            <span className="text-lg font-medium" data-component-name="DashboardPage">Data: </span>
            <span className="ml-2 text-lg font-medium">{currentUtcDateTime}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estaté­sticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {updatedStatsData.map((stat, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} shadow-lg overflow-hidden border-b-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className={`text-sm font-medium ${stat.textColor} drop-shadow-sm`}>
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconColor}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white drop-shadow-sm" data-component-name={stat.dataComponentName || ""}>
                {isLoading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* gráfico de Cashback por Loja */}
      <div className="mt-8">
        <Card className="bg-card border border-gray-200 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 pb-2" data-component-name="_c2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-gray-800 text-lg">
                  Cashbacks enviados - {periodoSelecionado} {periodoSelecionado === 1 ? 'mês' : 'meses'}
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">Total de envios de cashback agrupados por loja</CardDescription>
              </div>
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                {/* Filtros de período predefinido */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Período:</span>
                  <div className="inline-flex rounded-md shadow-sm select-none" role="group">
                    <div
                      onClick={() => {
                        setPeriodoSelecionado(1);
                        setCashbackStartDate('');
                        setCashbackEndDate('');
                      }}
                      className={`px-3 py-1 text-sm font-medium border-r-0 rounded-l-lg cursor-pointer transition-all duration-300 ${periodoSelecionado === 1 && !cashbackStartDate && !cashbackEndDate
                        ? "text-white border-transparent"
                        : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      style={periodoSelecionado === 1 && !cashbackStartDate && !cashbackEndDate ? {
                        background: "linear-gradient(135deg, rgb(147, 197, 253) 0%, rgb(59, 130, 246) 100%)",
                        border: "none",
                        boxShadow: "0 2px 15px rgba(0, 0, 0, 0.15)"
                      } : {}}
                    >
                      1 mês
                    </div>
                    <div
                      onClick={() => {
                        setPeriodoSelecionado(2);
                        setCashbackStartDate('');
                        setCashbackEndDate('');
                      }}
                      className={`px-3 py-1 text-sm font-medium border cursor-pointer transition-all duration-300 ${periodoSelecionado === 2 && !cashbackStartDate && !cashbackEndDate
                        ? "text-white border-transparent"
                        : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      style={periodoSelecionado === 2 && !cashbackStartDate && !cashbackEndDate ? {
                        background: "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(168, 85, 247) 100%)",
                        border: "none",
                        boxShadow: "0 2px 15px rgba(0, 0, 0, 0.15)"
                      } : {}}
                    >
                      2 Meses
                    </div>
                    <div
                      onClick={() => {
                        setPeriodoSelecionado(3);
                        setCashbackStartDate('');
                        setCashbackEndDate('');
                      }}
                      className={`px-3 py-1 text-sm font-medium border-l-0 rounded-r-lg cursor-pointer transition-all duration-300 ${periodoSelecionado === 3 && !cashbackStartDate && !cashbackEndDate
                        ? "text-white border-transparent"
                        : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      style={periodoSelecionado === 3 && !cashbackStartDate && !cashbackEndDate ? {
                        background: "linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgb(124, 58, 237) 100%)",
                        border: "none",
                        boxShadow: "0 2px 15px rgba(0, 0, 0, 0.15)"
                      } : {}}
                    >
                      3 Meses
                    </div>
                  </div>
                </div>

                {/* Filtros de data específica */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">ou por data:</span>
                  <input
                    type="date"
                    value={cashbackStartDate}
                    onChange={(e) => setCashbackStartDate(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Data inicial"
                  />
                  <span className="text-sm text-gray-400">até</span>
                  <input
                    type="date"
                    value={cashbackEndDate}
                    onChange={(e) => setCashbackEndDate(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Data final"
                  />
                  {(cashbackStartDate || cashbackEndDate) && (
                    <button
                      onClick={() => {
                        setCashbackStartDate('');
                        setCashbackEndDate('');
                      }}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <ExcelExportButton
                  graphData={cashbackData}
                  currentPeriod={periodoSelecionado}
                  isLoading={isLoadingCashback}
                />
              </div>
            </div>
          </div>
          <CardContent className="pt-4">
            {isLoadingCashback ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : cashbackData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum dado de cashback encontrado para a sua empresa</div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    key={periodoSelecionado}
                    data={cashbackData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                    barSize={20}
                    barGap={16}
                    barCategoryGap={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="loja"
                      axisLine={false}
                      tickLine={false}
                      angle={0}
                      textAnchor="middle"
                      height={60}
                      tick={{
                        fontSize: 12,
                        fill: "#6b7280" // gray-500
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#6b7280" // gray-500
                      }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderColor: "#e5e7eb", // gray-200
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        color: "#1f2937" // gray-800
                      }}
                      formatter={(value: number) => {
                        const formattedValue = new Intl.NumberFormat("pt-BR", {
                          maximumFractionDigits: 0
                        }).format(value);
                        return [
                          <span key="value" style={{ color: "#1f2937" }}>{formattedValue}</span>,
                          "Quantidade"
                        ];
                      }}
                      labelFormatter={(label: string) => (
                        <span style={{ color: "#1f2937", fontWeight: 500 }}>Loja: {label}</span>
                      )}
                      itemStyle={{ color: "#1f2937" }}
                      labelStyle={{ color: "#6b7280" }}
                    />
                    <Bar
                      dataKey="quantidade"
                      name="Quantidade"
                      radius={[4, 4, 0, 0]}
                      fill="hsl(var(--primary))"
                    >
                      {cashbackData.map((entry, index) => (
                        <RechartsCell
                          key={`cell-${index}`}
                          fill={`url(#gradient-${index % 2})`}
                        />
                      ))}
                      <defs>
                        <linearGradient id="gradient-0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(273, 87%, 70%)" />
                          <stop offset="100%" stopColor="hsl(273, 87%, 48%)" />
                        </linearGradient>
                        <linearGradient id="gradient-1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(273, 87%, 80%)" />
                          <stop offset="100%" stopColor="hsl(273, 87%, 60%)" />
                        </linearGradient>
                      </defs>
                      <LabelList
                        dataKey="quantidade"
                        position="top"
                        style={{
                          fontSize: "10px",
                          fontWeight: 500,
                          fill: "#374151", // gray-700
                          textShadow: "0 1px 2px rgba(255,255,255,0.8)"
                        }}
                        formatter={(value: unknown) => {
                          const numValue = Number(value);
                          if (isNaN(numValue)) return "0";

                          // Para números com 4 ou mais dé­gitos, formata com 1 casa decimal
                          if (numValue >= 1000) {
                            const formatted = (numValue / 1000).toLocaleString("pt-BR", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1
                            });
                            return formatted.replace(/\./g, "|")
                              .replace(/,/g, ".")
                              .replace(/\|/g, ",");
                          }
                          // números menores que 1000 sem casas decimais
                          return numValue.toLocaleString("pt-BR", {
                            maximumFractionDigits: 0
                          });
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* gráfico de Bots Conectados */}
      {/* gráfico de Bots Conectados */}
      <div className="mt-8">
        <Card className="bg-card border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-800 text-lg">Bots Conectados</CardTitle>
                <CardDescription className="text-gray-500 text-sm">Status de conexão dos bots</CardDescription>
              </div>
              {user?.sub_rede && (
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-medium text-gray-700">Sub-rede:</span>
                  <span className="ml-1 font-semibold text-gray-900">{user.sub_rede}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingBots ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                        </filter>
                        <linearGradient id="qrcodeGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#C084FC" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={botsData.map(item => {
                          const status = item.status;
                          const fillColor = status === "qrcode" ? "url(#qrcodeGradient)" :
                            status === "close" ? "#800080" : "#60A5FA";
                          return {
                            ...item,
                            name: status === "qrcode" ? "QR Code" :
                              status === "close" ? "Close" : "Open",
                            value: item.count,
                            fill: fillColor
                          };
                        })}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={1}
                        dataKey="value"
                        label={({ name, percent }: { name: string; percent?: number }) => {
                          if ((percent || 0) < 0.05) return null; // não mostra rótulos muito pequenos
                          return (
                            <text
                              x={0} y={0}
                              fill="#FFFFFF"
                              textAnchor="middle"
                              dominantBaseline="central"
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                filter: "none"
                              }}
                            >
                              {`${((percent || 0) * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        labelLine={false}
                        className="outline-none"
                        style={{
                          filter: "url(#shadow)"
                        }}
                      >
                        {botsData.map((item) => {
                          const status = item.status;
                          const fillColor = status === "qrcode" ? "url(#qrcodeGradient)" :
                            status === "close" ? "#B45FEB" : "#60A5FA";
                          return {
                            ...item,
                            name: status === "qrcode" ? "QR Code" :
                              status === "close" ? "Close" : "Open",
                            value: item.count || 0, // Garante que sempre tenha um valor numé©rico
                            fill: fillColor,
                            status: status // Garante que o status seja mantido
                          };
                        })
                          .filter(item => item.value > 0) // Remove itens com valor zero
                          .map((entry, index) => (
                            <RechartsCell
                              key={`cell-${index}`}
                              fill={entry.status === "close" ? "#B45FEB" : entry.fill}
                              stroke="#fff"
                              strokeWidth={2}
                              style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                ...(entry.status === "close" && {
                                  fill: "#B45FEB",
                                  boxShadow: "0 0 10px rgba(180, 95, 235, 0.6)"
                                })
                              }}
                              onMouseEnter={(e: React.MouseEvent<SVGPathElement>) => {
                                const target = e.target as SVGGraphicsElement;
                                if (target) {
                                  target.style.filter = "brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.15))";
                                }
                              }}
                              onMouseLeave={(e: React.MouseEvent<SVGPathElement>) => {
                                const target = e.target as SVGGraphicsElement;
                                if (target) {
                                  target.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.1))";
                                }
                              }}
                            />
                          ))}

                        {/* Texto no centro do donut */}
                        <g transform="translate(0, -60)">
                          <text
                            x="50%"
                            y="55%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-3xl font-bold text-gray-800"
                            style={{
                              fontFeatureSettings: "tnum",
                              fontVariantNumeric: "tabular-nums",
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.05))"
                            }}
                          >
                            {totalBots}
                          </text>
                          <text
                            x="50%"
                            y="65%"
                            textAnchor="middle"
                            className="text-xs font-medium uppercase tracking-wider text-gray-500"
                            style={{
                              letterSpacing: "0.1em",
                              transform: "translateY(5px)"
                            }}
                          >
                            Bots no Total
                          </text>
                        </g>
                      </Pie>
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{
                          paddingTop: "24px",
                          paddingBottom: "8px"
                        }}
                        content={({ payload }) => {
                          // Mapeia os status para exibição amigével
                          const statusMap: Record<string, { display: string, color: string, gradient?: string, boxShadow?: string }> = {
                            "open": { display: "Open", color: "#60A5FA" }, // Azul claro
                            "qrcode": {
                              display: "QR Code",
                              color: "#8B5CF6",
                              gradient: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #C084FC 100%)",
                              boxShadow: "0 0 10px rgba(139, 92, 246, 0.6)"
                            },
                            "close": {
                              display: "Close",
                              color: "#A020F0",
                              boxShadow: "0 0 10px rgba(160, 32, 240, 0.5)"
                            }
                          };

                          return (
                            <ul className="flex flex-wrap justify-center gap-6">
                              {botsData.map((statusData) => {
                                const statusInfo = statusMap[statusData.status] || {
                                  display: statusData.status,
                                  color: "#A020F0" // Roxo Elé©trico
                                };
                                const percentage = totalBots > 0
                                  ? ((statusData.count / totalBots) * 100).toFixed(1)
                                  : "0.0";

                                return (
                                  <li key={statusData.status} className="flex items-center text-sm group">
                                    <div
                                      className="w-4 h-4 rounded-full mr-2 transition-all duration-200 group-hover:scale-110"
                                      style={statusInfo.gradient ? {
                                        background: statusInfo.gradient,
                                        boxShadow: statusInfo.boxShadow || "0 2px 6px rgba(0,0,0,0.15)"
                                      } : {
                                        backgroundColor: statusInfo.color,
                                        boxShadow: statusInfo.boxShadow || "0 2px 6px rgba(0,0,0,0.1)"
                                      }}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {statusInfo.display}
                                      </span>
                                      <span className="text-sm font-semibold text-gray-800">
                                        {statusData.count} <span className="text-xs font-normal text-gray-500">({percentage}%)</span>
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* gráficos de Status dos Bots */}
      <div className="mt-6">
        <Card className="border-0 shadow-sm w-full">
          <CardHeader className="space-y-0.5">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold text-black">Promoções não Enviadas - 3 Meses</CardTitle>
                <CardDescription className="text-gray-500">Motivos de falha no envio por loja</CardDescription>
              </div>
              <PromocoesExcelExportButton
                graphData={promocoesNaoEnviadas}
                title="Promoções não Enviadas - 3 Meses"
                isLoading={isLoadingPromocoesNaoEnviadas}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-end mb-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-1"></div>
                  <span className="text-xs text-gray-600">Bot Desconectado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#EC4899] mr-1"></div>
                  <span className="text-xs text-gray-600">Número Inválido</span>
                </div>
              </div>
            </div>
            <div className="h-80" data-component-name="_c8">
              <ResponsiveContainer width="100%" height="100%">
                {isLoadingPromocoesNaoEnviadas ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
                      <p className="text-gray-500">Carregando dados...</p>
                    </div>
                  </div>
                ) : (
                  <BarChart
                    data={promocoesNaoEnviadas}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barGap={0}
                    barCategoryGap={100}
                    barSize={28}
                    onMouseLeave={handleBarMouseLeave}
                  >
                    <defs>
                      <linearGradient id="botGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="numGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#DB2777" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="loja"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "#6B7280",
                        fontFamily: "Inter, sans-serif"
                      }}
                      tickMargin={8}
                      label={{
                        value: "Lojas",
                        position: "insideBottom",
                        offset: -2,
                        fontSize: 13,
                        fill: "#6B7280",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "bold"
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: "#6B7280",
                        fontFamily: "Arial, sans-serif"
                      }}
                      tickFormatter={(value) => new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value)}
                      label={{
                        value: "Quantidade",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fontSize: 14,
                          fontWeight: "bold",
                          fill: "#6B7280",
                          fontFamily: "Arial, sans-serif"
                        }
                      }}
                    />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null;

                        // Pega os dados da primeira barra (ambas téªm os mesmos dados)
                        const data = payload[0].payload;

                        return (
                          <div style={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                            border: "1px solid rgba(229, 231, 235, 0.5)",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                            fontFamily: "Inter, sans-serif"
                          }}>
                            <div style={{ color: "#4B5563", fontWeight: 600, marginBottom: "8px" }}>
                              Loja: {label}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div>
                                <span style={{ color: "#8B5CF6" }}>Bot desconectado: </span>
                                <span style={{ color: "#7C3AED", fontWeight: 600 }}>
                                  {new Intl.NumberFormat("pt-BR").format(data.botDesconectado || 0)}
                                </span>
                              </div>
                              <div>
                                <span style={{ color: "#EC4899" }}>Número inválido: </span>
                                <span style={{ color: "#DB2777", fontWeight: 600 }}>
                                  {new Intl.NumberFormat("pt-BR").format(data.numeroInvalido || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}

                      itemStyle={{
                        fontSize: "13px",
                        padding: "4px 0",
                        fontFamily: "Inter, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                      labelStyle={{
                        fontWeight: 600,
                        color: "#1F2937",
                        fontFamily: "Inter, sans-serif",
                        borderBottom: "1px solid #F3F4F6",
                        paddingBottom: "6px",
                        marginBottom: "8px"
                      }}
                    />
                    <Bar
                      dataKey="botDesconectado"
                      name="Bot Desconectado"
                      fill="url(#botGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                      shape={(props: any) => (
                        <CustomBar
                          {...props}
                          isHighlighted={isBarHighlighted(props.index)}
                          style={botBarStyle}
                        />
                      )}
                    />
                    <Bar
                      dataKey="numeroInvalido"
                      name="Número Inválido"
                      fill="url(#numGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                      shape={(props: any) => (
                        <CustomBar
                          {...props}
                          isHighlighted={isBarHighlighted(props.index)}
                          style={numBarStyle}
                        />
                      )}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* gráfico - números inválidos */}
        <div className="mt-8">
          <Card className="bg-card border border-gray-200 shadow-sm">
            <CardHeader className="space-y-0.5">
              <CardTitle className="text-lg font-semibold text-black">Números Inválidos dos Envios</CardTitle>
              <CardDescription className="text-gray-500">Números Inválidos</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80 flex items-center justify-center">
                <div className="w-full max-w-md">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    {isLoadingPromocoes ? (
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-lg text-gray-500"
                      >
                        Carregando dados...
                      </text>
                    ) : promocoesHoje.length === 0 ? (
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-lg text-gray-500"
                      >
                        Nenhum dado disponí­vel
                      </text>
                    ) : (
                      <>
                        <Pie
                          data={promocoesHoje}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={1}
                          dataKey="quantidade"
                          nameKey="loja"
                          label={({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, index = 0 }) => {
                            if (hoveredLoja === null || index === undefined) return null;

                            const RADIAN = Math.PI / 180;
                            const radius = 25 + innerRadius + (outerRadius - innerRadius);
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            const entry = promocoesHoje[index];
                            if (!entry || hoveredLoja !== entry.loja) return null;

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#4B5563"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                style={{
                                  backgroundColor: "white",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #e5e7eb",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  fontSize: "0.875rem",
                                  fontWeight: 500
                                }}
                              >
                                {`${entry.loja}: ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {promocoesHoje.map((entry, index) => (
                            <RechartsCell
                              key={`cell-${index}`}
                              fill={index % 3 === 0 ? "#60A5FA" : index % 3 === 1 ? "#8B5CF6" : "#B45FEB"}
                              stroke="#fff"
                              strokeWidth={2}
                              style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                ...(index % 3 === 2 && {
                                  fill: "#B45FEB",
                                  boxShadow: "0 0 10px rgba(180, 95, 235, 0.6)"
                                })
                              }}
                            />
                          ))}
                          <text
                            x="50%"
                            y="51%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-2xl font-bold text-gray-800"
                            style={{ transform: "translateY(-40px)" }}
                          >
                            {new Intl.NumberFormat("pt-BR").format(promocoesHoje.reduce((sum, item) => sum + item.quantidade, 0))}
                          </text>
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium uppercase tracking-wider text-gray-500"
                            style={{ transform: "translateY(-20px)", fontSize: "9px", letterSpacing: "0.1em" }}
                          >
                            Números Inválidos
                          </text>
                        </Pie>
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{
                            paddingTop: "0",
                            paddingBottom: "0",
                            position: "relative",
                            zIndex: 10,
                            marginTop: "-85px"
                          }}
                          content={({ payload }) => {
                            if (!payload || payload.length === 0) return null;

                            const total = promocoesHoje.reduce((sum, item) => sum + item.quantidade, 0);

                            // Ordenar lojas por quantidade (maior para menor)
                            const sortedData = [...promocoesHoje].sort((a, b) => b.quantidade - a.quantidade);

                            // Mostrar apenas os 3 primeiros itens
                            const topItems = sortedData.slice(0, 3);

                            return (
                              <div className="flex flex-col items-center">
                                <ul className="flex flex-wrap justify-center gap-6">
                                  {topItems.map((item, index) => {
                                    const percentage = ((item.quantidade / total) * 100).toFixed(0);
                                    const color = index % 3 === 0 ? "#60A5FA" : index % 3 === 1 ? "#8B5CF6" : "#B45FEB";
                                    const boxShadow = index % 3 === 1 ?
                                      "0 0 10px rgba(139, 92, 246, 0.6)" :
                                      index % 3 === 2 ?
                                        "0 0 10px rgba(180, 95, 235, 0.5)" :
                                        "none";

                                    const gradient = index % 3 === 1 ?
                                      "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #C084FC 100%)" :
                                      undefined;

                                    return (
                                      <li key={item.loja} className="flex items-center">
                                        <div
                                          className="w-3 h-3 rounded-full mr-2"
                                          style={{
                                            background: gradient || color,
                                            boxShadow
                                          }}
                                        />
                                        <div className="flex flex-col">
                                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {item.loja}
                                          </span>
                                          <span className="text-sm font-semibold text-gray-800">
                                            {new Intl.NumberFormat("pt-BR").format(item.quantidade)} <span className="text-xs font-normal text-gray-500">({percentage}%)</span>
                                          </span>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                                {promocoesHoje.length > 3 && (
                                  <button
                                    onClick={() => setIsStoreDialogOpen(true)}
                                    className="px-3 py-1 text-xs font-medium rounded-md btn-gradient hover:shadow-md transition-all duration-300"
                                  >
                                    Ver todas as {promocoesHoje.length} lojas
                                  </button>
                                )}
                              </div>
                            );
                          }}
                        />
                        <StoreListDialog
                          isOpen={isStoreDialogOpen}
                          onClose={() => setIsStoreDialogOpen(false)}
                          storeData={promocoesHoje.map((item, index) => {
                            const total = promocoesHoje.reduce((sum, item) => sum + item.quantidade, 0);
                            const percentage = ((item.quantidade / total) * 100).toFixed(0);
                            const color = index % 3 === 0 ? "#60A5FA" : index % 3 === 1 ? "#8B5CF6" : "#B45FEB";
                            return {
                              loja: item.loja,
                              quantidade: item.quantidade,
                              percentage,
                              color
                            };
                          }).sort((a, b) => b.quantidade - a.quantidade)}
                          total={promocoesHoje.reduce((sum, item) => sum + item.quantidade, 0)}
                        />
                      </>
                    )}
                  </PieChart>
                </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* O gráfico de gênero dos clientes foi removido */}

        {/* gráfico - Envio De Promoções - Essa Semana */}
        <div className="mt-6">
          <Card className="border-0 shadow-sm w-full">
            <CardHeader className="space-y-0.5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-black">Envio De Promoções - Última Semana</CardTitle>
                  <CardDescription className="text-gray-500">Resumo diário de envios de Promoções</CardDescription>
                </div>
                <PromocoesSemanaisExcelExportButton
                  graphData={promocoesSemanais}
                  lojas={lojasSemanaisKeys}
                  title="Envio De Promoções - Última Semana"
                  isLoading={isLoadingPromocoesSemanais}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 pb-16">
              {/* contéªiner rolével horizontalmente */}
              <div className="h-72 w-full overflow-x-auto">
                {/* largura diné¢mica baseada em número de dias */}
                <div style={{ width: `${Math.max(1000, promocoesSemanais.length * 140)}px`, height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={promocoesSemanais} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} barGap={4} barCategoryGap={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="dataEnvio" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Inter, sans-serif" }} tickMargin={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Inter, sans-serif" }} tickFormatter={(value) => new Intl.NumberFormat("pt-BR").format(value)} domain={[0, "dataMax"]} />
                      <RechartsTooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        shared={false}
                        formatter={(value: number, name: string) => {
                          if (name && name !== "dataEnvio") {
                            return [
                              new Intl.NumberFormat("pt-BR").format(value),
                              `Loja ${name}`
                            ];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
                        content={({ payload }) => {
                          const MAX_ITEMS = 10;
                          const hasMore = payload && payload.length > MAX_ITEMS;
                          const visibleItems = hasMore ? payload.slice(0, MAX_ITEMS) : payload;
                          const hiddenItems = hasMore ? payload.slice(MAX_ITEMS) : [];



                          return (
                            <div className="relative">
                              <ul className="flex flex-wrap gap-6 mt-6">
                                {visibleItems?.map((entry, index) => {
                                  const lojaKey = entry.value as string;
                                  const isHighlighted = highlightedBarSemanal === null || highlightedBarSemanal === lojaKey;
                                  return (
                                    <li
                                      key={`legend-${index}`}
                                      className="flex items-center p-1 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                                      onMouseEnter={() => setHighlightedBarSemanal(lojaKey)}
                                      onMouseLeave={() => setHighlightedBarSemanal(null)}
                                    >
                                      <div
                                        className={`w-3 h-3 rounded-full mr-2 transition-all duration-200 ${isHighlighted ? "" : "opacity-40"}`}
                                        style={{ backgroundColor: entry.color }}
                                      ></div>
                                      <span className={`text-xs font-semibold transition-all duration-200 ${isHighlighted ? "text-gray-900" : "text-gray-500 opacity-40"}`}>
                                        {lojaKey}
                                      </span>
                                    </li>
                                  );
                                })}

                                {hasMore && (
                                  <li className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMoreStores(!showMoreStores);
                                        setCurrentPage(0);
                                      }}
                                      className={`flex items-center p-1 text-xs text-blue-500 cursor-pointer hover:text-blue-700 transition-colors`}
                                    >
                                      {showMoreStores ? "Ver menos" : "Ver mais"}
                                    </button>

                                    {showMoreStores && (
                                      <div
                                        className="absolute z-10 left-full top-0 ml-2 py-1 bg-white rounded-md shadow-lg border border-gray-200 flex items-center"
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentPage(p => Math.max(0, p - 1));
                                          }}
                                          disabled={currentPage === 0}
                                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                          </svg>
                                        </button>

                                        <div className="flex">
                                          {hiddenItems.slice(currentPage * 3, (currentPage * 3) + 3).map((entry, index) => {
                                            const lojaKey = entry.value as string;
                                            return (
                                              <div
                                                key={`more-${index}`}
                                                className="flex-shrink-0 flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                                onMouseEnter={() => setHighlightedBarSemanal(lojaKey)}
                                                onMouseLeave={() => setHighlightedBarSemanal(null)}
                                              >
                                                <svg className="recharts-surface mr-2 flex-shrink-0" width="12" height="12" viewBox="0 0 32 32">
                                                  <path stroke="none" fill={entry.color} d="M0,4h32v24h-32z" className="recharts-legend-icon"></path>
                                                </svg>
                                                <span className="text-sm whitespace-nowrap" style={{ color: entry.color }}>
                                                  {lojaKey}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentPage(p => Math.min(Math.ceil(hiddenItems.length / 3) - 1, p + 1));
                                          }}
                                          disabled={currentPage >= Math.ceil(hiddenItems.length / 3) - 1}
                                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                  </li>
                                )}
                              </ul>
                            </div>
                          );
                        }}
                      />
                      {lojasSemanaisKeys.map((lojaKey, idx) => (
                        <Bar
                          key={lojaKey}
                          dataKey={lojaKey}
                          name={lojaKey}
                          fill={lojaColors[idx % lojaColors.length]}
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          onMouseEnter={() => setHighlightedBarSemanal(lojaKey)}
                          onMouseLeave={() => setHighlightedBarSemanal(null)}
                          className="transition-opacity duration-200"
                          style={{
                            opacity: highlightedBarSemanal === null || highlightedBarSemanal === lojaKey ? 1 : 0.3,
                          }}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* gráfico - Envio De Promoções - 1 ANO */}
          <Card className="border-0 shadow-sm col-span-full w-full mt-6">
            <CardHeader className="space-y-0.5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-black">Promoções Enviadas - Últimos 6 Meses</CardTitle>
                  <CardDescription className="text-gray-500">Resumo mensal de envios de promoções por loja</CardDescription>
                </div>
                <PromocoesAnuaisExcelExportButton
                  graphData={promocoesAno}
                  lojas={lojasAnoKeys}
                  title="Promoções Enviadas - Últimos 6 Meses"
                  isLoading={isLoadingPromocoesAno}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 relative">
              {/* Indicador de rolagem */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-sm text-gray-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
                <span>Shift + Scroll para rolar horizontalmente</span>
              </div>
              <div className="h-80 w-full overflow-x-auto">
                <div style={{ width: `${Math.max(1200, promocoesAno.length * 150)}px`, height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={promocoesAno} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} barGap={4} barCategoryGap={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }} tickMargin={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }} tickFormatter={(value) => new Intl.NumberFormat("pt-BR").format(value)} />
                      <RechartsTooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        shared={false}
                        content={({ payload, label }) => {
                          if (!payload || payload.length === 0) return null;

                          // Se estiver sobre uma barra especé­fica
                          if (payload[0]?.payload) {
                            const data = payload[0];
                            const lojaIndex = lojasAnoKeys.indexOf(data.name);
                            const corLoja = lojaAnoColors[lojaIndex % lojaAnoColors.length];
                            const mesAtual = label || payload[0].payload.mes;

                            return (
                              <div className="bg-white p-2 border rounded shadow-sm text-sm">
                                <p className="font-medium">
                                  <span className="text-black">Loja </span>
                                  <span style={{ color: corLoja }}>{data.name}</span>
                                </p>
                                <p>
                                  <span className="text-gray-700">Mês: {mesAtual}</span>
                                </p>
                                <p>
                                  <span className="text-gray-700">Total: </span>
                                  <span style={{ color: corLoja, fontWeight: 500 }}>
                                    {new Intl.NumberFormat("pt-BR").format(Number(data.value))}
                                  </span>
                                </p>
                              </div>
                            );
                          }

                          // Se estiver sobre o mês (érea vazia)
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm text-sm">
                              <p className="font-medium">{label}</p>
                              {payload.map((entry, index) => {
                                const lojaIndex = lojasAnoKeys.indexOf(entry.name);
                                const corLoja = lojaAnoColors[lojaIndex % lojaAnoColors.length];
                                return (
                                  <p key={`tooltip-${index}`}>
                                    <span className="text-black">Loja </span>
                                    <span style={{ color: corLoja }}>{entry.name}: </span>
                                    <span style={{ color: corLoja, fontWeight: 500 }}>
                                      {new Intl.NumberFormat("pt-BR").format(Number(entry.value))}
                                    </span>
                                  </p>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
                        content={({ payload }) => {
                          if (!payload) return null;

                          const colors = [
                            "bg-blue-500", "bg-blue-400", "bg-blue-300", "bg-green-500", "bg-green-400",
                            "bg-green-300", "bg-orange-500", "bg-orange-400", "bg-purple-500", "bg-purple-400"
                          ];

                          return (
                            <div className="flex flex-wrap gap-6 mt-6">
                              {payload.slice(0, 10).map((entry, index) => {
                                const lojaKey = entry.value as string;
                                const isHighlighted = highlightedBarAnual === null || highlightedBarAnual === lojaKey;

                                return (
                                  <div
                                    key={`legend-${index}`}
                                    className="flex items-center p-1 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                                    onMouseEnter={() => setHighlightedBarAnual(lojaKey)}
                                    onMouseLeave={() => setHighlightedBarAnual(null)}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-full mr-2 transition-all duration-200 ${isHighlighted ? "" : "opacity-40"}`}
                                      style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className={`text-xs font-semibold transition-all duration-200 ${isHighlighted ? "text-gray-900" : "text-gray-500 opacity-40"}`}>
                                      {lojaKey}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      {lojasAnoKeys.map((lojaKey, idx) => (
                        <Bar
                          key={`bar-${idx}`}
                          dataKey={lojaKey}
                          name={lojaKey}
                          fill={lojaAnoColors[idx % lojaAnoColors.length]}
                          radius={[8, 8, 0, 0]}
                          barSize={20}
                          onMouseEnter={() => setHighlightedBarAnual(lojaKey)}
                          onMouseLeave={() => setHighlightedBarAnual(null)}
                          className="transition-opacity duration-200"
                          style={{
                            opacity: highlightedBarAnual === null || highlightedBarAnual === lojaKey ? 1 : 0.3,
                          }}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* gráfico - Pesquisas Enviadas */}
          <Card className="border-0 shadow-sm col-span-full w-full mt-6">
            <CardHeader className="space-y-0.5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-black">Pesquisas Enviadas</CardTitle>
                  <CardDescription className="text-gray-500">Pesquisas Enviadas - Últimos 6 Meses</CardDescription>
                </div>
                <PesquisasEnviadasExcelExportButton
                  graphData={pesquisasEnviadas}
                  lojas={lojasPesquisas}
                  title="Pesquisas Enviadas - Últimos 6 Meses"
                  isLoading={isLoadingPesquisas}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                {isLoadingPesquisas ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={pesquisasEnviadas}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      barGap={0}
                      barCategoryGap="20%"
                      onMouseLeave={() => setHighlightedBarPesquisas(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="mes"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#6B7280",
                          fontFamily: "Inter, sans-serif"
                        }}
                        tickMargin={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                        tickFormatter={(value) => new Intl.NumberFormat("pt-BR").format(value)}
                        width={40}
                      />
                      <RechartsTooltip
                        cursor={false}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || payload.length === 0 || !highlightedBarPesquisas) return null;

                          // Usa o estado highlightedBarPesquisas para saber qual loja está sendo hovereada
                          const hoveredItem = payload.find(p => p.dataKey === highlightedBarPesquisas);
                          if (!hoveredItem || !hoveredItem.value || hoveredItem.value <= 0) return null;

                          // Cores das lojas (mesmo array usado nas barras)
                          const colors = ["#8B5CF6", "#EC4899", "#10B981", "#3B82F6", "#F59E0B"];
                          const lojaIndex = lojasPesquisas.indexOf(highlightedBarPesquisas);
                          const lojaColor = colors[lojaIndex % colors.length];

                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
                              <p className="font-semibold mb-2 text-gray-900">
                                {label ? String(label).charAt(0).toUpperCase() + String(label).slice(1) : ""}
                              </p>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: lojaColor }}
                                />
                                <span className="text-gray-800">
                                  Loja {highlightedBarPesquisas.replace(/Loja/g, '').trim()}: {new Intl.NumberFormat("pt-BR").format(hoveredItem.value as number)}
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={80}
                        content={({ payload }) => (
                          <ul className="flex flex-wrap justify-center gap-3 px-4">
                            {payload?.map((entry, index) => {
                              const color = ["#8B5CF6", "#EC4899", "#10B981", "#3B82F6", "#F59E0B"][index % 5];
                              const isHovered = highlightedBarPesquisas === entry.value;
                              const isActive = highlightedBarPesquisas === null || isHovered;

                              return (
                                <li
                                  key={`legend-${index}`}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 ${isActive ? "bg-gray-50" : "opacity-40"}`}
                                  onMouseEnter={() => setHighlightedBarPesquisas(entry.value as string)}
                                  onMouseLeave={() => setHighlightedBarPesquisas(null)}
                                  style={{
                                    cursor: "pointer",
                                    transform: isHovered ? "translateY(-1px)" : "none",
                                    boxShadow: isHovered ? "0 2px 8px rgba(0,0,0,0.08)" : "none"
                                  }}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${isActive ? "" : "opacity-40"}`}
                                    style={{ backgroundColor: color }}
                                  />
                                  <span
                                    className={`text-xs font-semibold transition-all duration-200 ${isActive ? "text-gray-900" : "text-gray-500 opacity-40"}`}
                                  >
                                    Loja {entry.value?.replace(/Loja/g, '') || ''}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      />

                      {lojasPesquisas.map((loja, index) => {
                        // Cores diferentes para cada loja
                        const colors = ["#8B5CF6", "#EC4899", "#10B981", "#3B82F6", "#F59E0B"];
                        const color = colors[index % colors.length];
                        const isHighlighted = highlightedBarPesquisas === null || highlightedBarPesquisas === loja;

                        return (
                          <Bar
                            key={loja}
                            dataKey={loja}
                            fill={color}
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                            onMouseEnter={() => setHighlightedBarPesquisas(loja)}
                            onMouseLeave={() => setHighlightedBarPesquisas(null)}
                            style={{
                              opacity: isHighlighted ? 1 : 0.3,
                              transition: "opacity 0.2s ease-in-out"
                            }}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>



          {/* gráfico - Cashbacks DETALHADO */}
          <div className="col-span-full flex justify-center mt-6 px-4">
            <Card className="border-0 shadow-sm w-full">
              <CardHeader className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-black">Cashbacks DETALHADO - Últimos 6 Meses</CardTitle>
                    <CardDescription className="text-gray-500">Análise detalhada dos cashbacks enviados por loja nos últimos 6 meses</CardDescription>
                  </div>
                  <CashbackDetalhadoExcelExportButton
                    graphData={cashbackTemTotalData}
                    lojas={cashbackTemTotalLojas}
                    title="Cashbacks DETALHADO - Últimos 6 Meses"
                    isLoading={isLoadingCashback}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center">
                <div className="h-96 w-full flex">
                  {/* Legenda lateral diné¢mica */}
                  <div className="w-20 flex flex-col justify-start space-y-2 mr-4 pt-1">
                    {(() => {
                      // Filtra apenas lojas que téªm dados no gráfico
                      const lojasComDados = cashbackTemTotalLojas.filter(loja => {
                        const lojaKey = `loja${loja}`;
                        return cashbackTemTotalData.some(dataItem =>
                          dataItem[lojaKey] && typeof dataItem[lojaKey] === "number" && dataItem[lojaKey] > 0
                        );
                      });

                      return lojasComDados.slice(0, 10).map((loja, index) => {
                        const colors = [
                          "bg-blue-500", "bg-blue-400", "bg-blue-300", "bg-green-500", "bg-green-400",
                          "bg-green-300", "bg-orange-500", "bg-orange-400", "bg-purple-500", "bg-purple-400"
                        ];
                        const lojaKey = `loja${loja}`;
                        const isHovered = hoveredLojaCashback === lojaKey;
                        const isActive = hoveredLojaCashback === null || isHovered;

                        return (
                          <div
                            key={loja}
                            className={`flex items-center space-x-2 p-1 rounded cursor-pointer transition-all duration-200 ${isActive ? "bg-gray-50" : "opacity-40"}`}
                            onMouseEnter={() => setHoveredLojaCashback(lojaKey)}
                            onMouseLeave={() => setHoveredLojaCashback(null)}
                            style={{
                              transform: isHovered ? "translateY(-1px)" : "none",
                              boxShadow: isHovered ? "0 2px 8px rgba(0,0,0,0.08)" : "none"
                            }}
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${colors[index % colors.length]} transition-all duration-200`}
                              style={{
                                opacity: isActive ? 1 : 0.5,
                                transform: isHovered ? "scale(1.1)" : "scale(1)"
                              }}
                            ></div>
                            <span className={`text-xs transition-all duration-200 ${isActive ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                              {loja}
                            </span>
                          </div>
                        );
                      });
                    })()}
                    {(() => {
                      // Mesma lógica de filtro para o boté£o "Ver mais"
                      const lojasComDados = cashbackTemTotalLojas.filter(loja => {
                        const lojaKey = `loja${loja}`;
                        return cashbackTemTotalData.some(dataItem =>
                          dataItem[lojaKey] && typeof dataItem[lojaKey] === "number" && dataItem[lojaKey] > 0
                        );
                      });

                      return lojasComDados.length > 10 && (
                        <div className="relative popup-lojas-container">
                          <button
                            onClick={() => {
                              setShowMoreLojas(!showMoreLojas);
                              setCurrentPageLojas(0); // Reset para primeira pégina
                            }}
                            className="text-xs text-blue-500 mt-2 hover:text-blue-700 cursor-pointer transition-colors"
                          >
                            Ver mais
                          </button>

                          {/* Pop-up que desce verticalmente com paginação */}
                          {showMoreLojas && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[160px] animate-in slide-in-from-top-2 duration-200">
                              <div className="text-xs font-medium text-gray-700 mb-2">Outras lojas:</div>

                              {/* Lojas da pégina atual (3 por pégina) */}
                              <div className="space-y-1 mb-3">
                                {lojasComDados.slice(10).slice(currentPageLojas * 3, (currentPageLojas * 3) + 3).map((loja, index) => {
                                  const colors = [
                                    "bg-red-500", "bg-red-400", "bg-yellow-500", "bg-yellow-400", "bg-indigo-500",
                                    "bg-indigo-400", "bg-pink-500", "bg-pink-400", "bg-teal-500", "bg-teal-400"
                                  ];
                                  const globalIndex = (currentPageLojas * 3) + index;
                                  return (
                                    <div key={loja} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors">
                                      <div className={`w-2 h-2 rounded-full ${colors[globalIndex % colors.length]}`}></div>
                                      <span className="text-xs text-gray-600">{loja}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Navegação simplificada */}
                              {lojasComDados.slice(10).length > 3 && (
                                <div className="flex items-center justify-center space-x-3 border-t border-gray-100 pt-2">
                                  <button
                                    onClick={() => setCurrentPageLojas(Math.max(0, currentPageLojas - 1))}
                                    disabled={currentPageLojas === 0}
                                    className="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                  </button>

                                  <span className="text-xs text-gray-600 font-medium">
                                    {currentPageLojas + 1} / {Math.ceil(lojasComDados.slice(10).length / 3)}
                                  </span>

                                  <button
                                    onClick={() => setCurrentPageLojas(Math.min(Math.ceil(lojasComDados.slice(10).length / 3) - 1, currentPageLojas + 1))}
                                    disabled={currentPageLojas >= Math.ceil(lojasComDados.slice(10).length / 3) - 1}
                                    className="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* gráfico */}
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cashbackTemTotalData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 60,
                          bottom: 60,
                        }}
                        barGap={2}
                        barCategoryGap="15%"
                        onMouseLeave={() => setHoveredLojaCashback(null)}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="mes"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                          tickMargin={8}
                          height={40}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                          tickFormatter={(value) => new Intl.NumberFormat("pt-BR").format(value)}
                          width={60}
                          label={{
                            value: "Contagem",
                            angle: -90,
                            position: "outside",
                            fontSize: 16,
                            fill: "#000000",
                            fontFamily: "Inter, sans-serif",
                            style: { textAnchor: "middle" },
                            dx: -50,
                            dy: 0
                          }}
                        />
                        <RechartsTooltip
                          cursor={{ fill: "rgba(0,0,0,0.05)" }}
                          content={({ active, payload, label }) => {
                            // Só mostra o tooltip se estiver sobre uma barra especé­fica
                            if (!active || !payload || payload.length === 0 || !hoveredLojaCashback) return null;

                            // Filtra apenas o item da loja em destaque
                            const item = payload.find(p => p.dataKey === hoveredLojaCashback);
                            if (!item || !item.value) return null;

                            const color = item.color || "#8B5CF6";
                            const lojaName = item.name || hoveredLojaCashback.replace("loja", "Loja ");

                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-medium">
                                  <span className="text-black">{lojaName}</span>
                                </p>
                                <p className="text-sm text-gray-700 mt-1">mês: {label}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm text-gray-700">
                                    Total:
                                  </span>
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color }}
                                  >
                                    {new Intl.NumberFormat("pt-BR").format(Number(item.value))}
                                  </span>
                                </div>
                              </div>
                            );
                          }}
                        />

                        {/* Barra de destaque (azul alta) */}
                        <Bar dataKey="destaque" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={8} name="Destaque" />

                        {/* Barras das lojas com efeito de opacidade */}
                        <Bar
                          dataKey="loja0"
                          fill="#8B5CF6"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 0"
                          onMouseEnter={() => setHoveredLojaCashback("loja0")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja0" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja1"
                          fill="#60A5FA"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 1"
                          onMouseEnter={() => setHoveredLojaCashback("loja1")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja1" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja10"
                          fill="#A78BFA"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 10"
                          onMouseEnter={() => setHoveredLojaCashback("loja10")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja10" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja11"
                          fill="#F472B6"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 11"
                          onMouseEnter={() => setHoveredLojaCashback("loja11")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja11" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja12"
                          fill="#6366F1"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 12"
                          onMouseEnter={() => setHoveredLojaCashback("loja12")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja12" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja13"
                          fill="#7C3AED"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 13"
                          onMouseEnter={() => setHoveredLojaCashback("loja13")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja13" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja14"
                          fill="#C084FC"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 14"
                          onMouseEnter={() => setHoveredLojaCashback("loja14")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja14" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja15"
                          fill="#4F46E5"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 15"
                          onMouseEnter={() => setHoveredLojaCashback("loja15")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja15" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                        <Bar
                          dataKey="loja16"
                          fill="#818CF8"
                          radius={[6, 6, 0, 0]}
                          barSize={10}
                          name="Loja 16"
                          onMouseEnter={() => setHoveredLojaCashback("loja16")}
                          onMouseLeave={() => setHoveredLojaCashback(null)}
                          style={{
                            opacity: hoveredLojaCashback === null || hoveredLojaCashback === "loja16" ? 1 : 0.3,
                            transition: "opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* gráfico de Envio de Aniversários */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Relatório de Envio de Aniversários - GERAIS</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Últimos 6 Meses
                    </CardDescription>
                  </div>
                  <AniversariosGeraisExcelExportButton
                    graphData={birthdayReportData}
                    title="Relatório de Envio de Aniversários - GERAIS"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {birthdayReportData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">Nenhum dado de aniversério encontrado</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={birthdayReportData.map(item => ({ name: item.name, valor: item.valor }))}
                        margin={{ top: 20, right: 30, left: 80, bottom: 60 }}
                        barCategoryGap="40%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                          height={60}
                          interval={0}
                          angle={0}
                          textAnchor="middle"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                          tickFormatter={(value) => new Intl.NumberFormat("pt-BR").format(value)}
                          width={60}
                          label={{
                            value: "Quantidade de Envios",
                            angle: -90,
                            position: "outside",
                            fontSize: 16,
                            fill: "#000000",
                            fontFamily: "Inter, sans-serif",
                            style: { textAnchor: "middle" },
                            dx: -50,
                            dy: 0
                          }}
                        />
                        <RechartsTooltip
                          cursor={{ fill: "rgba(0,0,0,0.05)" }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null;

                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-medium text-gray-900 mb-2">Loja {label}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700 flex items-center">
                                    <div
                                      className="w-3 h-3 rounded mr-2"
                                      style={{ backgroundColor: "#8B5CF6" }}
                                    />
                                    Aniversários enviados:
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 ml-2">
                                    {new Intl.NumberFormat("pt-BR").format(Number(payload[0]?.value || 0))}
                                  </span>
                                </div>
                              </div>
                            );
                          }}
                        />

                        <Bar
                          dataKey="valor"
                          fill="#8B5CF6"
                          radius={[8, 8, 0, 0]}
                          name="Aniversários Enviados"
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Informações adicionais */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: "#8B5CF6" }}></div>
                      <span className="text-sm text-gray-700">Aniversários Enviados</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Total: {new Intl.NumberFormat("pt-BR").format(
                          birthdayReportData.reduce((sum, item) => sum + item.valor, 0)
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {birthdayReportData.length} {birthdayReportData.length === 1 ? "loja" : "lojas"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* gráfico de Envio de Aniversários - Exatamente como na imagem */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Envio de Aniversários - DETALHADO</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Últimos 6 Meses - Análise detalhada dos envios de aniversários por loja e período
                    </CardDescription>
                  </div>
                  <AniversariosDetalhadoExcelExportButton
                    graphData={detailedBirthdayReportData}
                    lojas={birthdayDetailedLojas}
                    title="Envio de Aniversários - DETALHADO"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex mt-6">
                  {/* Legenda no lado esquerdo - exatamente como na imagem */}
                  <div className="w-20 flex-shrink-0 mr-4">
                    <div className="space-y-5">
                      {birthdayDetailedLojas.slice(0, 9).map((loja, index) => {
                        const isHighlighted = highlightedBirthdayLoja === null || highlightedBirthdayLoja === loja;

                        return (
                          <div
                            key={loja}
                            className="flex items-center cursor-pointer p-1 rounded transition-colors hover:bg-gray-50"
                            onMouseEnter={() => setHighlightedBirthdayLoja(loja)}
                            onMouseLeave={() => setHighlightedBirthdayLoja(null)}
                          >
                            <div
                              className="w-3 h-3 rounded-full mr-2 transition-opacity duration-200"
                              style={{
                                backgroundColor: lojaColors[index % lojaColors.length],
                                opacity: isHighlighted ? 1 : 0.3
                              }}
                            />
                            <span className={`text-xs transition-all duration-200 ${isHighlighted ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                              {loja}
                            </span>
                          </div>
                        );
                      })}
                      {birthdayDetailedLojas.length > 9 && (
                        <div className="relative popup-birthday-lojas-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoreBirthdayLojas(!showMoreBirthdayLojas);
                              setCurrentBirthdayPage(0);
                            }}
                            className="text-xs text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                          >
                            {showMoreBirthdayLojas ? "Ver menos" : "Ver mais"}
                          </button>

                          {showMoreBirthdayLojas && (
                            <div
                              className="absolute z-10 left-0 top-full mt-1 py-2 bg-white rounded-md shadow-lg border border-gray-200 flex items-center"
                            >
                              {/* Seta esquerda */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentBirthdayPage(Math.max(0, currentBirthdayPage - 1));
                                }}
                                disabled={currentBirthdayPage === 0}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                              </button>

                              {/* Lojas (méximo 3) */}
                              <div className="flex">
                                {birthdayDetailedLojas.slice(9).slice(currentBirthdayPage * 3, (currentBirthdayPage * 3) + 3).map((loja, index) => (
                                  <div
                                    key={`more-${index}`}
                                    className="flex-shrink-0 flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{ backgroundColor: lojaColors[(9 + currentBirthdayPage * 3 + index) % lojaColors.length] }}
                                    />
                                    <span className="text-xs whitespace-nowrap text-gray-600">{loja}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Seta direita */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const maxPages = Math.ceil((birthdayDetailedLojas.length - 9) / 3);
                                  setCurrentBirthdayPage(Math.min(maxPages - 1, currentBirthdayPage + 1));
                                }}
                                disabled={currentBirthdayPage >= Math.ceil((birthdayDetailedLojas.length - 9) / 3) - 1}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* gráfico principal */}
                  <div className="flex-1">
                    {detailedBirthdayReportData.length === 0 ? (
                      <div className="h-[28rem] flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Nenhum dado encontrado</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[28rem]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={detailedBirthdayReportData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            barCategoryGap="20%"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                              dataKey="mes"
                              tick={{ fontSize: 10, fill: "#6B7280" }}
                              height={60}
                              interval={0}
                              angle={0}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: "#6B7280" }}
                              tickFormatter={(value) => value.toString()}
                              width={40}
                              label={{
                                value: "Contagem",
                                angle: -90,
                                position: "insideLeft",
                                fontSize: 12,
                                fill: "#6B7280"
                              }}
                            />
                            <RechartsTooltip
                              cursor={{ fill: "rgba(0,0,0,0.05)" }}
                              content={({ active, payload, label }) => {
                                if (!active || !payload || payload.length === 0) return null;

                                // Só mostra tooltip se hé uma loja destacada
                                if (!highlightedBirthdayLoja) return null;

                                // Filtra apenas o item que esté sendo destacado
                                const targetPayload = payload.find(p => p.dataKey === highlightedBirthdayLoja && p.value && p.value > 0);

                                if (!targetPayload) return null;

                                return (
                                  <div className="bg-white p-2 rounded shadow-lg border text-xs text-black">
                                    <p className="font-medium mb-1 text-black">
                                      {label ? String(label).charAt(0).toUpperCase() + String(label).slice(1) : ""}
                                    </p>
                                    <div className="flex items-center">
                                      <div
                                        className="w-2 h-2 rounded-full mr-1"
                                        style={{ backgroundColor: targetPayload.color }}
                                      />
                                      <span className="text-black">Loja {targetPayload.dataKey}: {targetPayload.value}</span>
                                    </div>
                                  </div>
                                );
                              }}
                            />

                            {/* Barras dinâmicas para cada loja */}
                            {birthdayDetailedLojas.map((loja, index) => (
                              <Bar
                                key={loja}
                                dataKey={loja}
                                fill={lojaColors[index % lojaColors.length]}
                                radius={[4, 4, 0, 0]}
                                barSize={12}
                                onMouseEnter={() => setHighlightedBirthdayLoja(loja)}
                                onMouseLeave={() => setHighlightedBirthdayLoja(null)}
                                style={{
                                  opacity: highlightedBirthdayLoja === null || highlightedBirthdayLoja === loja ? 1 : 0.3,
                                  transition: "opacity 0.2s ease-in-out"
                                }}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* "Criado Em" na parte inferior - exatamente como na imagem */}
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-400">Criado Em</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* gráfico de Respostas Pesquisas */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Respostas Pesquisas</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Classificação das respostas de pesquisas por loja
                    </CardDescription>
                  </div>
                  <RespostasPesquisasExcelExportButton
                    graphData={respostasPesquisasData}
                    title="Respostas Pesquisas"
                    isLoading={isLoadingRespostasPesquisas}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Ótimo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Bom</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-sm text-gray-600">Regular</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Péssimo</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRespostasPesquisas ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Carregando respostas...</p>
                    </div>
                  </div>
                ) : respostasPesquisasError ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-red-500 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-red-600 font-medium mb-2">Erro ao carregar dados</p>
                      <p className="text-sm text-gray-600 mb-4">{respostasPesquisasError}</p>
                      <button
                        onClick={() => fetchRespostasPesquisasData()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                ) : respostasPesquisasData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Nenhuma resposta de pesquisa encontrada</p>
                      <p className="text-sm text-gray-400 mt-1">Os dados aparecerão aqui quando houver respostas</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={respostasPesquisasData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="loja"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                          domain={[0, 2100]}
                          ticks={[0, 300, 600, 900, 1200, 1500, 1800, 2100]}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                  <p className="font-medium text-gray-900 mb-2">Loja {label}</p>
                                  {payload.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                      ></div>
                                      <span style={{ color: entry.color }} className="font-medium">
                                        {entry.dataKey}: {entry.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Bar dataKey="Ótimo" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="Bom" fill="#22c55e" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="Regular" fill="#facc15" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="Péssimo" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Label "Loja" na parte inferior */}
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500">Loja</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}





