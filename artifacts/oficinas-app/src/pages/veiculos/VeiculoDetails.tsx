import { useParams, Link } from "wouter";
import { useGetVeiculo, getGetVeiculoQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, User, Calendar, Wrench, PenTool } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VeiculoDetails() {
  const params = useParams();
  const veiculoId = parseInt(params.id as string, 10);

  const { data: veiculo, isLoading, error } = useGetVeiculo(veiculoId, {
    query: { enabled: !!veiculoId, queryKey: getGetVeiculoQueryKey(veiculoId) }
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

  if (error || !veiculo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive">Erro ao carregar veículo</h2>
        <Link href="/veiculos">
          <Button className="mt-4" variant="outline">Voltar para a lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/veiculos">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{veiculo.modelo}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-mono bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                {veiculo.placa}
              </span>
              <span>•</span>
              {veiculo.ano}
            </p>
          </div>
        </div>
        <Link href={`/veiculos/${veiculo.id}/editar`}>
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
                <User className="h-4 w-4 mr-2" />
                Proprietário
              </div>
              <p className="font-medium text-foreground">{veiculo.proprietario}</p>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center text-muted-foreground mb-1.5 font-medium">
                <Wrench className="h-4 w-4 mr-2" />
                Oficina Vinculada
              </div>
              {veiculo.oficinaId ? (
                <Link href={`/oficinas/${veiculo.oficinaId}`} className="font-medium text-primary hover:underline">
                  Ver Oficina (ID: {veiculo.oficinaId})
                </Link>
              ) : (
                <p className="text-muted-foreground italic">Sem oficina vinculada</p>
              )}
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center text-muted-foreground mb-1.5 font-medium">
                <Calendar className="h-4 w-4 mr-2" />
                Cadastrado em
              </div>
              <p className="font-medium">
                {format(new Date(veiculo.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  Histórico de Manutenções
                </CardTitle>
                <CardDescription>
                  Registro de serviços realizados neste veículo.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Oficina</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!veiculo.manutencoes || veiculo.manutencoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Nenhuma manutenção registrada para este veículo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    veiculo.manutencoes.map((manutencao) => (
                      <TableRow key={manutencao.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium">
                          {format(new Date(manutencao.data), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {manutencao.descricao}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {manutencao.oficinaNome || "Oficina não identificada"}
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