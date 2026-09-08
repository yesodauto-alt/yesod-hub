import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Save, ShieldCheck, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

type Organization = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

type OrganizationMember = {
  id: string;
  organization_id: string;
  email: string;
  active: boolean;
  user_id: string | null;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function OrganizationAccessCenter() {
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [savingMember, setSavingMember] = useState(false);

  const organizationsQuery = useQuery({
    queryKey: ["client-organizations", "admin"],
    queryFn: async () => {
      const { data, error } = await db
        .from("organizations")
        .select("id,name,slug,active")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Organization[];
    },
  });

  const membersQuery = useQuery({
    queryKey: ["organization-members", selectedOrganizationId],
    enabled: Boolean(selectedOrganizationId),
    queryFn: async () => {
      const { data, error } = await db
        .from("organization_members")
        .select("id,organization_id,email,active,user_id")
        .eq("organization_id", selectedOrganizationId)
        .order("email");
      if (error) throw error;
      return (data ?? []) as OrganizationMember[];
    },
  });

  const organizations = organizationsQuery.data ?? [];
  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === selectedOrganizationId) ?? null,
    [organizations, selectedOrganizationId],
  );

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name) {
      toast.error("Informe o nome da organização.");
      return;
    }
    const slug = slugify(name);
    if (!slug) {
      toast.error("Não foi possível gerar um identificador para a organização.");
      return;
    }

    setSavingOrganization(true);
    const { data, error } = await db
      .from("organizations")
      .insert({ name, slug, active: true })
      .select("id,name,slug,active")
      .single();
    setSavingOrganization(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setOrganizationName("");
    setSelectedOrganizationId(data.id);
    await queryClient.invalidateQueries({ queryKey: ["client-organizations"] });
    toast.success("Organização criada.");
  }

  async function addMember() {
    if (!selectedOrganizationId) {
      toast.error("Selecione uma organização.");
      return;
    }
    const email = memberEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    setSavingMember(true);
    const { error } = await db.from("organization_members").insert({
      organization_id: selectedOrganizationId,
      email,
      active: true,
    });
    setSavingMember(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setMemberEmail("");
    await queryClient.invalidateQueries({ queryKey: ["organization-members", selectedOrganizationId] });
    toast.success("Acesso autorizado.");
  }

  async function toggleOrganization(organization: Organization, active: boolean) {
    const { error } = await db.from("organizations").update({ active }).eq("id", organization.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["client-organizations"] });
    toast.success(active ? "Organização ativada." : "Organização desativada.");
  }

  async function toggleMember(member: OrganizationMember, active: boolean) {
    const { error } = await db.from("organization_members").update({ active }).eq("id", member.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["organization-members", selectedOrganizationId] });
    toast.success(active ? "Acesso reativado." : "Acesso revogado.");
  }

  return (
    <section className="mt-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d75a12]">Administração</p>
        <h2 className="mt-2 text-2xl font-bold">Clientes e acessos</h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Crie organizações, autorize e-mails e controle quem pode acessar os conteúdos privados de cada cliente.
        </p>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#d75a12]" />
              <h3 className="text-lg font-bold">Organizações</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Nome do cliente / organização</Label>
              <div className="flex gap-2">
                <Input
                  id="organization-name"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder="Ex.: Empresa XYZ"
                />
                <Button onClick={createOrganization} disabled={savingOrganization}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {organizations.map((organization) => (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => setSelectedOrganizationId(organization.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${selectedOrganizationId === organization.id ? "border-[#e86f22] bg-orange-50" : "border-border bg-white hover:bg-muted/40"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{organization.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{organization.slug}</p>
                    </div>
                    <Checkbox
                      checked={organization.active}
                      onCheckedChange={(checked) => void toggleOrganization(organization, checked === true)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={organization.active ? "Desativar organização" : "Ativar organização"}
                    />
                  </div>
                </button>
              ))}
              {!organizationsQuery.isLoading && organizations.length === 0 && (
                <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Nenhuma organização cadastrada.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#d75a12]" />
              <div>
                <h3 className="text-lg font-bold">Acessos autorizados</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedOrganization ? selectedOrganization.name : "Selecione uma organização"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedOrganization ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="member-email">E-mail autorizado</Label>
                  <div className="flex gap-2">
                    <Input
                      id="member-email"
                      type="email"
                      value={memberEmail}
                      onChange={(event) => setMemberEmail(event.target.value)}
                      placeholder="cliente@empresa.com.br"
                    />
                    <Button onClick={addMember} disabled={savingMember}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Liberar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se a pessoa ainda não tiver conta, o vínculo será feito automaticamente quando ela se cadastrar com este e-mail.
                  </p>
                </div>

                <div className="space-y-2">
                  {(membersQuery.data ?? []).map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{member.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {member.user_id ? "Conta vinculada" : "Aguardando cadastro"}
                        </p>
                      </div>
                      <label className="flex shrink-0 items-center gap-2 text-sm">
                        <Checkbox checked={member.active} onCheckedChange={(checked) => void toggleMember(member, checked === true)} />
                        {member.active ? "Ativo" : "Revogado"}
                      </label>
                    </div>
                  ))}
                  {!membersQuery.isLoading && (membersQuery.data ?? []).length === 0 && (
                    <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Nenhum e-mail autorizado nesta organização.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Selecione uma organização para gerenciar os acessos.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
