import { useParams, Link } from "wouter";
import { useGetOficina, getGetOficinaQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, MapPin, Wrench, Calendar, Car } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OficinaDetails() {
  const params = useParams();
  const oficinaId = parseInt(params.id as string, 10);

  const { data: oficina, isLoading, error } = useGetOficina(oficinaId, {
    query: { enabled: !!oficinaId, queryKey: getGetOficinaQueryKey(oficinaId) }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-40" />
        <Card><CardContent className="h-40" /></Card>
        <Card><CardContent className="h-64" /></Card>
      </div>
    );
  }

  if (error || !oficina) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive">Erro ao carregar oficina</h2>
        <Link href="/oficinas">
          <Button className="mt-4" variant="outline">Voltar para a lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/oficinas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{oficina.nome}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {oficina.endereco}
            </p>
          </div>
        </div>
        <Link href={`/oficinas/${oficina.id}/editar`}>
          <Button variant="secondary" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div>
              <div className="flex items-center text-muted-foreground mb-1.5 font-medium">
                <Wrench className="h-4 w-4 mr-2" />
                Especialidades
              </div>
              <div className="flex flex-wrap gap-1.5">
                {oficina.especialidades.split(',').map((esp, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {esp.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center text-muted-foreground mb-1.5 font-medium">
                <Calendar className="h-4 w-4 mr-2" />
                Cadastrada em
              </div>
              <p className="font-medium">
                {format(new Date(oficina.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center text-muted-foreground mb-1.5 font-medium">
                <Car className="h-4 w-4 mr-2" />
                Total de Veículos Atendidos
              </div>
              <p className="font-medium text-2xl">
                {oficina.veiculos?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Veículos Vinculados</CardTitle>
            <CardDescription>
              Veículos que estão registrados para atendimento nesta oficina.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!oficina.veiculos || oficina.veiculos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum veículo vinculado a esta oficina.
                      </TableCell>
                    </TableRow>
                  ) : (
                    oficina.veiculos.map((veiculo) => (
                      <TableRow key={veiculo.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium font-mono text-xs">
                          <span className="px-2 py-1 bg-muted rounded border border-border">{veiculo.placa}</span>
                        </TableCell>
                        <TableCell>
                          {veiculo.modelo} <span className="text-muted-foreground text-xs">({veiculo.ano})</span>
                        </TableCell>
                        <TableCell>{veiculo.proprietario}</TableCell>
                        <TableCell className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/veiculos/${veiculo.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}