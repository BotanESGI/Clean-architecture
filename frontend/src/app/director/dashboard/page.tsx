"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isBanned: boolean;
  role: string;
}

interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  isAvailable: boolean;
  createdAt: string;
}

export default function DirectorDashboard() {
  const { token, logout } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [savingsRate, setSavingsRate] = useState<number | null>(null);
  const [newSavingsRate, setNewSavingsRate] = useState("");
  const [showSavingsRateModal, setShowSavingsRateModal] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showCreateStockModal, setShowCreateStockModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [newStock, setNewStock] = useState({
    symbol: "",
    name: "",
    initialPrice: "",
  });
  const [editStock, setEditStock] = useState({
    symbol: "",
    name: "",
    isAvailable: true,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!token || role !== "DIRECTOR") {
      router.push("/login");
      return;
    }
    loadClients();
    loadSavingsRate();
    loadStocks();
  }, [token, router]);

  const loadSavingsRate = async () => {
    if (!token) return;
    try {
      const data = await api.director.getSavingsRate(token);
      setSavingsRate(data.rate);
    } catch (err: any) {
      console.error("Error loading savings rate:", err);
    }
  };

  const loadClients = async () => {
    if (!token) return;
    try {
      const data = await api.director.listClients(token);
      setClients(data.clients);
    } catch (err: any) {
      show(err.message || "Erreur lors du chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.director.createClient(newClient, token);
      show("Client créé avec succès", "success");
      setShowCreateModal(false);
      setNewClient({ firstName: "", lastName: "", email: "", password: "" });
      loadClients();
    } catch (err: any) {
      show(err.message || "Erreur lors de la création", "error");
    }
  };

  const handleBan = async (clientId: string) => {
    if (!token) return;
    try {
      await api.director.banClient(clientId, token);
      show("Client banni", "success");
      loadClients();
    } catch (err: any) {
      show(err.message || "Erreur", "error");
    }
  };

  const handleUnban = async (clientId: string) => {
    if (!token) return;
    try {
      await api.director.unbanClient(clientId, token);
      show("Client débanni", "success");
      loadClients();
    } catch (err: any) {
      show(err.message || "Erreur", "error");
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!token) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;
    try {
      await api.director.deleteClient(clientId, token);
      show("Client supprimé", "success");
      loadClients();
    } catch (err: any) {
      show(err.message || "Erreur", "error");
    }
  };

  const loadStocks = async () => {
    if (!token) return;
    try {
      const data = await api.director.listStocks(token);
      setStocks(data.stocks);
    } catch (err: any) {
      show(err.message || "Erreur lors du chargement des actions", "error");
    }
  };

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const payload: any = {
        symbol: newStock.symbol.toUpperCase(),
        name: newStock.name,
      };
      if (newStock.initialPrice) {
        payload.initialPrice = parseFloat(newStock.initialPrice);
      }
      await api.director.createStock(payload, token);
      show("Action créée avec succès", "success");
      setShowCreateStockModal(false);
      setNewStock({ symbol: "", name: "", initialPrice: "" });
      loadStocks();
    } catch (err: any) {
      show(err.message || "Erreur lors de la création", "error");
    }
  };

  const handleEditStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingStock) return;
    try {
      await api.director.updateStock(editingStock.id, editStock, token);
      show("Action modifiée avec succès", "success");
      setShowEditStockModal(false);
      setEditingStock(null);
      loadStocks();
    } catch (err: any) {
      show(err.message || "Erreur lors de la modification", "error");
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    if (!token) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette action ?")) return;
    try {
      await api.director.deleteStock(stockId, token);
      show("Action supprimée", "success");
      loadStocks();
    } catch (err: any) {
      show(err.message || "Erreur", "error");
    }
  };

  const openEditModal = (stock: Stock) => {
    setEditingStock(stock);
    setEditStock({
      symbol: stock.symbol,
      name: stock.name,
      isAvailable: stock.isAvailable,
    });
    setShowEditStockModal(true);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("role");
    router.push("/login");
  };

  if (loading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard <span className="text-primary">Directeur</span></h1>
          <p className="text-muted text-sm mt-1">Gestion des clients</p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary"
        >
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat">
          <div>
            <p className="text-muted text-sm">Total Clients</p>
            <p className="text-3xl font-extrabold mt-1">{clients.length}</p>
          </div>
          <span className="pill">Tous</span>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">Clients Actifs</p>
            <p className="text-2xl font-semibold mt-1 text-primary">
              {clients.filter((c) => !c.isBanned).length}
            </p>
          </div>
          <span className="pill">Actifs</span>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">Clients Bannis</p>
            <p className="text-2xl font-semibold mt-1 text-red-400">
              {clients.filter((c) => c.isBanned).length}
            </p>
          </div>
          <span className="pill">Bannis</span>
        </div>
      </div>

      {/* Savings Rate Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Taux d'épargne</h3>
            <p className="text-sm text-muted mt-1">Gérer le taux de rémunération des comptes d'épargne</p>
          </div>
          <button
            onClick={() => setShowSavingsRateModal(true)}
            className="btn-primary"
          >
            Modifier le taux
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="stat flex-1">
            <div>
              <p className="text-muted text-sm">Taux actuel</p>
              <p className="text-3xl font-extrabold mt-1 text-green-400">
                {savingsRate !== null ? `${savingsRate.toFixed(2)}%` : "Chargement..."}
              </p>
            </div>
            <span className="pill bg-green-500/10 text-green-400 border-green-500/30">Par an</span>
          </div>
          <div className="text-sm text-muted">
            <p>• Les intérêts sont calculés quotidiennement</p>
            <p>• Tous les clients avec un compte d'épargne seront notifiés lors d'un changement</p>
          </div>
        </div>
      </div>

      {/* Stocks Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Gestion des actions</h3>
            <p className="text-sm text-muted mt-1">Créer, modifier ou supprimer des actions disponibles</p>
          </div>
          <button
            onClick={() => setShowCreateStockModal(true)}
            className="btn-primary"
          >
            + Créer une action
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Symbole</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Prix actuel</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    Aucune action disponible
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium">{stock.symbol}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted text-sm">{stock.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{stock.currentPrice.toFixed(2)} €</p>
                    </td>
                    <td className="px-4 py-3">
                      {stock.isAvailable ? (
                        <span className="pill bg-green-500/10 text-green-400 border-green-500/30">
                          Disponible
                        </span>
                      ) : (
                        <span className="pill bg-red-500/10 text-red-400 border-red-500/30">
                          Indisponible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(stock)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteStock(stock.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/40 rounded-xl hover:bg-red-500/20 transition text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Liste des clients</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Créer un client
        </button>
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Rôle</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium">{client.firstName} {client.lastName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-muted text-sm">{client.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {client.isBanned ? (
                      <span className="pill bg-red-500/10 text-red-400 border-red-500/30">
                        Banni
                      </span>
                    ) : (
                      <span className="pill bg-primary/10 text-primary border-primary/30">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`pill ${
                      client.role === "DIRECTOR" 
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30" 
                        : "bg-primary/10 text-primary border-primary/30"
                    }`}>
                      {client.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {client.role !== "DIRECTOR" && (
                      <div className="flex items-center justify-end gap-2">
                        {client.isBanned ? (
                          <button
                            onClick={() => handleUnban(client.id)}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Débannir
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(client.id)}
                            className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/40 rounded-xl hover:bg-orange-500/20 transition text-xs"
                          >
                            Bannir
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/40 rounded-xl hover:bg-red-500/20 transition text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
            <h3 className="font-semibold mb-4">Créer un client</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={newClient.firstName}
                  onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={newClient.lastName}
                  onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Savings Rate Modal */}
      {showSavingsRateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
            <h3 className="font-semibold mb-4">Modifier le taux d'épargne</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau taux (en pourcentage)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input-minimal w-full"
                  placeholder={savingsRate !== null ? savingsRate.toString() : "1.00"}
                  value={newSavingsRate}
                  onChange={(e) => setNewSavingsRate(e.target.value)}
                />
                <p className="text-xs text-muted mt-1">
                  Exemple: 1.5 pour 1.5% par an
                </p>
              </div>
              {savingsRate !== null && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400">
                  <p>Taux actuel: <strong>{savingsRate.toFixed(2)}%</strong></p>
                  <p className="mt-1">Tous les clients ayant un compte d'épargne recevront une notification par email.</p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setShowSavingsRateModal(false);
                    setNewSavingsRate("");
                  }}
                >
                  Annuler
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={async () => {
                    if (!token) return;
                    const rate = parseFloat(newSavingsRate);
                    if (isNaN(rate) || rate < 0 || rate > 100) {
                      show("Taux invalide (doit être entre 0 et 100)", "error");
                      return;
                    }
                    try {
                      await api.director.setSavingsRate(rate, token);
                      show("Taux d'épargne mis à jour avec succès", "success");
                      setShowSavingsRateModal(false);
                      setNewSavingsRate("");
                      await loadSavingsRate();
                    } catch (err: any) {
                      show(err.message || "Erreur lors de la mise à jour", "error");
                    }
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Stock Modal */}
      {showCreateStockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
            <h3 className="font-semibold mb-4">Créer une action</h3>
            <form onSubmit={handleCreateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Symbole</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  className="input-minimal w-full"
                  placeholder="AAPL"
                />
                <p className="text-xs text-muted mt-1">Exemple: AAPL, TSLA, MSFT</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  className="input-minimal w-full"
                  placeholder="Apple Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prix initial (optionnel)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newStock.initialPrice}
                  onChange={(e) => setNewStock({ ...newStock, initialPrice: e.target.value })}
                  className="input-minimal w-full"
                  placeholder="100.00"
                />
                <p className="text-xs text-muted mt-1">Le prix sera calculé automatiquement si non spécifié</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateStockModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {showEditStockModal && editingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
            <h3 className="font-semibold mb-4">Modifier l'action</h3>
            <form onSubmit={handleEditStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Symbole</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editStock.symbol}
                  onChange={(e) => setEditStock({ ...editStock, symbol: e.target.value.toUpperCase() })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={editStock.name}
                  onChange={(e) => setEditStock({ ...editStock, name: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prix actuel</label>
                <input
                  type="text"
                  disabled
                  value={`${editingStock.currentPrice.toFixed(2)} €`}
                  className="input-minimal w-full opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted mt-1">Le prix est calculé automatiquement selon l'offre et la demande</p>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editStock.isAvailable}
                    onChange={(e) => setEditStock({ ...editStock, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <span className="text-sm">Disponible pour les clients</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditStockModal(false);
                    setEditingStock(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

