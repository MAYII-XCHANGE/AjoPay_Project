import { requestData } from "../api/client";

export const mapBankAccount = (account) => ({
  ...account,
  isDefault: account.isDefault ?? account.primaryAccount ?? false,
  verified: account.verified === true,
});

export const mapWithdrawal = (item) => ({
  ...item,
  requestedAt: item.requestedAt || item.createdAt,
  bankAccount: item.bankAccount ? mapBankAccount(item.bankAccount) : {},
});

export const walletService = {
  async getWallet() {
    const wallet = await requestData({ method: "GET", url: "/wallet" });
    return {
      ...wallet,
      available: Number(wallet?.availableBalance ?? wallet?.available ?? 0),
      ajoBalance: Number(wallet?.ajoBalance ?? 0),
      pending: Number(wallet?.pendingBalance ?? wallet?.reservedBalance ?? 0),
    };
  },
  async getTransactions(category = "ALL") {
    const rows = await requestData({ method: "GET", url: "/wallet/transactions", params: { category } });
    return (Array.isArray(rows) ? rows : rows?.items || []).map((item) => ({
      ...item,
      id: item.id || item.referenceId,
      title: item.title || String(item.purpose || item.category || "Wallet transaction").replaceAll("_", " "),
      subtitle: item.subtitle || item.referenceId || "AjoPay wallet",
      date: item.date || item.createdAt,
      direction: String(item.direction || "DEBIT").toLowerCase(),
      status: item.status === "SUCCESS" ? "SUCCESSFUL" : item.status || "SUCCESSFUL",
      type: item.type || item.category || item.purpose,
    }));
  },
  getBanks() {
    return requestData({ method: "GET", url: "/wallet/banks" });
  },
  resolveBankAccount(accountNumber, bankCode) {
    return requestData({ method: "GET", url: "/wallet/bank-accounts/resolve", params: { accountNumber, bankCode } });
  },
  async getBankAccounts() {
    const accounts = await requestData({ method: "GET", url: "/wallet/bank-accounts" });
    return (accounts || []).map(mapBankAccount);
  },
  async saveBankAccount(accountNumber, bankCode) {
    const account = await requestData({ method: "POST", url: "/wallet/bank-accounts", data: { accountNumber, bankCode } });
    return mapBankAccount(account);
  },
  setPrimaryBankAccount(accountId) {
    return requestData({ method: "POST", url: `/wallet/bank-accounts/${accountId}/primary` });
  },
  async getWithdrawals() {
    const rows = await requestData({ method: "GET", url: "/wallet/withdrawals" });
    return (Array.isArray(rows) ? rows : rows?.items || []).map(mapWithdrawal);
  },
  withdraw(bankAccountId, amount) {
    return requestData({ method: "POST", url: "/wallet/withdraw", data: { bankAccountId, amount } });
  },
  initializeFunding(amount, callbackUrl) {
    return requestData({ method: "POST", url: "/wallet/funding/paystack/initialize", data: { amount, callbackUrl } });
  },
  verifyFunding(reference) {
    return requestData({ method: "POST", url: "/wallet/funding/paystack/verify", data: { reference } });
  },
};
