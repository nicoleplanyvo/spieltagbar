"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { reservierungen: number; bewertungen: number };
}

const roleColors: Record<string, string> = {
  FAN: "bg-blue-100 text-blue-800",
  BAR_OWNER: "bg-amber-100 text-amber-800",
  ADMIN: "bg-red-100 text-red-800",
};

const roleLabels: Record<string, string> = {
  FAN: "Fan",
  BAR_OWNER: "Bar-Owner",
  ADMIN: "Admin",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch {
      console.error("Fehler beim Laden der Nutzer");
    }
    setLoading(false);
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function changeRole(userId: string, newRole: string) {
    setChangingRole(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Ändern der Rolle");
      }
    } catch {
      alert("Netzwerkfehler");
    }
    setChangingRole(null);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
              NUTZERVERWALTUNG
            </h2>
            <p className="text-sm text-gray-500">{total} Nutzer insgesamt</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Name oder E-Mail suchen..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Alle Rollen</option>
              <option value="FAN">Fan</option>
              <option value="BAR_OWNER">Bar-Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabelle */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
            Nutzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Laden...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Keine Nutzer gefunden</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">E-Mail</th>
                    <th className="pb-3 font-medium">Rolle</th>
                    <th className="pb-3 font-medium text-center">Res.</th>
                    <th className="pb-3 font-medium text-center">Bew.</th>
                    <th className="pb-3 font-medium">Registriert</th>
                    <th className="pb-3 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-[#1A1A2E]">
                        {u.name || "—"}
                      </td>
                      <td className="py-3 text-gray-600">{u.email}</td>
                      <td className="py-3">
                        <Badge className={`text-xs ${roleColors[u.role]}`}>
                          {roleLabels[u.role] || u.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-center text-gray-600">
                        {u._count.reservierungen}
                      </td>
                      <td className="py-3 text-center text-gray-600">
                        {u._count.bewertungen}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("de-DE")}
                      </td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          disabled={changingRole === u.id}
                          className="h-8 rounded border border-gray-200 bg-white px-2 text-xs disabled:opacity-50"
                        >
                          <option value="FAN">Fan</option>
                          <option value="BAR_OWNER">Bar-Owner</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-xs text-gray-500">
                Seite {page + 1} von {totalPages} ({total} Nutzer)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
