const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT";

async function request<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<T> {
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
    let message = `Erreur réseau (${res.status})`;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch (e) {
      // Si la réponse n'est pas du JSON, essayer de lire le texte
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {}
    }
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }
  const contentType = res.headers.get("content-type") || "";
  const hasBody = res.status !== 204 && contentType.includes("application/json");
  if (!hasBody) {
    // @ts-expect-error allow empty body
    return {};
  }
  return res.json();
}

export const api = {
  register: (payload: { firstname: string; lastname: string; email: string; password: string; }) =>
    request<{ message: string; client: unknown }>("/clients/register", "POST", payload),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; role: string }>("/clients/login", "POST", payload),

  confirm: (token: string) =>
    request<{ message: string; account: unknown }>(`/clients/confirm/${token}`, "GET"),

  getBalance: (clientId: string) =>
    request<{ accountId: string; balance: number }>(`/accounts/${clientId}/balance`, "GET"),

  getIban: (clientId: string) =>
    request<{ accountId: string; iban: string; name: string }>(`/accounts/${clientId}/iban`, "GET"),

  getClient: (id: string) =>
    request<{ id: string; firstname: string; lastname: string; email: string; verified: boolean }>(`/clients/${id}`, "GET"),

  listAccounts: (clientId: string) =>
    request<Array<{ id: string; clientId: string; iban: string; name: string; balance: number; accountType?: string; createdAt?: string }>>(`/accounts?clientId=${clientId}`, "GET"),

  createAccount: (clientId: string, name?: string, type?: "checking" | "savings") =>
    request<{ id: string; clientId: string; iban: string; name: string; balance: number; accountType?: string; createdAt?: string }>(`/accounts`, "POST", { clientId, name, type }),

  deleteAccount: (accountId: string) =>
    request<{ success: boolean }>(`/accounts/${accountId}`, "DELETE"),

  renameAccount: (accountId: string, name: string) =>
    request<{ id: string; name: string }>(`/accounts/${accountId}`, "PATCH", { name }),

  listTransactions: (accountIds: string[]) =>
    request<Array<{ id: string; accountId: string; type: string; amount: number; label: string; relatedAccountId?: string; relatedClientName?: string; createdAt: string }>>(`/transactions?accountIds=${accountIds.join(",")}`, "GET"),

  transfer: (fromIban: string, toIban: string, amount: number) =>
    request<{ success: boolean; fromBalance: number; toBalance: number }>("/transfers", "POST", { fromIban, toIban, amount }),

  verifyBeneficiary: (iban: string, firstName?: string, lastName?: string) =>
    request<{ exists: boolean; verified?: boolean; firstName?: string; lastName?: string; accountName?: string; message?: string }>("/beneficiaries/verify", "POST", { iban, firstName, lastName }),

  getSavingsRate: () =>
    request<{ rate: number }>("/savings-rate", "GET"),

  // Private Messages APIs
  getAvailableAdvisor: () =>
    request<{ id: string; firstName: string; lastName: string; email: string }>("/private-messages/advisor", "GET"),
  
  getAssignedAdvisor: (clientId: string) =>
    request<{ id: string; firstName: string; lastName: string; email: string }>(`/clients/${clientId}/conversation/advisor`, "GET"),
  
  listPrivateMessages: (advisorId: string, token: string) =>
    request<{ messages: Array<{ id: string; senderId: string; receiverId: string; content: string; createdAt: string; isRead: boolean }> }>(`/private-messages/${advisorId}`, "GET", undefined, token),
  
  sendPrivateMessage: (receiverId: string, content: string, token: string) =>
    request<{ message: { id: string; senderId: string; receiverId: string; content: string; createdAt: string; isRead: boolean } }>("/private-messages", "POST", { receiverId, content }, token),
  
  getUnreadCount: (token: string) =>
    request<{ count: number }>("/private-messages/unread/count", "GET", undefined, token),

  // Group Messages APIs
  listGroupMessages: (token: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    return request<{ messages: Array<{ id: string; senderId: string; senderRole: string; senderName: string; content: string; createdAt: string }> }>(`/group-messages${query}`, "GET", undefined, token);
  },
  
  sendGroupMessage: (content: string, token: string) =>
    request<{ message: { id: string; senderId: string; senderRole: string; senderName: string; content: string; createdAt: string } }>("/group-messages", "POST", { content }, token),

  // Director APIs
  director: {
    listClients: (token: string) =>
      request<{ clients: Array<{ id: string; firstName: string; lastName: string; email: string; isVerified: boolean; isBanned: boolean; role: string }> }>("/director/clients", "GET", undefined, token),
    
    createClient: (payload: { firstName: string; lastName: string; email: string; password: string }, token: string) =>
      request<{ message: string; client: unknown; account: unknown }>("/director/clients", "POST", payload, token),
    
    banClient: (clientId: string, token: string) =>
      request<{ message: string }>(`/director/clients/${clientId}/ban`, "POST", undefined, token),
    
    unbanClient: (clientId: string, token: string) =>
      request<{ message: string }>(`/director/clients/${clientId}/unban`, "POST", undefined, token),
    
    updateClient: (clientId: string, payload: { firstName?: string; lastName?: string; email?: string }, token: string) =>
      request<{ message: string }>(`/director/clients/${clientId}`, "PUT", payload, token),
    
    deleteClient: (clientId: string, token: string) =>
      request<{ message: string }>(`/director/clients/${clientId}`, "DELETE", undefined, token),
    
    getSavingsRate: (token: string) =>
      request<{ rate: number }>("/director/savings-rate", "GET", undefined, token),
    
    setSavingsRate: (rate: number, token: string) =>
      request<{ message: string; rate: number }>("/director/savings-rate", "POST", { rate }, token),
    
    listStocks: (token: string) =>
      request<{ stocks: Array<{ id: string; symbol: string; name: string; currentPrice: number; isAvailable: boolean; createdAt: string }> }>("/director/stocks", "GET", undefined, token),
    
    createStock: (payload: { symbol: string; name: string; initialPrice?: number }, token: string) =>
      request<{ message: string; stock: unknown }>("/director/stocks", "POST", payload, token),
    
    updateStock: (stockId: string, payload: { symbol?: string; name?: string; isAvailable?: boolean }, token: string) =>
      request<{ message: string }>(`/director/stocks/${stockId}`, "PUT", payload, token),
    
    deleteStock: (stockId: string, token: string) =>
      request<{ message: string }>(`/director/stocks/${stockId}`, "DELETE", undefined, token),
  },

  // Advisor APIs (Messagerie + Credits)
  advisor: {
    // Messagerie
    listConversations: (token: string) =>
      request<{ conversations: Array<{ clientId: string; clientName: string; clientEmail: string; lastMessage: string; lastMessageDate: string; unreadCount: number }> }>("/advisor/conversations", "GET", undefined, token),
    
    // Credits
    listClients: (token: string) =>
      request<{ clients: Array<{ id: string; firstName: string; lastName: string; email: string; isVerified: boolean; isBanned: boolean; role: string }> }>("/advisor/clients", "GET", undefined, token),
    
    calculateCreditPreview: (payload: { amount: number; annualInterestRate: number; durationMonths: number; insuranceRate: number }, token: string) =>
      request<{ monthlyPayment: number; insuranceMonthlyAmount: number; totalMonthlyPayment: number; totalInterestAmount: number; totalInsuranceAmount: number; totalCost: number }>("/advisor/credits/preview", "POST", payload, token),
    
    createCredit: (payload: { clientId: string; accountId: string; amount: number; annualInterestRate: number; insuranceRate: number; durationMonths: number }, token: string) =>
      request<{ id: string; clientId: string; advisorId: string; accountId: string; amount: number; annualInterestRate: number; insuranceRate: number; durationMonths: number; monthlyPayment: number; remainingCapital: number; status: string; insuranceMonthlyAmount: number; totalInterestAmount: number; totalInsuranceAmount: number; totalCost: number; createdAt: string }>("/advisor/credits", "POST", payload, token),
    
    listCredits: (token: string, filters?: { clientId?: string; status?: string }) => {
      const params = new URLSearchParams();
      if (filters?.clientId) params.append("clientId", filters.clientId);
      if (filters?.status) params.append("status", filters.status);
      const query = params.toString();
      return request<{ credits: Array<{ id: string; clientId: string; advisorId: string; accountId: string; amount: number; annualInterestRate: number; insuranceRate: number; durationMonths: number; monthlyPayment: number; remainingCapital: number; status: string; insuranceMonthlyAmount: number; paidMonths: number; startDate?: string; nextPaymentDate?: string; totalInterestAmount: number; totalInsuranceAmount: number; totalCost: number; createdAt: string }> }>(`/advisor/credits${query ? `?${query}` : ""}`, "GET", undefined, token);
    },
    
    activateCredit: (creditId: string, token: string) =>
      request<{ message: string }>(`/advisor/credits/${creditId}/activate`, "POST", undefined, token),
    
    recordCreditPayment: (creditId: string, token: string) =>
      request<{ message: string; paymentDetails: { interestAmount: number; capitalAmount: number; insuranceAmount: number; newRemainingCapital: number } }>(`/advisor/credits/${creditId}/payment`, "POST", undefined, token),
    
    // Transfert de conversation
    listAdvisors: (token: string) =>
      request<{ advisors: Array<{ id: string; firstName: string; lastName: string; email: string }> }>("/advisor/advisors", "GET", undefined, token),
    
    transferConversation: (clientId: string, toAdvisorId: string, token: string) =>
      request<{ message: string }>("/private-messages/transfer", "POST", { clientId, toAdvisorId }, token),

    // Activités (actualités de la banque)
    createActivity: (payload: { title: string; content: string }, token: string) =>
      request<{ message: string; activity: { id: string; title: string; content: string; authorId: string; createdAt: string } }>("/advisor/activities", "POST", payload, token),
    
    // Notifications
    sendNotification: (payload: { receiverId: string; title: string; message: string }, token: string) =>
      request<{ message: string }>("/advisor/notifications", "POST", payload, token),
  },

  // Client Notifications APIs
  notifications: {
    list: (token: string) =>
      request<{ notifications: Array<{ id: string; receiverId: string; senderId: string; title: string; message: string; isRead: boolean; createdAt: string }> }>("/notifications", "GET", undefined, token),
    
    markAsRead: (notificationId: string, token: string) =>
      request<{ message: string }>(`/notifications/${notificationId}/read`, "POST", undefined, token),
    
    getUnreadCount: (token: string) =>
      request<{ count: number }>("/notifications/unread-count", "GET", undefined, token),
  },

  // Activités (consultables par les clients)
  activities: {
    list: () =>
      request<{ activities: Array<{ id: string; title: string; content: string; authorId: string; createdAt: string }> }>("/activities", "GET"),
    streamUrl: () => `${BASE_URL.replace(/\/$/, "")}/activities/stream`,
  },

  // Investment APIs (Client)
  invest: {
    listStocks: () =>
      request<{ stocks: Array<{ id: string; symbol: string; name: string; currentPrice: number; isAvailable: boolean; createdAt: string }> }>("/stocks", "GET"),
    
    placeOrder: (payload: { stockId: string; type: "BUY" | "SELL"; quantity: number; accountId: string }, token: string) =>
      request<{ message: string; order: { id: string; clientId: string; stockId: string; type: string; quantity: number; price: number; fee: number; status: string; createdAt: string } }>("/invest/orders", "POST", payload, token),
    
    listMyOrders: (token: string) =>
      request<{ orders: Array<{ id: string; clientId: string; stockId: string; type: string; quantity: number; price: number; fee: number; status: string; createdAt: string }> }>("/invest/orders", "GET", undefined, token),
  },
};

export default api;


