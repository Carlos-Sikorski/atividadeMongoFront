import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateVeiculo, 
  useUpdateVeiculo, 
  useGetVeiculo,
  useListOficinas,
  getListVeiculosQueryKey,
  getGetVeiculoQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  placa: z.string().min(7, "Placa inválida").max(8),
  modelo: z.string().min(2, "Modelo é obrigatório"),
  ano: z.string().min(4, "Ano inválido").max(4),
  proprietario: z.string().min(3, "Nome do proprietário é obrigatório"),
  oficinaId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VeiculoForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  
  const isEditing = !!params.id;
  const veiculoId = isEditing ? parseInt(params.id as string, 10) : undefined;

  const { data: veiculo, isLoading: isLoadingData } = useGetVeiculo(
    veiculoId as number,
    { query: { enabled: isEditing, queryKey: getGetVeiculoQueryKey(veiculoId as number) } }
  );

  const { data: oficinas, isLoading: isLoadingOficinas } = useListOficinas();

  const createMutation = useCreateVeiculo();
  const updateMutation = useUpdateVeiculo();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: "",
      modelo: "",
      ano: "",
      proprietario: "",
      oficinaId: null,
    },
  });

  useEffect(() => {
    if (veiculo && isEditing) {
      form.reset({
        placa: veiculo.placa,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        proprietario: veiculo.proprietario,
        oficinaId: veiculo.oficinaId ? veiculo.oficinaId.toString() : null,
      });
    }
  }, [veiculo, isEditing, form]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      oficinaId: data.oficinaId && data.oficinaId !== "none" ? parseInt(data.oficinaId, 10) : null,
    };

    if (isEditing && veiculoId) {
      updateMutation.mutate({ id: veiculoId, data: payload }, {
        onSuccess: () => {
          toast.success("Veículo atualizado com sucesso");
          queryClient.invalidateQueries({ queryKey: getListVeiculosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetVeiculoQueryKey(veiculoId) });
          setLocation("/veiculos");
        },
        onError: () => toast.error("Erro ao atualizar veículo")
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success("Veículo cadastrado com sucesso");
          queryClient.invalidateQueries({ queryKey: getListVeiculosQueryKey() });
          setLocation("/veiculos");
        },
        onError: () => toast.error("Erro ao cadastrar veículo")
      });
    }
  };

  if (isEditing && isLoadingData) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-40" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/veiculos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar Veículo" : "Novo Veículo"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Altere os dados do veículo selecionado." : "Preencha os dados para cadastrar um novo veículo."}
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" className="uppercase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input placeholder="2022" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Honda Civic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proprietario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proprietário</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do proprietário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oficinaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oficina Vinculada (Opcional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      disabled={isLoadingOficinas}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma oficina..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="text-muted-foreground">Sem oficina vinculada</SelectItem>
                        {oficinas?.map(oficina => (
                          <SelectItem key={oficina.id} value={oficina.id.toString()}>
                            {oficina.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setLocation("/veiculos")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isPending ? "Salvando..." : "Salvar Veículo"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}