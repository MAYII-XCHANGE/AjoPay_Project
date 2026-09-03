import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { mockApi } from "../../api/mock-service";
import {
  AlertIcon,
  BankIcon,
  CheckIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
} from "../../components/icons";
import { Badge, Button, Card, Modal } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { maskAccountNumber } from "./bank-account-utils";
import "./bank-accounts.css";

export function AddBankAccountModal({ open, onClose, onSaved }) {
  const { user, saveBankAccount } = useAuth();
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [makeDefault, setMakeDefault] = useState(true);
  const [resolvedAccount, setResolvedAccount] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const accounts = user?.bankAccounts || [];
  const { data: banks = [], isLoading: banksLoading } = useQuery({
    queryKey: ["wallet-banks"],
    queryFn: mockApi.getBanks,
    enabled: open,
  });
  const selectedBank = banks.find((bank) => bank.code === bankCode);
  const numberIsValid = /^\d{10}$/.test(accountNumber);
  const resolveAccount = useMutation({
    mutationFn: () =>
      mockApi.resolveBankAccount({ bankCode, accountNumber, user }),
    onSuccess: (result) => {
      setResolvedAccount(result);
      setError("");
    },
    onError: (requestError) => {
      setResolvedAccount(null);
      setError(requestError.message || "We couldn’t verify this account.");
    },
  });

  const clearForm = () => {
    setBankCode("");
    setAccountNumber("");
    setMakeDefault(true);
    setResolvedAccount(null);
    setError("");
    resolveAccount.reset();
  };

  const resetAndClose = () => {
    if (busy || resolveAccount.isPending) return;
    clearForm();
    onClose();
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    setError("");
    if (!selectedBank) return setError("Select your bank.");
    if (!numberIsValid) return setError("Enter a valid 10-digit account number.");
    if (!resolvedAccount)
      return setError("Verify the account name before saving.");
    if (accounts.some((account) => account.bankCode === bankCode && account.accountNumber === accountNumber)) {
      return setError("This bank account has already been added.");
    }

    setBusy(true);
    try {
      const created = await saveBankAccount({
        ...resolvedAccount,
        isDefault: makeDefault || accounts.length === 0,
      });
      onSaved?.(created);
      clearForm();
      onClose();
    } catch (saveError) {
      setError(saveError.message || "We couldn’t save this account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={() => resetAndClose()} title="Add withdrawal account">
      <form className="bank-account-form" onSubmit={saveAccount} noValidate>
        <div className="bank-account-form__intro">
          <span><BankIcon /></span>
          <div>
            <h3>Where should we send your withdrawals?</h3>
            <p>Add a personal Nigerian bank account in your own name.</p>
          </div>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label>
          Bank
          <select value={bankCode} onChange={(event) => { setBankCode(event.target.value); setResolvedAccount(null); setError(""); }} required disabled={banksLoading}>
            <option value="">{banksLoading ? "Loading banks…" : "Select bank"}</option>
            {banks.map((bank) => <option value={bank.code} key={bank.code}>{bank.name}</option>)}
          </select>
        </label>
        <label>
          Account number
          <input
            value={accountNumber}
            onChange={(event) => { setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10)); setResolvedAccount(null); setError(""); }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="10-digit account number"
            aria-invalid={Boolean(accountNumber) && !numberIsValid}
          />
          <small>{accountNumber.length}/10 digits</small>
        </label>
        <Button
          type="button"
          variant="secondary"
          className="bank-account-form__resolve"
          disabled={!selectedBank || !numberIsValid || resolveAccount.isPending}
          onClick={() => resolveAccount.mutate()}
        >
          {resolveAccount.isPending ? "Verifying account…" : "Verify account name"}
        </Button>
        <div className={`bank-account-form__name ${resolvedAccount ? "is-ready" : ""}`}>
          <span>{resolvedAccount ? <CheckIcon /> : <ShieldIcon />}</span>
          <div>
            <small>PAYSTACK NAME ENQUIRY</small>
            <b>{resolvedAccount?.accountName || "Verify to confirm the account name"}</b>
          </div>
        </div>
        <label className="bank-account-form__check">
          <input type="checkbox" checked={makeDefault} onChange={(event) => setMakeDefault(event.target.checked)} />
          Use as my default withdrawal account
        </label>
        <div className="bank-account-form__actions">
          <Button type="button" variant="secondary" onClick={resetAndClose} disabled={busy || resolveAccount.isPending}>Cancel</Button>
          <Button type="submit" disabled={busy || !resolvedAccount}>{busy ? "Saving account…" : "Save verified account"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function BankAccountsCard({ title = "Withdrawal accounts", description = "Manage where your wallet withdrawals are sent." }) {
  const { user, setDefaultBankAccount, removeBankAccount } = useAuth();
  const accounts = useMemo(() => user?.bankAccounts || [], [user?.bankAccounts]);
  const [addOpen, setAddOpen] = useState(false);
  const [removeAccount, setRemoveAccount] = useState(null);
  const [busyId, setBusyId] = useState("");

  const setDefault = async (id) => {
    setBusyId(id);
    try {
      await setDefaultBankAccount(id);
    } finally {
      setBusyId("");
    }
  };

  const remove = async () => {
    if (!removeAccount) return;
    setBusyId(removeAccount.id);
    try {
      await removeBankAccount(removeAccount.id);
      setRemoveAccount(null);
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <Card className="bank-accounts-card">
        <div className="bank-accounts-card__head">
          <span><BankIcon /></span>
          <div><h2>{title}</h2><p>{description}</p></div>
          <Button variant="secondary" onClick={() => setAddOpen(true)}><PlusIcon /> Add account</Button>
        </div>
        {accounts.length ? (
          <div className="bank-accounts-card__list">
            {accounts.map((account) => (
              <article key={account.id}>
                <span className="bank-accounts-card__bank"><BankIcon /></span>
                <div>
                  <div><b>{account.bankName}</b>{account.isDefault && <Badge tone="green">Default</Badge>}</div>
                  <strong>{maskAccountNumber(account.accountNumber)}</strong>
                  <small>{account.accountName} · {account.verified ? "Verified" : "Pending verification"}</small>
                </div>
                <div className="bank-accounts-card__actions">
                  {!account.isDefault && <button type="button" onClick={() => setDefault(account.id)} disabled={Boolean(busyId)}>Make default</button>}
                  <button type="button" className="danger" onClick={() => setRemoveAccount(account)} disabled={Boolean(busyId)} aria-label={`Remove ${account.bankName} account`}><TrashIcon /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bank-accounts-card__empty">
            <BankIcon />
            <div><b>No withdrawal account yet</b><p>Add a bank account before making your first withdrawal.</p></div>
            <Button onClick={() => setAddOpen(true)}>Add bank account</Button>
          </div>
        )}
      </Card>
      <AddBankAccountModal open={addOpen} onClose={() => setAddOpen(false)} />
      <Modal open={Boolean(removeAccount)} onClose={() => !busyId && setRemoveAccount(null)} title="Remove bank account?">
        <div className="bank-account-remove">
          <span><AlertIcon /></span>
          <p>You will no longer be able to withdraw to <b>{removeAccount?.bankName} {maskAccountNumber(removeAccount?.accountNumber)}</b>.</p>
          <div><Button variant="secondary" onClick={() => setRemoveAccount(null)} disabled={Boolean(busyId)}>Cancel</Button><Button variant="danger" onClick={remove} disabled={Boolean(busyId)}>{busyId ? "Removing…" : "Remove account"}</Button></div>
        </div>
      </Modal>
    </>
  );
}
