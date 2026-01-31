"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../../hooks/useTranslation";
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
  const { t } = useTranslation();
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
      show(err.message || t("director.loadingError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.director.createClient(newClient, token);
      show(t("director.clientCreated"), "success");
      setShowCreateModal(false);
      setNewClient({ firstName: "", lastName: "", email: "", password: "" });
      loadClients();
    } catch (err: any) {
      show(err.message || t("director.createError"), "error");
    }
  };

  const handleBan = async (clientId: string) => {
    if (!token) return;
    try {
      await api.director.banClient(clientId, token);
      show(t("director.clientBanned"), "success");
      loadClients();
    } catch (err: any) {
      show(err.message || t("director.deleteError"), "error");
    }
  };

  const handleUnban = async (clientId: string) => {
    if (!token) return;
    try {
      await api.director.unbanClient(clientId, token);
      show(t("director.clientUnbanned"), "success");
      loadClients();
    } catch (err: any) {
      show(err.message || t("director.deleteError"), "error");
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!token) return;
    if (!confirm(t("director.deleteClientConfirm"))) return;
    try {
      await api.director.deleteClient(clientId, token);
      show(t("director.clientDeleted"), "success");
      loadClients();
    } catch (err: any) {
      show(err.message || t("director.deleteError"), "error");
    }
  };

  const loadStocks = async () => {
    if (!token) return;
    try {
      const data = await api.director.listStocks(token);
      setStocks(data.stocks);
    } catch (err: any) {
      show(err.message || t("director.stocksLoadingError"), "error");
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
      show(t("director.stockCreated"), "success");
      setShowCreateStockModal(false);
      setNewStock({ symbol: "", name: "", initialPrice: "" });
      loadStocks();
    } catch (err: any) {
      show(err.message || t("director.createError"), "error");
    }
  };

  const handleEditStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingStock) return;
    try {
      await api.director.updateStock(editingStock.id, editStock, token);
      show(t("director.stockUpdated"), "success");
      setShowEditStockModal(false);
      setEditingStock(null);
      loadStocks();
    } catch (err: any) {
      show(err.message || t("director.updateError"), "error");
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    if (!token) return;
    if (!confirm(t("director.deleteStockConfirm"))) return;
    try {
      await api.director.deleteStock(stockId, token);
      show(t("director.stockDeleted"), "success");
      loadStocks();
    } catch (err: any) {
      show(err.message || t("director.deleteError"), "error");
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
    return <div className="text-center py-20">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t("director.title")} <span className="text-primary">{t("director.director")}</span></h1>
          <p className="text-muted text-sm mt-1">{t("director.clientManagement")}</p>
        </div>
        <div className="flex gap-2">
          <a href="/director/group-chat" className="btn-secondary">
            💬 Discussion de groupe
          </a>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            {t("director.logout")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("director.totalClients")}</p>
            <p className="text-3xl font-extrabold mt-1">{clients.length}</p>
          </div>
          <span className="pill">{t("director.all")}</span>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("director.activeClients")}</p>
            <p className="text-2xl font-semibold mt-1 text-primary">
              {clients.filter((c) => !c.isBanned).length}
            </p>
          </div>
          <span className="pill">{t("director.active")}</span>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("director.bannedClients")}</p>
            <p className="text-2xl font-semibold mt-1 text-red-400">
              {clients.filter((c) => c.isBanned).length}
            </p>
          </div>
          <span className="pill">{t("director.banned")}</span>
        </div>
      </div>

      {/* Savings Rate Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{t("director.savingsRate")}</h3>
            <p className="text-sm text-muted mt-1">{t("director.savingsRateDescription")}</p>
          </div>
          <button
            onClick={() => setShowSavingsRateModal(true)}
            className="btn-primary"
          >
            {t("director.modifyRate")}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="stat flex-1">
            <div>
              <p className="text-muted text-sm">{t("director.currentRate")}</p>
              <p className="text-3xl font-extrabold mt-1 text-green-400">
                {savingsRate !== null ? `${savingsRate.toFixed(2)}%` : t("common.loading")}
              </p>
            </div>
            <span className="pill bg-green-500/10 text-green-400 border-green-500/30">{t("director.perYear")}</span>
          </div>
          <div className="text-sm text-muted">
            <p>{t("director.interestNote1")}</p>
            <p>{t("director.interestNote2")}</p>
          </div>
        </div>
      </div>

      {/* Stocks Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{t("director.stockManagement")}</h3>
            <p className="text-sm text-muted mt-1">{t("director.stockManagementDescription")}</p>
          </div>
          <button
            onClick={() => setShowCreateStockModal(true)}
            className="btn-primary"
          >
            + {t("director.createStock")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.symbol")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.stockName")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.currentPrice")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.status")}</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    {t("director.noStocks")}
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
                          {t("director.available")}
                        </span>
                      ) : (
                        <span className="pill bg-red-500/10 text-red-400 border-red-500/30">
                          {t("director.unavailable")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(stock)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={() => handleDeleteStock(stock.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/40 rounded-xl hover:bg-red-500/20 transition text-xs"
                        >
                          {t("director.delete")}
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
        <h3 className="font-semibold">{t("director.clientList")}</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + {t("director.createClient")}
        </button>
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("dashboard.name")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.email")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.status")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("director.role")}</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">{t("common.actions")}</th>
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
                        {t("director.banned")}
                      </span>
                    ) : (
                      <span className="pill bg-primary/10 text-primary border-primary/30">
                        {t("director.active")}
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
                            {t("director.unban")}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(client.id)}
                            className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/40 rounded-xl hover:bg-orange-500/20 transition text-xs"
                          >
                            {t("director.ban")}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/40 rounded-xl hover:bg-red-500/20 transition text-xs"
                        >
                          {t("director.delete")}
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
            <h3 className="font-semibold mb-4">{t("director.createClientTitle")}</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("dashboard.firstName")}</label>
                <input
                  type="text"
                  required
                  value={newClient.firstName}
                  onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("dashboard.lastName")}</label>
                <input
                  type="text"
                  required
                  value={newClient.lastName}
                  onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.email")}</label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.password")}</label>
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
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {t("dashboard.createAccount")}
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
            <h3 className="font-semibold mb-4">{t("director.modifySavingsRate")}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.newRate")}</label>
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
                  {t("director.rateExample")}
                </p>
              </div>
              {savingsRate !== null && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400">
                  <p>{t("director.currentRateLabel")}: <strong>{savingsRate.toFixed(2)}%</strong></p>
                  <p className="mt-1">{t("director.rateChangeNote")}</p>
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
                  {t("common.cancel")}
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={async () => {
                    if (!token) return;
                    const rate = parseFloat(newSavingsRate);
                    if (isNaN(rate) || rate < 0 || rate > 100) {
                      show(t("director.invalidRate"), "error");
                      return;
                    }
                    try {
                      await api.director.setSavingsRate(rate, token);
                      show(t("director.rateUpdated"), "success");
                      setShowSavingsRateModal(false);
                      setNewSavingsRate("");
                      await loadSavingsRate();
                    } catch (err: any) {
                      show(err.message || t("director.rateUpdateError"), "error");
                    }
                  }}
                >
                  {t("common.save")}
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
            <h3 className="font-semibold mb-4">{t("director.createStockTitle")}</h3>
            <form onSubmit={handleCreateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.stockSymbol")}</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  className="input-minimal w-full"
                  placeholder="AAPL"
                />
                <p className="text-xs text-muted mt-1">{t("director.stockSymbolExample")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.stockName")}</label>
                <input
                  type="text"
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  className="input-minimal w-full"
                  placeholder={t("director.stockNameExample")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.initialPrice")}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newStock.initialPrice}
                  onChange={(e) => setNewStock({ ...newStock, initialPrice: e.target.value })}
                  className="input-minimal w-full"
                  placeholder={t("director.initialPriceExample")}
                />
                <p className="text-xs text-muted mt-1">{t("director.priceAutoNote")}</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateStockModal(false)}
                  className="btn-secondary flex-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {t("dashboard.createAccount")}
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
            <h3 className="font-semibold mb-4">{t("director.editStockTitle")}</h3>
            <form onSubmit={handleEditStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.stockSymbol")}</label>
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
                <label className="block text-sm font-medium mb-2">{t("director.stockName")}</label>
                <input
                  type="text"
                  required
                  value={editStock.name}
                  onChange={(e) => setEditStock({ ...editStock, name: e.target.value })}
                  className="input-minimal w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("director.currentPriceLabel")}</label>
                <input
                  type="text"
                  disabled
                  value={`${editingStock.currentPrice.toFixed(2)} €`}
                  className="input-minimal w-full opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted mt-1">{t("director.priceAutoNote2")}</p>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editStock.isAvailable}
                    onChange={(e) => setEditStock({ ...editStock, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <span className="text-sm">{t("director.availableForClients")}</span>
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
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

