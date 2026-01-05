"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useTranslation } from "../../../hooks/useTranslation";
import api from "../../../lib/api";

interface Credit {
  id: string;
  clientId: string;
  advisorId: string;
  accountId: string;
  amount: number;
  annualInterestRate: number;
  insuranceRate: number;
  durationMonths: number;
  monthlyPayment: number;
  remainingCapital: number;
  status: "pending" | "active" | "completed" | "cancelled";
  insuranceMonthlyAmount: number;
  paidMonths: number;
  startDate?: string;
  nextPaymentDate?: string;
  totalInterestAmount: number;
  totalInsuranceAmount: number;
  totalCost: number;
  createdAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Account {
  id: string;
  iban: string;
  name: string;
  balance: number;
  accountType?: string;
}

export default function AdvisorDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { show } = useToast();
  
  const [credits, setCredits] = useState<Credit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientAccounts, setSelectedClientAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<{
    monthlyPayment: number;
    insuranceMonthlyAmount: number;
    totalMonthlyPayment: number;
    totalInterestAmount: number;
    totalInsuranceAmount: number;
    totalCost: number;
  } | null>(null);
  
  const [newCredit, setNewCredit] = useState({
    clientId: "",
    accountId: "",
    amount: "",
    annualInterestRate: "",
    insuranceRate: "",
    durationMonths: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!token || role !== "ADVISOR") {
      router.push("/login");
      return;
    }
    loadCredits();
    loadClients();
  }, [token, router]);

  const loadCredits = async () => {
    if (!token) return;
    try {
      const data = await api.advisor.listCredits(token);
      setCredits(data.credits);
    } catch (err: any) {
      show(err.message || t("credit.loadingError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!token) return;
    try {
      const data = await api.advisor.listClients(token);
      setClients(data.clients);
      console.log("Clients chargés:", data.clients);
      if (data.clients.length === 0) {
        show(t("credit.noClientsFound"), "warning");
      }
    } catch (err: any) {
      console.error("Error loading clients:", err);
      show(err.message || t("credit.loadClientsError"), "error");
    }
  };

  const loadClientAccounts = async (clientId: string) => {
    if (!clientId) {
      setSelectedClientAccounts([]);
      return;
    }
    try {
      const accounts = await api.listAccounts(clientId);
      setSelectedClientAccounts(accounts);
    } catch (err: any) {
      show(err.message || t("credit.loadAccountsError"), "error");
    }
  };

  const handleClientChange = (clientId: string) => {
    setNewCredit({ ...newCredit, clientId, accountId: "" });
    loadClientAccounts(clientId);
  };

  const calculatePreview = async () => {
    if (!token) return;
    const { amount, annualInterestRate, durationMonths, insuranceRate } = newCredit;
    
    if (!amount || !annualInterestRate || !durationMonths || !insuranceRate) {
      show(t("credit.fillAllFields"), "error");
      return;
    }

    try {
      const data = await api.advisor.calculateCreditPreview({
        amount: parseFloat(amount),
        annualInterestRate: parseFloat(annualInterestRate),
        durationMonths: parseInt(durationMonths, 10),
        insuranceRate: parseFloat(insuranceRate),
      }, token);
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err: any) {
      show(err.message || t("credit.previewError"), "error");
    }
  };

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (!newCredit.clientId || !newCredit.accountId || !newCredit.amount || !newCredit.annualInterestRate || !newCredit.insuranceRate || !newCredit.durationMonths) {
      show(t("credit.fillAllFields"), "error");
      return;
    }

    try {
      console.log("Création crédit avec:", {
        clientId: newCredit.clientId,
        accountId: newCredit.accountId,
        amount: parseFloat(newCredit.amount),
        annualInterestRate: parseFloat(newCredit.annualInterestRate),
        insuranceRate: parseFloat(newCredit.insuranceRate),
        durationMonths: parseInt(newCredit.durationMonths, 10),
      });
      await api.advisor.createCredit({
        clientId: newCredit.clientId,
        accountId: newCredit.accountId,
        amount: parseFloat(newCredit.amount),
        annualInterestRate: parseFloat(newCredit.annualInterestRate),
        insuranceRate: parseFloat(newCredit.insuranceRate),
        durationMonths: parseInt(newCredit.durationMonths, 10),
      }, token);
      show(t("credit.created"), "success");
      setShowCreateModal(false);
      setNewCredit({
        clientId: "",
        accountId: "",
        amount: "",
        annualInterestRate: "",
        insuranceRate: "",
        durationMonths: "",
      });
      setSelectedClientAccounts([]);
      loadCredits();
    } catch (err: any) {
      console.error("Erreur création crédit:", err);
      const errorMessage = err.message || t("credit.createError");
      show(errorMessage, "error");
    }
  };

  const handleActivate = async (creditId: string) => {
    if (!token) return;
    if (!confirm(t("credit.activateConfirm"))) return;
    try {
      await api.advisor.activateCredit(creditId, token);
      show(t("credit.activated"), "success");
      loadCredits();
    } catch (err: any) {
      show(err.message || t("credit.activateError"), "error");
    }
  };

  const handleRecordPayment = async (creditId: string) => {
    if (!token) return;
    if (!confirm(t("credit.recordPaymentConfirm"))) return;
    try {
      await api.advisor.recordCreditPayment(creditId, token);
      show(t("credit.paymentRecorded"), "success");
      loadCredits();
    } catch (err: any) {
      show(err.message || t("credit.paymentError"), "error");
    }
  };

  if (loading) {
    return <div className="text-center py-20">{t("common.loading")}</div>;
  }

  const selectedClient = clients.find(c => c.id === newCredit.clientId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t("advisor.title")}</h1>
          <p className="text-muted text-sm mt-1">{t("advisor.welcome")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + {t("credit.createCredit")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("credit.totalCredits")}</p>
            <p className="text-3xl font-extrabold mt-1">{credits.length}</p>
          </div>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("credit.pendingCredits")}</p>
            <p className="text-2xl font-semibold mt-1 text-yellow-400">
              {credits.filter((c) => c.status === "pending").length}
            </p>
          </div>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("credit.activeCredits")}</p>
            <p className="text-2xl font-semibold mt-1 text-primary">
              {credits.filter((c) => c.status === "active").length}
            </p>
          </div>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">{t("credit.completedCredits")}</p>
            <p className="text-2xl font-semibold mt-1 text-green-400">
              {credits.filter((c) => c.status === "completed").length}
            </p>
          </div>
        </div>
      </div>

      {/* Credits Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("credit.client")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("credit.amount")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("credit.monthlyPayment")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("credit.remainingCapital")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">{t("credit.status")}</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {credits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    {t("credit.noCredits")}
                  </td>
                </tr>
              ) : (
                credits.map((credit) => {
                  const client = clients.find(c => c.id === credit.clientId);
                  return (
                    <tr key={credit.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium">{client ? `${client.firstName} ${client.lastName}` : credit.clientId}</p>
                        <p className="text-xs text-muted">{client?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{credit.amount.toFixed(2)} €</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{credit.monthlyPayment.toFixed(2)} €</p>
                        <p className="text-xs text-muted">+ {credit.insuranceMonthlyAmount.toFixed(2)} € {t("credit.insurance")}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{credit.remainingCapital.toFixed(2)} €</p>
                        <p className="text-xs text-muted">{credit.paidMonths} / {credit.durationMonths} {t("credit.months")}</p>
                      </td>
                      <td className="px-4 py-3">
                        {credit.status === "pending" && (
                          <span className="pill bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                            {t("credit.statusPending")}
                          </span>
                        )}
                        {credit.status === "active" && (
                          <span className="pill bg-primary/10 text-primary border-primary/30">
                            {t("credit.statusActive")}
                          </span>
                        )}
                        {credit.status === "completed" && (
                          <span className="pill bg-green-500/10 text-green-400 border-green-500/30">
                            {t("credit.statusCompleted")}
                          </span>
                        )}
                        {credit.status === "cancelled" && (
                          <span className="pill bg-red-500/10 text-red-400 border-red-500/30">
                            {t("credit.statusCancelled")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {credit.status === "pending" && (
                            <button
                              onClick={() => handleActivate(credit.id)}
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              {t("credit.activate")}
                            </button>
                          )}
                          {credit.status === "active" && (
                            <button
                              onClick={() => handleRecordPayment(credit.id)}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              {t("credit.recordPayment")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Credit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-glow max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">{t("credit.createCredit")}</h3>
            <form onSubmit={handleCreateCredit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("credit.client")}</label>
                <select
                  className="input-minimal w-full"
                  value={newCredit.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                >
                  <option value="">{t("credit.selectClient")}</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {newCredit.clientId && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t("credit.account")}</label>
                  <select
                    className="input-minimal w-full"
                    value={newCredit.accountId}
                    onChange={(e) => setNewCredit({ ...newCredit, accountId: e.target.value })}
                    required
                  >
                    <option value="">{t("credit.selectAccount")}</option>
                    {selectedClientAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.iban} ({account.balance.toFixed(2)} €)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("credit.amount")} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input-minimal w-full"
                    placeholder="10000.00"
                    value={newCredit.amount}
                    onChange={(e) => setNewCredit({ ...newCredit, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("credit.durationMonths")}</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    className="input-minimal w-full"
                    placeholder="60"
                    value={newCredit.durationMonths}
                    onChange={(e) => setNewCredit({ ...newCredit, durationMonths: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("credit.annualInterestRate")} (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="input-minimal w-full"
                    placeholder="3.5"
                    value={newCredit.annualInterestRate}
                    onChange={(e) => setNewCredit({ ...newCredit, annualInterestRate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("credit.insuranceRate")} (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="input-minimal w-full"
                    placeholder="0.5"
                    value={newCredit.insuranceRate}
                    onChange={(e) => setNewCredit({ ...newCredit, insuranceRate: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted mt-1">{t("credit.insuranceObligatory")}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCredit({
                      clientId: "",
                      accountId: "",
                      amount: "",
                      annualInterestRate: "",
                      insuranceRate: "",
                      durationMonths: "",
                    });
                    setSelectedClientAccounts([]);
                  }}
                  className="btn-secondary flex-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={calculatePreview}
                  className="btn-secondary flex-1"
                  disabled={!newCredit.clientId || !newCredit.accountId || !newCredit.amount || !newCredit.annualInterestRate || !newCredit.insuranceRate || !newCredit.durationMonths}
                >
                  {t("credit.preview")}
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={!newCredit.clientId || !newCredit.accountId || !newCredit.amount || !newCredit.annualInterestRate || !newCredit.insuranceRate || !newCredit.durationMonths}
                >
                  {t("credit.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
            <h3 className="font-semibold mb-4">{t("credit.previewTitle")}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted">{t("credit.monthlyPayment")}</span>
                <span className="font-medium">{previewData.monthlyPayment.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{t("credit.insuranceMonthly")}</span>
                <span className="font-medium">{previewData.insuranceMonthlyAmount.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-muted font-semibold">{t("credit.totalMonthlyPayment")}</span>
                <span className="font-bold text-lg">{previewData.totalMonthlyPayment.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{t("credit.totalInterestAmount")}</span>
                <span className="font-medium">{previewData.totalInterestAmount.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{t("credit.totalInsuranceAmount")}</span>
                <span className="font-medium">{previewData.totalInsuranceAmount.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-muted font-semibold">{t("credit.totalCost")}</span>
                <span className="font-bold text-lg text-primary">{previewData.totalCost.toFixed(2)} €</span>
              </div>
            </div>
            <div className="mt-6">
              <button
                className="btn-primary w-full"
                onClick={() => setShowPreviewModal(false)}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
