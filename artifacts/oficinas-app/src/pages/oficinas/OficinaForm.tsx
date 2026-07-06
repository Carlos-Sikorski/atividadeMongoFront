import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateOficina, 
  useUpdateOficina, 
  useGetOficina,
  getListOficinasQueryKey,
  getGetOficinaQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  endereco: z.string().min(5, "O endereço deve ser preenchido"),
  especialidades: z.string().min(2, "Informe pelo menos uma especialidade (separadas por vírgula)"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OficinaForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  
  const isEditing = !!params.id;
  const oficinaId = isEditing ? parseInt(params.id as string, 10) : undefined;

  const { data: oficina, isLoading: isLoadingData } = useGetOficina(
    oficinaId as number,
    { query: { enabled: isEditing, queryKey: getGetOficinaQueryKey(oficinaId as number) } }
  );

  const createMutation = useCreateOficina();
  const updateMutation = useUpdateOficina();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      endereco: "",
      especialidades: "",
    },
  });

  useEffect(() => {
    if (oficina && isEditing) {
      form.reset({
        nome: oficina.nome,
        endereco: oficina.endereco,
        especialidades: oficina.especialidades,
      });
    }
  }, [oficina, isEditing, form]);

  const onSubmit = (data: FormValues) => {
    if (isEditing && oficinaId) {
      updateMutation.mutate({ id: oficinaId, data }, {
        onSuccess: () => {
          toast.success("Oficina atualizada com sucesso");
          queryClient.invalidateQueries({ queryKey: getListOficinasQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOficinaQueryKey(oficinaId) });
          setLocation("/oficinas");
        },
        onError: () => toast.error("Erro ao atualizar oficina")
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast.success("Oficina cadastrada com sucesso");
          queryClient.invalidateQueries({ queryKey: getListOficinasQueryKey() });
          setLocation("/oficinas");
        },
        onError: () => toast.error("Erro ao cadastrar oficina")
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
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/oficinas")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar Oficina" : "Nova Oficina"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Altere os dados da oficina selecionada." : "Preencha os dados para cadastrar uma nova oficina."}
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Oficina</FormLabel>
                    <FormControl>
                      <Input placeholder="Mecânica do João" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Principal, 1000 - Bairro, Cidade - Estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="especialidades"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidades</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Injeção Eletrônica, Freios, Suspensão" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Separe as especialidades por vírgula.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setLocation("/oficinas")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isPending ? "Salvando..." : "Salvar Oficina"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}