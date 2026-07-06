import { useGetDashboardStats, useGetVeiculosPorAno, useListVeiculos } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Car, PenTool } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetVeiculosPorAno();
  const { data: veiculos, isLoading: veiculosLoading } = useListVeiculos();

  const recentVeiculos = veiculos?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de oficinas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-border/50 hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Oficinas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.totalOficinas || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Veículos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.totalVeiculos || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover-elevate transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Manutenções</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <PenTool className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold">{stats?.totalManutencoes || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Veículos por Ano</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="ano" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-md)'
                      }} 
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Veículos Recentes</CardTitle>
            <Link href="/veiculos" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {veiculosLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentVeiculos.length > 0 ? (
              <div className="space-y-4">
                {recentVeiculos.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-transparent hover:border-border transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{v.modelo} ({v.ano})</span>
                      <span className="text-xs text-muted-foreground">{v.proprietario} • {v.placa}</span>
                    </div>
                    <Link href={`/veiculos/${v.id}`}>
                      <Button variant="ghost" size="sm" className="h-8">Detalhes</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum veículo cadastrado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}