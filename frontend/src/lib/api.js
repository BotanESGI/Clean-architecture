"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
async function request(path, method, body, token) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });
    if (!res.ok) {
        let message = "Erreur réseau";
        try {
            const data = await res.json();
            message = data?.message || message;
        }
        catch { }
        throw new Error(message);
    }
    const contentType = res.headers.get("content-type") || "";
    const hasBody = res.status !== 204 && contentType.includes("application/json");
    if (!hasBody) {
        // @ts-expect-error allow empty body
        return {};
    }
    return res.json();
}
exports.api = {
    register: (payload) => request("/clients/register", "POST", payload),
    login: (payload) => request("/clients/login", "POST", payload),
    confirm: (token) => request(`/clients/confirm/${token}`, "GET"),
    getBalance: (clientId) => request(`/accounts/${clientId}/balance`, "GET"),
    getIban: (clientId) => request(`/accounts/${clientId}/iban`, "GET"),
    getClient: (id) => request(`/clients/${id}`, "GET"),
    listAccounts: (clientId) => request(`/accounts?clientId=${clientId}`, "GET"),
    createAccount: (clientId, name, type) => request(`/accounts`, "POST", { clientId, name, type }),
    deleteAccount: (accountId) => request(`/accounts/${accountId}`, "DELETE"),
    listTransactions: (accountIds) => request(`/transactions?accountIds=${accountIds.join(",")}`, "GET"),
    transfer: (fromIban, toIban, amount) => request("/transfers", "POST", { fromIban, toIban, amount }),
    verifyBeneficiary: (iban, firstName, lastName) => request("/beneficiaries/verify", "POST", { iban, firstName, lastName }),
};
exports.default = exports.api;
