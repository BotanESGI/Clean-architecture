"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

type Transaction = {
  id: string;
  date: string; // ISO
  label: string;
  amount: number; // positive credit, negative debit
};

type ActivityHistoryItem = {
  id: string;
  date: string;
  label: string;
  type: "create" | "delete" | "transfer_in" | "transfer_out";
};

type Beneficiary = {
  id: string;
  iban: string;
  firstName: string;
  lastName: string;
  isInBank: boolean; // true si le bénéficiaire est dans notre banque
};

export default function DashboardPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState<string>("Client");
  const [ibanInfo, setIbanInfo] = useState<{ iban: string; name: string; accountType?: string; createdAt?: string } | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const { show } = useToast();
  const [modalBanner, setModalBanner] = useState("");
  const [accounts, setAccounts] = useState<Array<{ id: string; iban: string; name: string; balance: number; accountType?: string; createdAt?: string }>>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [displayedCardIndex, setDisplayedCardIndex] = useState<number>(0);
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryItem[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<"checking" | "savings">("checking");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [savingsRate, setSavingsRate] = useState<number | null>(null);

  // Load account data (transactions and activity history) for a specific account
  const loadAccountData = useCallback(async (accountId: string) => {
    if (!accountId) return;
    try {
      // Load transactions
      const txns = await api.listTransactions([accountId]);
      const formatted: Transaction[] = txns.map(t => ({
        id: t.id,
        date: t.createdAt,
        label: t.label,
        amount: t.type === "transfer_in" ? t.amount : -t.amount,
      }));
      setTransactions(formatted);

      // Load activity history from localStorage (per account)
      try {
        const stored = localStorage.getItem(`activityHistory_${accountId}`);
        if (stored) {
          setActivityHistory(JSON.parse(stored));
        } else {
          setActivityHistory([]);
        }
      } catch {
        setActivityHistory([]);
      }

      // Load beneficiaries from localStorage (per account)
      try {
        const stored = localStorage.getItem(`beneficiaries_${accountId}`);
        if (stored) {
          setBeneficiaries(JSON.parse(stored));
        } else {
          setBeneficiaries([]);
        }
      } catch {
        setBeneficiaries([]);
      }
    } catch (err: unknown) {
      console.error("Error loading account data:", err);
      setTransactions([]);
      setActivityHistory([]);
    }
  }, []);

  // Switch to a different account
  const switchAccount = useCallback(async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    setActiveAccountId(accountId);
    setBalance(account.balance);
    setIbanInfo({ 
      iban: account.iban, 
      name: account.name, 
      accountType: account.accountType,
      createdAt: account.createdAt 
    });
    setDisplayedCardIndex(accounts.findIndex(a => a.id === accountId));
    
    // Reload savings rate when switching accounts
    try {
      const rateData = await api.getSavingsRate();
      setSavingsRate(rateData.rate);
    } catch (err) {
      console.error("Error loading savings rate:", err);
    }
    
    await loadAccountData(accountId);
    
    const accountName = account.name || "Compte";
    show(`Compte sélectionné: ${accountName}`, "success");
  }, [accounts, loadAccountData, show]);

  // Marquer le composant comme monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Vérifier l'authentification (uniquement après le montage)
  useEffect(() => {
    if (!mounted) return; // Attendre que le composant soit monté
    if (!token) {
      router.push("/login");
      return;
    }
  }, [mounted, token, router]);

  // Initial load
  useEffect(() => {
    if (!token) return; // Ne pas charger si pas de token
    
    async function load() {
      try {
        const clientId = decodeClientId(token);
        if (!clientId) {
          router.push("/login");
          return;
        }
        
        const [profile, list, rateData] = await Promise.all([
          api.getClient(clientId),
          api.listAccounts(clientId),
          api.getSavingsRate().catch(() => ({ rate: null })),
        ]);
        
        setClientName(`${profile.firstname} ${profile.lastname}`);
        setAccounts(list);
        
        // Initialiser le dernier taux connu et vérifier les changements
        if (rateData.rate !== null) {
          const lastRateKey = `lastSavingsRate_${clientId}`;
          const lastRate = localStorage.getItem(lastRateKey);
          const hasSavingsAccount = list.some(acc => acc.accountType === "savings" && !acc.isClosed);
          
          // Si le taux a changé depuis la dernière visite et que l'utilisateur a un compte d'épargne
          if (lastRate !== null && parseFloat(lastRate) !== rateData.rate && hasSavingsAccount) {
            show(
              `📢 Le taux d'épargne a été modifié : ${parseFloat(lastRate).toFixed(2)}% → ${rateData.rate.toFixed(2)}%`,
              "info"
            );
          }
          
          // Sauvegarder le taux actuel
          localStorage.setItem(lastRateKey, rateData.rate.toString());
          setSavingsRate(rateData.rate);
        }
        
        const primary = list[0];
        if (primary) {
          setActiveAccountId(primary.id);
          setBalance(primary.balance);
          setIbanInfo({ 
            iban: primary.iban, 
            name: primary.name, 
            accountType: primary.accountType,
            createdAt: primary.createdAt || undefined 
          });
          setDisplayedCardIndex(0);
          await loadAccountData(primary.id);
        }
      } catch (err: unknown) {
        console.error("Error loading dashboard:", err);
        show("Erreur lors du chargement", "error");
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      load();
    }
  }, [token, loadAccountData, show]);

  // Reload savings rate when account modal opens
  useEffect(() => {
    if (showAccountModal) {
      api.getSavingsRate()
        .then(rateData => setSavingsRate(rateData.rate))
        .catch(err => console.error("Error loading savings rate:", err));
    }
  }, [showAccountModal]);

  // Polling for real-time updates
  useEffect(() => {
    if (!activeAccountId || !token) return;
    
    const interval = setInterval(async () => {
      try {
        const clientId = decodeClientId(token);
        if (!clientId) return;
        
        // Refresh accounts list to get updated balances
        const list = await api.listAccounts(clientId);
        setAccounts(list);
        
        // Refresh savings rate and check for changes
        try {
          const rateData = await api.getSavingsRate();
          const newRate = rateData.rate;
          
          // Vérifier si le taux a changé
          const lastRateKey = `lastSavingsRate_${clientId}`;
          const lastRate = localStorage.getItem(lastRateKey);
          
          // Vérifier si l'utilisateur a un compte d'épargne
          const hasSavingsAccount = list.some(acc => acc.accountType === "savings" && !acc.isClosed);
          
          if (lastRate !== null && parseFloat(lastRate) !== newRate && hasSavingsAccount) {
            // Le taux a changé et l'utilisateur a un compte d'épargne
            show(
              `📢 Le taux d'épargne a été modifié : ${parseFloat(lastRate).toFixed(2)}% → ${newRate.toFixed(2)}%`,
              "info"
            );
            
            // Ajouter à l'historique d'activité
            if (activeAccountId) {
              try {
                const stored = localStorage.getItem(`activityHistory_${activeAccountId}`);
                const existingHistory: ActivityHistoryItem[] = stored ? JSON.parse(stored) : [];
                const newHistory: ActivityHistoryItem[] = [{
                  id: `rate_change_${Date.now()}`,
                  date: new Date().toISOString(),
                  label: `Taux d'épargne modifié : ${newRate.toFixed(2)}%`,
                  type: "transfer_in",
                }, ...existingHistory];
                setActivityHistory(newHistory);
                localStorage.setItem(`activityHistory_${activeAccountId}`, JSON.stringify(newHistory));
              } catch {}
            }
          }
          
          // Sauvegarder le nouveau taux
          localStorage.setItem(lastRateKey, newRate.toString());
          setSavingsRate(newRate);
        } catch (err) {
          console.error("Error loading savings rate:", err);
        }
        
        const currentAccount = list.find(a => a.id === activeAccountId);
        if (currentAccount) {
          setBalance(currentAccount.balance);
          
          // Reload transactions to check for new incoming transfers
          const txns = await api.listTransactions([activeAccountId]);
          const formatted: Transaction[] = txns.map(t => ({
            id: t.id,
            date: t.createdAt,
            label: t.label,
            amount: t.type === "transfer_in" ? t.amount : -t.amount,
          }));
          setTransactions(formatted);
          
          // Check for new incoming transfers to add to activity history
          try {
            const stored = localStorage.getItem(`activityHistory_${activeAccountId}`);
            const existingHistory: ActivityHistoryItem[] = stored ? JSON.parse(stored) : [];
            const existingIds = new Set(existingHistory.map(h => h.id));
            
            const newTransfers = txns
              .filter(t => t.type === "transfer_in" && !existingIds.has(t.id))
              .map(t => ({
                id: t.id,
                date: t.createdAt,
                label: `Virement reçu de ${t.relatedClientName || "Inconnu"} - ${formatCurrency(t.amount)}`,
                type: "transfer_in" as const,
              }));
            
            if (newTransfers.length > 0) {
              const updatedHistory = [...newTransfers, ...existingHistory];
              setActivityHistory(updatedHistory);
              localStorage.setItem(`activityHistory_${activeAccountId}`, JSON.stringify(updatedHistory));
            }
          } catch {}
        }
      } catch (err) {
        console.error("Error polling:", err);
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [activeAccountId, token]);

  const income = useMemo(() => transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);

  const displayedAccount = accounts[displayedCardIndex] || accounts.find(a => a.id === activeAccountId) || accounts[0];

  // Ne pas afficher le contenu si le composant n'est pas monté ou si l'utilisateur n'est pas authentifié
  if (!mounted || !token) {
    return null;
  }

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Bonjour, <span className="text-primary">{clientName}</span></h1>
          <p className="text-muted text-sm mt-1">Vue d&apos;ensemble de vos comptes</p>
        </div>
        <div className="chip">Solde mis à jour en temps réel</div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat">
          <div>
            <p className="text-muted text-sm">Solde principal</p>
            <p className="text-3xl font-extrabold mt-1">{formatCurrency(balance)}</p>
          </div>
          <span className="pill">
            {(() => {
              const currentAccount = accounts.find(a => a.id === activeAccountId);
              return currentAccount?.accountType === "savings" ? "Compte d'épargne" : "Compte courant";
            })()}
          </span>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">Dépenses (30j)</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(expense)}</p>
          </div>
          <span className="pill">Sortants</span>
        </div>
        <div className="stat">
          <div>
            <p className="text-muted text-sm">Revenus (30j)</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(income)}</p>
          </div>
          <span className="pill">Entrants</span>
        </div>
      </div>

      {/* Middle: simple chart placeholder + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Activité récente</h3>
            <span className="text-xs text-muted">Historique</span>
          </div>
          <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
            {activityHistory.length === 0 ? (
              <p className="text-muted text-sm py-4">Pas encore d&apos;historique d&apos;activités</p>
            ) : (
              activityHistory.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full border flex items-center justify-center ${
                      activity.type === "create" 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : activity.type === "delete"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : activity.type === "transfer_in"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-orange-500/10 border-orange-500/30 text-orange-400"
                    }`}>
                      {activity.type === "create" ? "+" : activity.type === "delete" ? "✕" : activity.type === "transfer_in" ? "↓" : "↑"}
                    </div>
                    <div>
                      <p className="font-medium">{activity.label}</p>
                      <p className="text-xs text-muted">{new Date(activity.date).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Vos cartes</h3>
          {/* Carousel: prev ← current card → next */}
          <div className="flex items-center gap-3">
            <button
              className={"icon-btn h-8 w-8 " + (accounts.length === 0 || displayedCardIndex <= 0 ? "opacity-40 pointer-events-none" : "")}
              aria-label="Précédent"
              onClick={async () => {
                if (accounts.length === 0) return;
                const newIdx = Math.max(0, displayedCardIndex - 1);
                const account = accounts[newIdx];
                if (account) {
                  setDisplayedCardIndex(newIdx);
                  await switchAccount(account.id);
                }
              }}
            >
              ◀
            </button>
            <div className="relative flex-1">
              {(() => {
                if (!displayedAccount) return <div className="text-sm text-muted">Aucun compte</div>;
                const isActive = displayedAccount.id === activeAccountId;
                return (
                  <div className={"p-1 rounded-2xl " + cardBgByIndex(displayedCardIndex)}>
                    <div className="relative">
                      <button
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 z-10 flex items-center justify-center"
                        aria-label="Supprimer le compte"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Supprimer ce compte ?")) return;
                          await api.deleteAccount(displayedAccount.id);
                          const updated = accounts.filter(a => a.id !== displayedAccount.id);
                          setAccounts(updated);
                          
                          // Remove activity history for deleted account
                          localStorage.removeItem(`activityHistory_${displayedAccount.id}`);
                          
                          const next = updated[0];
                          if (next) {
                            await switchAccount(next.id);
                          } else {
                            setActiveAccountId(null);
                            setBalance(0);
                            setIbanInfo(null);
                            setTransactions([]);
                            setActivityHistory([]);
                            setDisplayedCardIndex(0);
                          }
                          show("Compte supprimé", "success");
                        }}
                      >
                        ✕
                      </button>
                      <button className="w-full text-left" onClick={() => switchAccount(displayedAccount.id)}>
                        <BankCard 
                          balance={displayedAccount.balance} 
                          holder={clientName} 
                          last4={isActive ? displayedAccount.iban.slice(-4) : "****"}
                          accountType={displayedAccount.accountType || "checking"}
                        />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
            <button
              className={"icon-btn h-8 w-8 " + (accounts.length === 0 || displayedCardIndex >= accounts.length - 1 ? "opacity-40 pointer-events-none" : "")}
              aria-label="Suivant"
              onClick={async () => {
                if (accounts.length === 0) return;
                const newIdx = Math.min(accounts.length - 1, displayedCardIndex + 1);
                const account = accounts[newIdx];
                if (account) {
                  setDisplayedCardIndex(newIdx);
                  await switchAccount(account.id);
                }
              }}
            >
              ▶
            </button>
          </div>
          {/* Pagination indicator */}
          <div className="mt-2 text-center text-xs text-muted">
            {accounts.length > 0 ? (
              <span>{displayedCardIndex + 1} / {accounts.length}</span>
            ) : (
              <span>0 / 0</span>
            )}
          </div>
          <h3 className="font-semibold mt-6 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary" onClick={() => setShowTransferModal(true)}>Virement</button>
            <button className="btn-secondary" onClick={() => setShowAccountModal(true)}>Infos compte</button>
            <button className="btn-secondary" onClick={() => setShowCreateAccountModal(true)}>Nouveau compte</button>
            <button className="btn-secondary" onClick={() => setShowBeneficiaryModal(true)}>Gérer bénéficiaires</button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Dernières transactions</h3>
          <span className="text-xs text-muted">{transactions.length} éléments</span>
        </div>
        <div className="divide-y divide-white/10">
          {loading ? (
            <p className="text-muted text-sm py-4">Chargement…</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted text-sm py-4">Pas encore de transactions</p>
          ) : (
            transactions.map((t) => {
              const isInterest = t.label.includes("Intérêts quotidiens");
              return (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full border flex items-center justify-center ${
                      isInterest 
                        ? "bg-green-500/10 border-green-500/30 text-green-400" 
                        : "bg-white/5 border-white/10"
                    }`}>
                      {isInterest ? "💰" : ""}
                    </div>
                    <div>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={t.amount < 0 ? "text-red-400" : isInterest ? "text-green-400" : "text-primary"}>
                    {t.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(t.amount))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

    {/* Account Info Modal */}
    {showAccountModal && displayedAccount && (() => {
      // Utiliser le compte actuellement affiché
      const currentAccount = displayedAccount;
      
      return (
        <Modal onClose={() => setShowAccountModal(false)}>
          {modalBanner && <div className="alert alert-success mb-3 text-center">{modalBanner}</div>}
          <h3 className="font-semibold mb-4">Informations du compte</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted">Titulaire</span><span className="font-medium">{clientName}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted">Nom</span><span className="font-medium">{currentAccount.name ?? "Compte courant"}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Type</span>
              <span className="font-medium">
                {currentAccount.accountType === "savings" ? "Compte d'épargne" : "Compte courant"}
              </span>
            </div>
            {currentAccount.accountType === "savings" && savingsRate !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Taux d'épargne</span>
                <span className="font-medium text-green-400">
                  {savingsRate.toFixed(2)}% / an
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">IBAN</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentAccount.iban}</span>
                <button type="button" className="icon-btn" aria-label="Copier l'IBAN" onClick={async () => {
                  try {
                    await navigator.clipboard?.writeText(currentAccount.iban);
                    setModalBanner("IBAN copié dans le presse‑papiers");
                    setTimeout(() => setModalBanner(""), 1800);
                    show("IBAN copié dans le presse‑papiers", "success");
                  } catch {
                    setModalBanner("Impossible de copier l'IBAN");
                    setTimeout(() => setModalBanner(""), 1800);
                    show("Impossible de copier l'IBAN", "error");
                  }
                }}>
                  <CopyIcon />
                </button>
              </div>
            </div>
            {currentAccount.createdAt && (
              <div className="flex items-center justify-between"><span className="text-muted">Date de création</span><span className="font-medium">{new Date(currentAccount.createdAt).toLocaleDateString("fr-FR")}</span></div>
            )}
            <div className="flex items-center justify-between"><span className="text-muted">Solde</span><span className="font-medium">{formatCurrency(currentAccount.balance)}</span></div>
          </div>
          <div className="mt-6 text-right">
            <button className="btn-primary" onClick={() => setShowAccountModal(false)}>Fermer</button>
          </div>
        </Modal>
      );
    })()}

    {/* Beneficiary Modal */}
    {showBeneficiaryModal && activeAccountId && (
      <BeneficiaryModal
        beneficiaries={beneficiaries}
        onClose={() => setShowBeneficiaryModal(false)}
        onUpdate={(updated) => {
          setBeneficiaries(updated);
          localStorage.setItem(`beneficiaries_${activeAccountId}`, JSON.stringify(updated));
        }}
      />
    )}

    {/* Transfer Modal */}
    {showTransferModal && (
      <TransferModal
        balance={balance}
        beneficiaries={beneficiaries}
        onClose={() => setShowTransferModal(false)}
        onSuccess={async (amount, toIban) => {
          try {
            await api.transfer(ibanInfo?.iban || "", toIban, amount);
            show("Virement effectué avec succès", "success");
            
            // Update balance
            const clientId = decodeClientId(token);
            if (clientId) {
              const list = await api.listAccounts(clientId);
              setAccounts(list);
              const currentAccount = list.find(a => a.id === activeAccountId);
              if (currentAccount) {
                setBalance(currentAccount.balance);
              }
            }
            
            // Add to activity history
            if (activeAccountId) {
              try {
                const stored = localStorage.getItem(`activityHistory_${activeAccountId}`);
                const existingHistory: ActivityHistoryItem[] = stored ? JSON.parse(stored) : [];
                const newHistory: ActivityHistoryItem[] = [{
                  id: `transfer_out_${Date.now()}`,
                  date: new Date().toISOString(),
                  label: `Virement effectué vers ${toIban} - ${formatCurrency(amount)}`,
                  type: "transfer_out",
                }, ...existingHistory];
                setActivityHistory(newHistory);
                localStorage.setItem(`activityHistory_${activeAccountId}`, JSON.stringify(newHistory));
              } catch {}
            }
            
            // Reload transactions
            if (activeAccountId) {
              await loadAccountData(activeAccountId);
            }
            
            setShowTransferModal(false);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erreur lors du virement";
            show(message, "error");
          }
        }}
      />
    )}

    {/* Create Account Modal */}
    {showCreateAccountModal && (
      <Modal onClose={() => {
        setShowCreateAccountModal(false);
        setNewAccountName("");
        setNewAccountType("checking");
      }}>
        <h3 className="font-semibold mb-4">Créer un nouveau compte</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type de compte</label>
            <select
              className="input-minimal w-full"
              value={newAccountType}
              onChange={(e) => setNewAccountType(e.target.value as "checking" | "savings")}
            >
              <option value="checking">Compte courant</option>
              <option value="savings">Compte d'épargne</option>
            </select>
            {newAccountType === "savings" && (
              <p className="text-xs text-muted mt-1">
                💰 Votre compte d'épargne sera rémunéré quotidiennement au taux en vigueur
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nom du compte</label>
            <input
              type="text"
              className="input-minimal w-full"
              placeholder={newAccountType === "savings" ? "Compte d'épargne" : "Compte courant"}
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button className="btn-secondary flex-1" onClick={() => {
              setShowCreateAccountModal(false);
              setNewAccountName("");
              setNewAccountType("checking");
            }}>Annuler</button>
            <button className="btn-primary flex-1" onClick={async () => {
              try {
                const clientId = decodeClientId(token);
                if (!clientId) return;
                const created = await api.createAccount(clientId, newAccountName || undefined, newAccountType);
                const accountName = created.name || "Compte";
                const list = [created, ...accounts];
                setAccounts(list);
                
                // Switch to new account
                await switchAccount(created.id);
                
                // Add to activity history
                const newHistory: ActivityHistoryItem[] = [{
                  id: `create-${Date.now()}`,
                  date: new Date().toISOString(),
                  label: `${newAccountType === "savings" ? "Compte d'épargne" : "Compte"} "${accountName}" créé`,
                  type: "create",
                }, ...activityHistory];
                setActivityHistory(newHistory);
                localStorage.setItem(`activityHistory_${created.id}`, JSON.stringify(newHistory));
                
                show(newAccountType === "savings" ? "Compte d'épargne créé" : "Compte créé", "success");
                setShowCreateAccountModal(false);
                setNewAccountName("");
                setNewAccountType("checking");
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Erreur lors de la création";
                show(message, "error");
              }
            }}>Créer</button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function decodeClientId(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload?.clientId ?? null;
  } catch {
    return null;
  }
}

function BankCard({ balance, holder, last4, accountType }: { balance: number; holder: string; last4: string; accountType?: string }) {
  const isSavings = accountType === "savings";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-5 bg-gradient-to-br from-white/5 to-white/0">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${isSavings ? "bg-green-500/20" : "bg-primary/20"} blur-3xl`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{isSavings ? "💰 Compte d'épargne" : "Carte Visa"}</span>
          <span className={`pill ${isSavings ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}`}>
            {isSavings ? "Rémunéré" : "Active"}
          </span>
        </div>
        <p className="text-lg font-semibold mt-6 tracking-widest">**** **** **** {last4}</p>
        <div className="mt-6 flex items-center justify-between text-sm">
          <div>
            <p className="text-muted">Titulaire</p>
            <p className="font-medium">{holder}</p>
          </div>
          <div>
            <p className="text-muted">Solde</p>
            <p className="font-medium">{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>
    </div>
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

function cardBgByIndex(i: number) {
  const colors = [
    "from-primary/15 to-white/0",
    "from-accent/15 to-white/0",
    "from-white/15 to-white/0",
  ];
  return `bg-gradient-to-br ${colors[i % colors.length]}`;
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function TransferModal({ balance, beneficiaries, onClose, onSuccess }: { balance: number; beneficiaries: Beneficiary[]; onClose: () => void; onSuccess: (amount: number, toIban: string) => Promise<void> }) {
  const [toIban, setToIban] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  // When beneficiary is selected, fill the IBAN
  useEffect(() => {
    if (selectedBeneficiaryId) {
      const beneficiary = beneficiaries.find(b => b.id === selectedBeneficiaryId);
      if (beneficiary) {
        setToIban(beneficiary.iban);
      }
    }
  }, [selectedBeneficiaryId, beneficiaries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!toIban.trim()) {
      show("Veuillez entrer un IBAN destinataire", "error");
      return;
    }
    
    if (!numAmount || numAmount <= 0) {
      show("Montant invalide", "error");
      return;
    }
    
    // Validation du solde désactivée pour les tests
    // if (numAmount > balance) {
    //   show("Solde insuffisant", "error");
    //   return;
    // }

    // Check if selected beneficiary is not in our bank
    const selectedBeneficiary = selectedBeneficiaryId ? beneficiaries.find(b => b.id === selectedBeneficiaryId) : null;
    if (selectedBeneficiary && !selectedBeneficiary.isInBank) {
      show("Cette fonctionnalité n'est pas prise en charge pour les bénéficiaires externes. Veuillez contacter un de nos conseillers.", "warning");
      return;
    }

    // Also check if manually entered IBAN belongs to a non-bank beneficiary
    const beneficiary = beneficiaries.find(b => b.iban === toIban.trim());
    if (beneficiary && !beneficiary.isInBank) {
      show("Cette fonctionnalité n'est pas prise en charge pour les bénéficiaires externes. Veuillez contacter un de nos conseillers.", "warning");
      return;
    }
    
    setLoading(true);
    try {
      await onSuccess(numAmount, toIban.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="font-semibold mb-4">Effectuer un virement</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {beneficiaries.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Choisir un bénéficiaire</label>
            <select
              className="input-minimal w-full"
              value={selectedBeneficiaryId}
              onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
            >
              <option value="">Sélectionner un bénéficiaire ou saisir manuellement</option>
              {beneficiaries.map(b => (
                <option key={b.id} value={b.id}>
                  {b.firstName} {b.lastName} - {b.iban} {!b.isInBank && "(Externe)"}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">IBAN destinataire</label>
          <input
            type="text"
            className="input-minimal w-full"
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            value={toIban}
            onChange={(e) => {
              setToIban(e.target.value);
              setSelectedBeneficiaryId(""); // Clear selection when manually typing
            }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Montant</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input-minimal w-full"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <p className="text-xs text-muted mt-1">Solde disponible: {formatCurrency(balance)}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={loading}>Annuler</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BeneficiaryModal({ beneficiaries, onClose, onUpdate }: { beneficiaries: Beneficiary[]; onClose: () => void; onUpdate: (updated: Beneficiary[]) => void }) {
  const [iban, setIban] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ exists: boolean; verified?: boolean; firstName?: string; lastName?: string; message?: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { show } = useToast();

  const handleVerify = async () => {
    if (!iban.trim()) {
      show("Veuillez entrer un IBAN", "error");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      show("Veuillez entrer le nom et prénom", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await api.verifyBeneficiary(iban.trim(), firstName.trim(), lastName.trim());
      setVerificationResult(result);
      
      if (!result.exists) {
        // IBAN not found - ask if user wants to add anyway
        setShowConfirmDialog(true);
      } else if (result.exists && !result.verified) {
        // IBAN exists but names don't match - show confirmation dialog
        setShowConfirmDialog(true);
      } else {
        // Everything matches - add directly
        addBeneficiary(result.firstName || firstName.trim(), result.lastName || lastName.trim(), true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la vérification";
      show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const addBeneficiary = (actualFirstName: string, actualLastName: string, isInBank: boolean) => {
    const newBeneficiary: Beneficiary = {
      id: `benef_${Date.now()}`,
      iban: iban.trim(),
      firstName: actualFirstName,
      lastName: actualLastName,
      isInBank,
    };
    
    // Check if already exists
    if (beneficiaries.some(b => b.iban === newBeneficiary.iban)) {
      show("Ce bénéficiaire existe déjà", "error");
      return;
    }
    
    const updated = [newBeneficiary, ...beneficiaries];
    onUpdate(updated);
    show("Bénéficiaire ajouté", "success");
    
    // Reset form
    setIban("");
    setFirstName("");
    setLastName("");
    setVerificationResult(null);
    setShowConfirmDialog(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce bénéficiaire ?")) return;
    const updated = beneficiaries.filter(b => b.id !== id);
    onUpdate(updated);
    show("Bénéficiaire supprimé", "success");
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="font-semibold mb-4">Gérer les bénéficiaires</h3>
      
      {/* Add beneficiary form */}
      <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-medium">Ajouter un bénéficiaire</h4>
        <div>
          <label className="block text-sm font-medium mb-2">IBAN</label>
          <input
            type="text"
            className="input-minimal w-full"
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            className="input-minimal w-full"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            className="input-minimal w-full"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        {verificationResult && !verificationResult.exists && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-400">
            Ce bénéficiaire ne fait pas partie de notre banque.
          </div>
        )}
        {verificationResult && verificationResult.exists && !verificationResult.verified && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-sm text-orange-400">
            Le RIB existe mais le bénéficiaire est : {verificationResult.firstName} {verificationResult.lastName}
          </div>
        )}
        <button
          className="btn-primary w-full"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Vérification..." : "Ajouter bénéficiaire"}
        </button>
      </div>

      {/* Confirmation dialog */}
      {showConfirmDialog && verificationResult && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative glass border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glow">
            <h4 className="font-semibold mb-4">Confirmer l&apos;ajout</h4>
            {!verificationResult.exists ? (
              <p className="text-sm mb-4">
                Ce bénéficiaire ne fait pas partie de notre banque. Souhaitez-vous l&apos;ajouter quand même ?
              </p>
            ) : (
              <p className="text-sm mb-4">
                Le RIB existe mais le bénéficiaire est : <strong>{verificationResult.firstName} {verificationResult.lastName}</strong>. Souhaitez-vous l&apos;ajouter quand même ?
              </p>
            )}
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setVerificationResult(null);
                }}
              >
                Annuler
              </button>
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  if (verificationResult.exists && verificationResult.firstName && verificationResult.lastName) {
                    addBeneficiary(verificationResult.firstName, verificationResult.lastName, true);
                  } else {
                    addBeneficiary(firstName.trim(), lastName.trim(), false);
                  }
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of beneficiaries */}
      <div>
        <h4 className="text-sm font-medium mb-3">Bénéficiaires enregistrés</h4>
        {beneficiaries.length === 0 ? (
          <p className="text-muted text-sm py-4">Aucun bénéficiaire enregistré</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {beneficiaries.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                <div>
                  <p className="font-medium">{b.firstName} {b.lastName}</p>
                  <p className="text-xs text-muted">{b.iban}</p>
                  {!b.isInBank && <span className="text-xs text-yellow-400">(Externe)</span>}
                </div>
                <button
                  className="icon-btn text-red-400"
                  onClick={() => handleDelete(b.id)}
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-right">
        <button className="btn-primary" onClick={onClose}>Fermer</button>
      </div>
    </Modal>
  );
}
