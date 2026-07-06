import { useState, useMemo } from "react";
import { Link } from "wouter";
import { 
  useListVeiculos, 
  useDeleteVeiculo, 
  getListVeiculosQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function VeiculosList() {
  const queryClient = useQueryClient();
  const { data: veiculos, isLoading } = useListVeiculos();
  const deleteMutation = useDeleteVeiculo();
  
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredVeiculos = useMemo(() => {
    if (!veiculos) return [];
    if (!search) return veiculos;
    
    const lowerSearch = search.toLowerCase();
    return veiculos.filter(
      v => 
        v.placa.toLowerCase().includes(lowerSearch) || 
        v.modelo.toLowerCase().includes(lowerSearch) || 
        v.proprietario.toLowerCase().includes(lowerSearch) ||
        v.ano.includes(search)
    );
  }, [veiculos, search]);

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast.success("Veículo excluído com sucesso");
        queryClient.invalidateQueries({ queryKey: getListVeiculosQueryKey() });
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Erro ao excluir veículo");
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Veículos</h1>
          <p className="text-muted-foreground text-sm">Gerencie os veículos de clientes.</p>
        </div>
        <Link href="/veiculos/novo">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo Veículo
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por placa, modelo, cliente..."
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[120px]">Placa</TableHead>
                  <TableHead>Modelo / Ano</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead className="text-right w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredVeiculos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Nenhum veículo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVeiculos.map((veiculo) => (
                    <TableRow key={veiculo.id} className="group transition-colors hover:bg-muted/20">
                      <TableCell className="font-medium font-mono text-xs">
                        <span className="px-2 py-1 bg-muted rounded border border-border/50">{veiculo.placa}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{veiculo.modelo}</span>
                        <span className="text-muted-foreground ml-2 text-sm">{veiculo.ano}</span>
                      </TableCell>
                      <TableCell className="text-foreground">{veiculo.proprietario}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <Link href={`/veiculos/${veiculo.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/veiculos/${veiculo.id}/editar`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-indigo-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(veiculo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o veículo e todo o seu histórico de manutenções.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}