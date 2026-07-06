import { useState, useMemo } from "react";
import { Link } from "wouter";
import { 
  useListOficinas, 
  useDeleteOficina, 
  getListOficinasQueryKey 
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

export default function OficinasList() {
  const queryClient = useQueryClient();
  const { data: oficinas, isLoading } = useListOficinas();
  const deleteMutation = useDeleteOficina();
  
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredOficinas = useMemo(() => {
    if (!oficinas) return [];
    if (!search) return oficinas;
    
    const lowerSearch = search.toLowerCase();
    return oficinas.filter(
      o => 
        o.nome.toLowerCase().includes(lowerSearch) || 
        o.endereco.toLowerCase().includes(lowerSearch) || 
        o.especialidades.toLowerCase().includes(lowerSearch)
    );
  }, [oficinas, search]);

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast.success("Oficina excluída com sucesso");
        queryClient.invalidateQueries({ queryKey: getListOficinasQueryKey() });
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Erro ao excluir oficina");
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Oficinas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as oficinas cadastradas no sistema.</p>
        </div>
        <Link href="/oficinas/nova">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Nova Oficina
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
                placeholder="Buscar oficinas..."
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
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead className="text-right w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-60" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOficinas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Nenhuma oficina encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOficinas.map((oficina) => (
                    <TableRow key={oficina.id} className="group transition-colors hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">{oficina.nome}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[300px]" title={oficina.endereco}>
                        {oficina.endereco}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {oficina.especialidades.split(',').map((esp, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              {esp.trim()}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <Link href={`/oficinas/${oficina.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/oficinas/${oficina.id}/editar`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-indigo-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(oficina.id)}
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
            <AlertDialogTitle>Excluir Oficina?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a oficina e todos os dados associados.
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