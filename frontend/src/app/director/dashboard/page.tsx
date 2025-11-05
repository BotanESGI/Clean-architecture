"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
  accountIds: string[];
};

export default function DirectorDashboardPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Vérifier le rôle au chargement
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const role = decodeRole(token);
    if (role !== "director") {
      show("Accès refusé. Réservé aux directeurs.", "error");
      router.push("/dashboard");
      return;
    }

    loadClients();
  }, [token, router]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/director/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des clients");
      }

      const data = await response.json();
      setClients(data);
    } catch (err: any) {
      show(err.message || "Erreur lors du chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir bannir ce client ?")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/director/clients/${clientId}/ban`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      show("Client banni avec succès", "success");
      await loadClients();
    } catch (err: any) {
      show(err.message || "Erreur lors du bannissement", "error");
    }
  };

  const handleUnban = async (clientId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/director/clients/${clientId}/unban`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      show("Client débanni avec succès", "success");
      await loadClients();
    } catch (err: any) {
      show(err.message || "Erreur lors du débannissement", "error");
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ? Tous ses comptes seront supprimés.")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/director/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      show("Client supprimé avec succès", "success");
      await loadClients();
    } catch (err: any) {
      show(err.message || "Erreur lors de la suppression", "error");
    }
  };

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            <span className="text-primary">Espace Directeur</span>
          </h1>
          <p className="text-muted text-sm mt-1">Gestion des clients de la banque</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Créer un client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat">
          <p className="text-muted text-sm">Total clients</p>
          <p className="text-3xl font-extrabold mt-1">{clients.length}</p>
        </div>
        <div className="stat">
          <p className="text-muted text-sm">Clients actifs</p>
          <p className="text-3xl font-extrabold mt-1 text-green-400">
            {clients.filter(c => !c.isBanned).length}
          </p>
        </div>
        <div className="stat">
          <p className="text-muted text-sm">Clients bannis</p>
          <p className="text-3xl font-extrabold mt-1 text-red-400">
            {clients.filter(c => c.isBanned).length}
          </p>
        </div>
        <div className="stat">
          <p className="text-muted text-sm">Conseillers</p>
          <p className="text-3xl font-extrabold mt-1 text-blue-400">
            {clients.filter(c => c.role === 'advisor').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          className="input-minimal w-full"
          placeholder="🔍 Rechercher un client (nom, prénom, email)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients table */}
      <div className="card">
        <h3 className="font-semibold mb-4">Liste des clients</h3>
        {loading ? (
          <p className="text-muted text-sm py-4">Chargement...</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-muted text-sm py-4">Aucun client trouvé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-muted">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Rôle</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Comptes</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{client.firstName} {client.lastName}</p>
                        {!client.isVerified && (
                          <span className="text-xs text-yellow-400">Non vérifié</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted">{client.email}</td>
                    <td className="py-3 px-4">
                      <span className={`pill ${
                        client.role === 'director' ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' :
                        client.role === 'advisor' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                        'bg-primary/20 border-primary/30 text-primary'
                      }`}>
                        {client.role === 'director' ? 'Directeur' : client.role === 'advisor' ? 'Conseiller' : 'Client'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {client.isBanned ? (
                        <span className="pill bg-red-500/20 border-red-500/30 text-red-400">Banni</span>
                      ) : (
                        <span className="pill bg-green-500/20 border-green-500/30 text-green-400">Actif</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted">{client.accountIds?.length || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="icon-btn text-blue-400"
                          onClick={() => {
                            setSelectedClient(client);
                            setShowEditModal(true);
                          }}
                          aria-label="Modifier"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        {client.role !== 'director' && (
                          <>
                            {client.isBanned ? (
                              <button
                                className="icon-btn text-green-400"
                                onClick={() => handleUnban(client.id)}
                                aria-label="Débannir"
                                title="Débannir"
                              >
                                ✓
                              </button>
                            ) : (
                              <button
                                className="icon-btn text-orange-400"
                                onClick={() => handleBan(client.id)}
                                aria-label="Bannir"
                                title="Bannir"
                              >
                                🚫
                              </button>
                            )}
                            <button
                              className="icon-btn text-red-400"
                              onClick={() => handleDelete(client.id)}
                              aria-label="Supprimer"
                              title="Supprimer"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Create Client Modal */}
    {showCreateModal && (
      <CreateClientModal
        onClose={() => setShowCreateModal(false)}
        onSuccess={async () => {
          setShowCreateModal(false);
          await loadClients();
        }}
        token={token || ""}
      />
    )}

    {/* Edit Client Modal */}
    {showEditModal && selectedClient && (
      <EditClientModal
        client={selectedClient}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClient(null);
        }}
        onSuccess={async () => {
          setShowEditModal(false);
          setSelectedClient(null);
          await loadClients();
        }}
        token={token || ""}
      />
    )}
    </>
  );
}

function CreateClientModal({ onClose, onSuccess, token }: { onClose: () => void; onSuccess: () => void; token: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'client' | 'advisor'>('client');
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/director/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      show("Client créé avec succès", "success");
      onSuccess();
    } catch (err: any) {
      show(err.message || "Erreur lors de la création", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="font-semibold mb-4">Créer un nouveau client</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            className="input-minimal w-full"
            placeholder="Jean"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            className="input-minimal w-full"
            placeholder="Dupont"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="input-minimal w-full"
            placeholder="jean.dupont@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            type="password"
            className="input-minimal w-full"
            placeholder="8+ caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted mt-1">Minimum 8 caractères</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rôle</label>
          <select
            className="input-minimal w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as 'client' | 'advisor')}
          >
            <option value="client">Client</option>
            <option value="advisor">Conseiller</option>
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditClientModal({ client, onClose, onSuccess, token }: { client: Client; onClose: () => void; onSuccess: () => void; token: string }) {
  const [firstName, setFirstName] = useState(client.firstName);
  const [lastName, setLastName] = useState(client.lastName);
  const [email, setEmail] = useState(client.email);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/director/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      show("Client modifié avec succès", "success");
      onSuccess();
    } catch (err: any) {
      show(err.message || "Erreur lors de la modification", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="font-semibold mb-4">Modifier le client</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            className="input-minimal w-full"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            className="input-minimal w-full"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="input-minimal w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Modification..." : "Modifier"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
        {children}
      </div>
    </div>
  );
}

function decodeRole(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

