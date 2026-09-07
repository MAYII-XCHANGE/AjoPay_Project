import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletService } from "../services/wallet-service";
import {
  ArrowIcon,
  BankIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  ReceiptIcon,
  ShieldIcon,
  TrendIcon,
  WalletIcon,
} from "../components/icons";
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  Skeleton,
} from "../components/ui";
import {
  AddBankAccountModal,
  BankAccountsCard,
} from "../features/bank-accounts/bank-accounts";
import { maskAccountNumber } from "../features/bank-accounts/bank-account-utils";
import { useBankAccounts } from "../hooks/use-bank-accounts";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useTranslation } from "react-i18next";
import { QueryErrorState } from "../components/query-state";
export function WalletPage() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError: walletError, error: walletRequestError } = useQuery({
    queryKey: ["wallet"],
    queryFn: walletService.getWallet,
    refetchInterval: 60_000,
  });
  const [open, setOpen] = useState(false);
  const [fundingOpen, setFundingOpen] = useState(false);
  const [fundingMode, setFundingMode] = useState("ACCOUNT");
  const [copied, setCopied] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const { data: bankAccounts = [] } = useBankAccounts();
  const accounts = bankAccounts.filter((account) => account.verified);
  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ||
    accounts.find((account) => account.isDefault) ||
    accounts[0] ||
    null;
  const withdrawalRequests = useQuery({
    queryKey: ["wallet-withdrawals"],
    queryFn: walletService.getWithdrawals,
  });
  const allTransactions = useQuery({
    queryKey: ["transactions", "ALL"],
    queryFn: () => walletService.getTransactions("ALL"),
  });
  const queryClient = useQueryClient();
  const withdraw = useMutation({
    meta: { successMessage: "Your withdrawal request was submitted." },
    mutationFn: () => walletService.withdraw(selectedAccount.id, Number(amount)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wallet"] });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["wallet-withdrawals"] });
      setSuccess(true);
    },
    onError: (error) => {
      if (error.code === "INSUFFICIENT_AVAILABLE_BALANCE") {
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      }
    },
  });
  const invalid =
    !selectedAccount ||
    Number(amount) <= 0 ||
    Number(amount) > (data?.available ?? 0);
  const displayCurrency = (value) =>
    balanceVisible ? formatCurrency(value) : "₦••••••";
  const toggleBalance = () => {
    setBalanceVisible((visible) => !visible);
  };
  const [fundAmount, setFundAmount] = useState("");
  const funding = useMutation({
    meta: { errorToast: true },
    mutationFn: () => walletService.initializeFunding(Number(fundAmount), window.location.href),
    onSuccess: (result) => {
      if (result.authorizationUrl) window.location.assign(result.authorizationUrl);
    },
  });
  const { mutate: verifyFundingPayment, isError: verificationFailed, error: verificationError } = useMutation({
    meta: { successMessage: "Your wallet funding was verified successfully." },
    mutationFn: walletService.verifyFunding,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallet"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
      window.history.replaceState({}, "", window.location.pathname);
    },
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (reference) verifyFundingPayment(reference);
  }, [verifyFundingPayment]);
  const pendingAmount = (withdrawalRequests.data || [])
    .filter((request) => ["PENDING", "PROCESSING"].includes(request.status))
    .reduce((sum, request) => sum + Number(request.amount || 0), 0);
  const fundedTotal = (allTransactions.data || [])
    .filter((tx) => tx.type === "FUNDING" && tx.direction === "credit")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const copyFundingDetail = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Copy unavailable");
    }
  };
  return (
    <div className="page">
      <PageHeader
        eyebrow={t("money.yourMoney")}
        title={t("money.wallet")}
        description={t("money.walletDescription")}
      />
      {walletError && <QueryErrorState error={walletRequestError} title="Your wallet could not be loaded" />}
      <section className="wallet-hero">
        <div>
          <div className="wallet-hero__label">
            <span>{t("money.availableWithdraw")}</span>
            <button
              type="button"
              onClick={toggleBalance}
              aria-label={balanceVisible ? "Hide account balances" : "Show account balances"}
              aria-pressed={!balanceVisible}
            >
              {balanceVisible ? <EyeIcon /> : <EyeOffIcon />}
              {balanceVisible ? "Hide balance" : "Show balance"}
            </button>
          </div>
          {isLoading ? (
            <Skeleton className="skeleton--amount" />
          ) : (
            <strong aria-label={balanceVisible ? formatCurrency(data?.available ?? 0) : "Balance hidden"}>
              {displayCurrency(data?.available ?? 0)}
            </strong>
          )}
          <small>{t("money.updatedNow")}</small>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {t("money.withdrawMoney")} <ArrowIcon />
          </Button>
        </div>
        <WalletIcon />
      </section>
      {verificationFailed && <div className="form-error" role="alert">{verificationError.message}</div>}
      <div className="stats-grid">
        <Card className="mini-stat">
          <span>
            <UsersIconShim />
          </span>
          <div>
            <small>{t("money.inActiveAjos")}</small>
            <strong>{displayCurrency(data?.ajoBalance ?? 0)}</strong>
          </div>
        </Card>
        <Card className="mini-stat">
          <span>
            <ReceiptIcon />
          </span>
          <div>
            <small>{t("money.pendingWithdrawals")}</small>
            <strong>{displayCurrency(pendingAmount)}</strong>
          </div>
        </Card>
        <Card className="mini-stat">
          <span>
            <TrendIcon />
          </span>
          <div>
            <small>Total wallet funding</small>
            <strong>{displayCurrency(fundedTotal)}</strong>
          </div>
        </Card>
      </div>
      <BankAccountsCard />
      <Card className="funding-note">
        <span>
          <WalletIcon />
        </span>
        <div>
          <h2>{t("money.fundWallet")}</h2>
          <p>{t("money.fundWalletText")}</p>
        </div>
        <Button variant="secondary" onClick={() => setFundingOpen(true)}>
          {t("money.accountDetails")}
        </Button>
      </Card>
      <Card className="wallet-withdrawals">
        <div className="section-title section-title--compact">
          <div>
            <h2>Withdrawal requests</h2>
            <p>Track funds reserved for manual bank settlement.</p>
          </div>
        </div>
        {withdrawalRequests.isLoading ? (
          <Skeleton className="skeleton--table" />
        ) : withdrawalRequests.data?.length ? (
          <div className="wallet-withdrawals__list">
            {withdrawalRequests.data.slice(0, 4).map((request) => (
              <article key={request.id}>
                <span><BankIcon /></span>
                <div>
                  <b>{request.bankAccount.bankName} •••• {request.bankAccount.accountNumber.slice(-4)}</b>
                  <small>{formatDate(request.requestedAt)} · {request.id}</small>
                </div>
                <Badge tone={request.status === "PAID" ? "green" : request.status === "FAILED" ? "red" : "amber"}>{request.status.toLowerCase()}</Badge>
                <strong>{displayCurrency(request.amount)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="wallet-withdrawals__empty">No withdrawal requests yet.</p>
        )}
      </Card>
      <Modal
        open={fundingOpen}
        onClose={() => {
          setFundingOpen(false);
          setFundingMode("ACCOUNT");
          setCopied("");
        }}
        title="Fund your wallet"
      >
        {fundingMode === "ACCOUNT" && data?.fundingAccount?.active ? (
          <div className="funding-account">
            <div className="funding-account__intro">
              <span><WalletIcon /></span>
              <div>
                <h3>Transfer to your personal AjoPay account</h3>
                <p>Your wallet updates after Paystack verifies the transfer.</p>
              </div>
            </div>
            <dl>
              <div><dt>Bank</dt><dd>{data.fundingAccount.bankName}</dd></div>
              <div className="funding-account__number">
                <dt>Account number</dt>
                <dd>{data.fundingAccount.accountNumber}</dd>
                <button type="button" onClick={() => copyFundingDetail(data.fundingAccount.accountNumber, "Account number copied")}>Copy</button>
              </div>
              <div><dt>Account name</dt><dd>{data.fundingAccount.accountName}</dd></div>
            </dl>
            {copied && <div className="funding-account__copied" role="status"><CheckIcon /> {copied}</div>}
            <p className="secure-note"><ShieldIcon /> Only send money from an account you control. Do not share these details with anyone asking to withdraw on your behalf.</p>
            <div className="form-actions"><Button variant="secondary" onClick={() => setFundingMode("PAYSTACK")}>Fund with Paystack</Button><Button onClick={() => setFundingOpen(false)}>Done</Button></div>
          </div>
        ) : (
          <form className="modal-form" onSubmit={(event) => { event.preventDefault(); funding.mutate(); }}>
            <p>Fund your Available Wallet securely with Paystack.</p>
            {funding.isError && <div className="form-error" role="alert">{funding.error.message}</div>}
            <label>Amount (₦)<input type="number" min="1" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} required /></label>
            <Button disabled={funding.isPending || Number(fundAmount) <= 0}>{funding.isPending ? "Opening Paystack…" : "Continue to Paystack"}</Button>
          </form>
        )}
      </Modal>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSuccess(false);
          setAmount("");
        }}
        title={success ? t("money.withdrawalSubmitted") : t("money.withdrawBank")}
      >
        {success ? (
          <div className="success-panel">
            <span>
              <CheckIcon />
            </span>
            <h3>{t("money.processing")}</h3>
            <p>
              {t("money.arrival", {
                amount: formatCurrency(
                  Number(amount),
                  false,
                  i18n.resolvedLanguage,
                ),
                bank: selectedAccount?.bankName || "bank",
                last4: selectedAccount?.accountNumber.slice(-4) || "••••",
              })}
            </p>
            <Button onClick={() => setOpen(false)}>{t("money.done")}</Button>
          </div>
        ) : (
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!invalid) withdraw.mutate();
            }}
          >
            <div className="summary-box">
              <span>{t("money.availableBalance")}</span>
              <b>{formatCurrency(data?.available ?? 0)}</b>
            </div>
            <label>
              {t("money.amount")}
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("money.enterAmount")}
              />
            </label>
            {Number(amount) > (data?.available ?? 0) && (
              <div className="form-error">
                {t("money.exceeds")}
              </div>
            )}
            {withdraw.isError && <div className="form-error" role="alert">{withdraw.error.message}</div>}
            {accounts.length ? (
              <label>
                {t("money.bankAccount")}
                <select
                  value={selectedAccount?.id || ""}
                  onChange={(event) =>
                    setSelectedAccountId(event.target.value)
                  }
                >
                  {accounts.map((account) => (
                    <option value={account.id} key={account.id}>
                      {account.bankName} {maskAccountNumber(account.accountNumber)}
                      {account.isDefault ? " · Default" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="withdrawal-account-empty">
                <BankIcon />
                <div>
                  <b>Add a withdrawal account</b>
                  <small>
                    You need a bank account before you can withdraw money.
                  </small>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    setAddAccountOpen(true);
                  }}
                >
                  Add account
                </Button>
              </div>
            )}
            <p className="secure-note">
              <ShieldIcon />
              {t("money.secureNote")}
            </p>
            <Button disabled={invalid || withdraw.isPending}>
              {withdraw.isPending ? t("money.submitting") : t("money.review")}
            </Button>
          </form>
        )}
      </Modal>
      <AddBankAccountModal
        open={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onSaved={(account) => {
          setSelectedAccountId(account.id);
          setOpen(true);
        }}
      />
    </div>
  );
}
function UsersIconShim() {
  return <span aria-hidden="true">₦</span>;
}
export function TransactionsPage() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState("ALL");
  const { data = [], isLoading } = useQuery({
    queryKey: ["transactions", filter],
    queryFn: () => walletService.getTransactions(filter),
  });
  return (
    <div className="page">
      <PageHeader
        title={t("money.history")}
        description={t("money.historyText")}
      />
      <div className="filter-bar filter-bar--simple">
        <div className="tabs">
          {["ALL", "CONTRIBUTION", "PAYOUT", "WITHDRAWAL", "FUNDING"].map(
            (item) => (
              <button
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
                key={item}
              >
                {t(`money.${item.toLowerCase()}`)}
              </button>
            ),
          )}
        </div>
      </div>
      <Card className="table-card">
        <div className="data-table">
          <div className="data-table__head">
            <span>{t("money.transaction")}</span>
            <span>{t("money.date")}</span>
            <span>{t("money.status")}</span>
            <span>{t("money.amount", { defaultValue: "Amount" }).replace(" (₦)", "")}</span>
          </div>
          {isLoading ? (
            <Skeleton className="skeleton--table" />
          ) : (
            data.map((tx) => (
              <div className="data-table__row" key={tx.id}>
                <span>
                  <i className={`activity-icon activity-icon--${tx.direction}`}>
                    {tx.direction === "credit" ? (
                      <TrendIcon />
                    ) : (
                      <ReceiptIcon />
                    )}
                  </i>
                  <span>
                    <b>{tx.title}</b>
                    <small>{tx.subtitle}</small>
                  </span>
                </span>
                <span>{formatDate(tx.date, i18n.resolvedLanguage)}</span>
                <span>
                  <Badge
                    tone={
                      tx.status === "SUCCESSFUL"
                        ? "green"
                        : tx.status === "PENDING"
                          ? "amber"
                          : "red"
                    }
                  >
                    {tx.status.toLowerCase()}
                  </Badge>
                </span>
                <strong className={tx.direction}>
                  {tx.direction === "credit" ? "+" : "−"}
                  {formatCurrency(tx.amount)}
                </strong>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
