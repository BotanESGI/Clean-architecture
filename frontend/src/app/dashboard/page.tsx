"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import api from "../../lib/api";

type Transaction = {
  id: string;
  date: string; // ISO
  label: string;
  amount: number; // positive credit, negative debit
};

export default function DashboardPage() {
  const { token } = useAuth();

  // Temporary mocked data until backend endpoints exist
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState<string>("Client");
  const [ibanInfo, setIbanInfo] = useState<{ iban: string; name: string } | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const { show } = useToast();
  const [modalBanner, setModalBanner] = useState("");
  const [accounts, setAccounts] = useState<Array<{ id: string; iban: string; name: string; balance: number }>>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [activityHistory, setActivityHistory] = useState<Array<{ id: string; date: string; label: string; type: "create" | "delete" }>>([]);

  useEffect(() => {
    // Load activity history from localStorage (client-side only)
    try {
      const stored = localStorage.getItem("activityHistory");
      if (stored) {
        setActivityHistory(JSON.parse(stored));
      }
    } catch {}

    async function load() {
      try {
        const clientId = decodeClientId(token);
        if (clientId) {
          const [profile, list] = await Promise.all([
            api.getClient(clientId),
            api.listAccounts(clientId),
          ]);
          setClientName(`${profile.firstname} ${profile.lastname}`);
          setAccounts(list);
          const primary = list[0];
          if (primary) {
            setActiveAccountId(primary.id);
            setBalance(primary.balance);
            setIbanInfo({ iban: primary.iban, name: primary.name });
          }
          // Transactions endpoint not ready yet → keep mock for now
        }
      } finally {
        const mock: Transaction[] = [
          { id: "t1", date: new Date().toISOString(), label: "Apple", amount: -563.0 },
          { id: "t2", date: new Date(Date.now() - 86400000).toISOString(), label: "Virement reçu", amount: 2843.2 },
          { id: "t3", date: new Date(Date.now() - 2 * 86400000).toISOString(), label: "Carburant", amount: -52.43 },
          { id: "t4", date: new Date(Date.now() - 3 * 86400000).toISOString(), label: "Restaurant", amount: -32.5 },
        ];
        setTransactions(mock);
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const income = useMemo(() => transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Bonjour, <span className="text-primary">{clientName}</span></h1>
          <p className="text-muted text-sm mt-1">Vue d’ensemble de vos comptes</p>
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
          <span className="pill">Compte courant</span>
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
              <p className="text-muted text-sm py-4">Aucune activité récente</p>
            ) : (
              activityHistory.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full border flex items-center justify-center ${
                      activity.type === "create" 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {activity.type === "create" ? "+" : "✕"}
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
              className={"icon-btn h-8 w-8 " + (accounts.length === 0 || (accounts.findIndex(a => a.id === activeAccountId) <= 0) ? "opacity-40 pointer-events-none" : "")}
              aria-label="Précédent"
              onClick={() => {
                if (accounts.length === 0) return;
                const currentIdx = Math.max(0, accounts.findIndex(a => a.id === activeAccountId));
                const newIdx = (currentIdx - 1 + accounts.length) % accounts.length;
                const acc = accounts[newIdx];
                setActiveAccountId(acc.id);
                setBalance(acc.balance);
                setIbanInfo({ iban: acc.iban, name: acc.name });
              }}
            >
              ◀
            </button>
            <div className="relative flex-1">
              {(() => {
                const acc = accounts.find(a => a.id === activeAccountId) ?? accounts[0];
                if (!acc) return <div className="text-sm text-muted">Aucun compte</div>;
                return (
                  <div className={"p-1 rounded-2xl " + cardBgByIndex(accounts.findIndex(a => a.id === acc.id))}>
                    <div className="relative">
                      <button
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 z-10 flex items-center justify-center"
                        aria-label="Supprimer le compte"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Supprimer ce compte ?")) return;
                          const accountName = acc.name || "Compte";
                          await api.deleteAccount(acc.id);
                          const updated = accounts.filter(a => a.id !== acc.id);
                          setAccounts(updated);
                          const newHistory = [{
                            id: `del-${Date.now()}`,
                            date: new Date().toISOString(),
                            label: `Compte "${accountName}" supprimé`,
                            type: "delete"
                          }, ...activityHistory];
                          setActivityHistory(newHistory);
                          localStorage.setItem("activityHistory", JSON.stringify(newHistory));
                          const next = updated[0];
                          if (next) {
                            setActiveAccountId(next.id);
                            setBalance(next.balance);
                            setIbanInfo({ iban: next.iban, name: next.name });
                          } else {
                            setActiveAccountId(null);
                            setBalance(0);
                            setIbanInfo(null);
                          }
                          show("Compte supprimé", "success");
                        }}
                      >
                        ✕
                      </button>
                      <button className="w-full text-left" onClick={() => {
                        setActiveAccountId(acc.id);
                        setBalance(acc.balance);
                        setIbanInfo({ iban: acc.iban, name: acc.name });
                        const accountName = acc.name || "Compte";
                        show(`Compte sélectionné: ${accountName}`, "success");
                      }}>
                        <BankCard balance={acc.balance} holder={clientName} last4={acc.iban.slice(-4)} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
            <button
              className={"icon-btn h-8 w-8 " + (accounts.length === 0 || (accounts.findIndex(a => a.id === activeAccountId) >= accounts.length - 1) ? "opacity-40 pointer-events-none" : "")}
              aria-label="Suivant"
              onClick={() => {
                if (accounts.length === 0) return;
                const currentIdx = Math.max(0, accounts.findIndex(a => a.id === activeAccountId));
                const newIdx = (currentIdx + 1) % accounts.length;
                const acc = accounts[newIdx];
                setActiveAccountId(acc.id);
                setBalance(acc.balance);
                setIbanInfo({ iban: acc.iban, name: acc.name });
              }}
            >
              ▶
            </button>
          </div>
          {/* Pagination indicator */}
          <div className="mt-2 text-center text-xs text-muted">
            {accounts.length > 0 ? (
              <span>{Math.max(1, accounts.findIndex(a => a.id === activeAccountId) + 1)} / {accounts.length}</span>
            ) : (
              <span>0 / 0</span>
            )}
          </div>
          <h3 className="font-semibold mt-6 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary">Virement</button>
            <button className="btn-secondary" onClick={() => setShowAccountModal(true)}>Infos compte</button>
            <button className="btn-secondary" onClick={async () => {
              const clientId = decodeClientId(token);
              if (!clientId) return;
              const created = await api.createAccount(clientId);
              const accountName = created.name || "Compte";
              const list = [created, ...accounts];
              setAccounts(list);
              setActiveAccountId(created.id);
              setBalance(created.balance);
              setIbanInfo({ iban: created.iban, name: created.name });
              const newHistory = [{
                id: `create-${Date.now()}`,
                date: new Date().toISOString(),
                label: `Compte "${accountName}" créé`,
                type: "create"
              }, ...activityHistory];
              setActivityHistory(newHistory);
              localStorage.setItem("activityHistory", JSON.stringify(newHistory));
              show("Compte créé", "success");
            }}>Nouveau compte</button>
            <button className="btn-secondary">Relevé</button>
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
            <p className="text-muted">Chargement…</p>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10" />
                  <div>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={t.amount < 0 ? "text-red-400" : "text-primary"}>
                  {t.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(t.amount))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    {showAccountModal && (
      <Modal onClose={() => setShowAccountModal(false)}>
        {modalBanner && <div className="alert alert-success mb-3 text-center">{modalBanner}</div>}
        <h3 className="font-semibold mb-4">Informations du compte</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between"><span className="text-muted">Titulaire</span><span className="font-medium">{clientName}</span></div>
          <div className="flex items-center justify-between"><span className="text-muted">Type</span><span className="font-medium">{ibanInfo?.name ?? "Compte courant"}</span></div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted">IBAN</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{ibanInfo?.iban ?? "—"}</span>
              {ibanInfo?.iban && (
                <button type="button" className="icon-btn" aria-label="Copier l'IBAN" onClick={async () => {
                  try {
                    await navigator.clipboard?.writeText(ibanInfo.iban!);
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
              )}
            </div>
          </div>
          <div className="flex items-center justify-between"><span className="text-muted">Solde</span><span className="font-medium">{formatCurrency(balance)}</span></div>
        </div>
        <div className="mt-6 text-right">
          <button className="btn-primary" onClick={() => setShowAccountModal(false)}>Fermer</button>
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

function BankCard({ balance, holder, last4 }: { balance: number; holder: string; last4: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-5 bg-gradient-to-br from-white/5 to-white/0">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Carte Visa</span>
          <span className="pill">Active</span>
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

async function selectAccount(account: { id: string; iban: string; name: string; balance: number }) {
  setActiveAccountId(account.id);
  setBalance(account.balance);
  setIbanInfo({ iban: account.iban, name: account.name });
  setShowAccountModal(true);
}

async function createAccount() {
  // noop; replaced at call site (closure issue). Left for type hints if needed.
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}


