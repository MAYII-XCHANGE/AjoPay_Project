import { useState } from "react";
import { CalendarIcon, CheckIcon, WalletIcon } from "../../components/icons";
import { Badge, Button, Card } from "../../components/ui";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import {
  getContributionOutstanding,
  getRemainingPaymentTime,
  isContributionFullyPaid,
  isContributionPaymentExpired,
  validateContributionPayment,
} from "../../utils/contribution-payment";

const completedStatuses = new Set(["PAID", "COMPLETED", "LATE_COMPLETED"]);

export function ContributionPaymentCard({ contribution, paying, paymentError, onPay, onClearError }) {
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const total = Number(contribution.requiredAmount ?? contribution.amount ?? 0);
  const paid = Number(contribution.paidAmount ?? 0);
  const outstanding = getContributionOutstanding(contribution);
  const fullyPaid = isContributionFullyPaid(contribution);
  const expired = !fullyPaid && isContributionPaymentExpired(contribution);
  const validationError = validateContributionPayment(amount, contribution);
  const enteredAmount = Number(amount);
  const validPreviewAmount = Number.isFinite(enteredAmount) && enteredAmount > 0
    ? enteredAmount
    : 0;
  const remainingAfterPayment = Math.max(outstanding - validPreviewAmount, 0);
  const status = String(contribution.status || (fullyPaid ? "COMPLETED" : "PENDING"));
  const progress = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;
  const quickAmounts = [
    { label: "25%", value: Math.round(outstanding * 25) / 100 },
    { label: "50%", value: Math.round(outstanding * 50) / 100 },
    { label: "Full balance", value: outstanding },
  ];

  const selectAmount = (value) => {
    setAmount(String(Math.round(value * 100) / 100));
    setSubmitted(false);
    onClearError?.();
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!validationError) onPay(enteredAmount);
  };

  return (
    <Card className="ajo-contribution-card contribution-payment-card">
      <header className="contribution-payment-card__header">
        <span className="ajo-contribution-card__icon">
          {fullyPaid ? <CheckIcon /> : "₦"}
        </span>
        <div>
          <small>CURRENT CYCLE CONTRIBUTION</small>
          <h2>{fullyPaid ? "Contribution fully paid" : "Make a contribution payment"}</h2>
          <p>
            {contribution.paymentDeadline
              ? `Payment deadline: ${formatDateTime(contribution.paymentDeadline)}`
              : "The payment period is controlled by the current Ajo cycle."}
          </p>
        </div>
        <Badge tone={completedStatuses.has(status.toUpperCase()) ? "green" : expired ? "red" : "amber"}>
          {fullyPaid ? "fully paid" : expired ? "expired" : status.replaceAll("_", " ").toLowerCase()}
        </Badge>
      </header>

      <div className="contribution-payment-card__overview">
        <section className="contribution-payment-card__outstanding">
          <small>OUTSTANDING BALANCE</small>
          <strong>{formatCurrency(outstanding)}</strong>
          <span>{fullyPaid ? "Nothing left to pay" : "You can pay this in smaller amounts"}</span>
        </section>
        <section className="contribution-payment-card__progress">
          <dl>
            <div><dt>Total contribution</dt><dd>{formatCurrency(total)}</dd></div>
            <div><dt>Paid so far</dt><dd>{formatCurrency(paid)}</dd></div>
          </dl>
          <div className="contribution-payment-card__progress-label">
            <span>Payment progress</span><b>{progress}%</b>
          </div>
          <div className="contribution-payment-card__progress-track" aria-label={`${progress}% paid`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>
      </div>

      <div className={`contribution-payment-card__period${expired ? " expired" : ""}`}>
        <CalendarIcon />
        <span><b>{expired ? "Payment closed" : "Payment period active"}</b><small>{getRemainingPaymentTime(contribution)}</small></span>
        <strong>{contribution.paymentDeadline ? formatDateTime(contribution.paymentDeadline) : "Deadline unavailable"}</strong>
      </div>

      {!fullyPaid && !expired && (
        <form className="contribution-payment-card__form" onSubmit={submit} noValidate>
          <div className="contribution-payment-card__form-heading">
            <h3>How much would you like to pay?</h3>
            <p>Choose a quick amount or enter any amount within your outstanding balance.</p>
          </div>
          <div className="contribution-payment-card__quick-select">
            {quickAmounts.map((option) => (
              <button
                type="button"
                key={option.label}
                className={Number(amount) === option.value ? "active" : ""}
                onClick={() => selectAmount(option.value)}
              >
                <b>{option.label}</b>
                <small>{formatCurrency(option.value)}</small>
              </button>
            ))}
          </div>
          <label>
            Amount to pay
            <span className="contribution-payment-card__input">
              <b>₦</b>
              <input
                type="number"
                min="0.01"
                max={outstanding}
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setSubmitted(false);
                  onClearError?.();
                }}
                placeholder="0.00"
                aria-describedby="contribution-payment-feedback"
              />
            </span>
          </label>
          <div className="contribution-payment-card__preview">
            <small>PAYMENT PREVIEW</small>
            <div><span>You are paying</span><b>{formatCurrency(validPreviewAmount)}</b></div>
            <div><span>Balance after payment</span><b>{formatCurrency(remainingAfterPayment)}</b></div>
          </div>
          {(submitted || amount !== "") && validationError && <div id="contribution-payment-feedback" className="form-error" role="alert">{validationError}</div>}
          {paymentError && <div className="form-error" role="alert">{paymentError.message}</div>}
          <p className="contribution-payment-card__wallet-note"><WalletIcon /> Payment will be deducted from your Available Wallet.</p>
          <Button type="submit" disabled={paying}>
            {paying ? "Processing payment…" : `Pay ${formatCurrency(validPreviewAmount)}`}
          </Button>
        </form>
      )}

      {expired && <div className="form-error" role="alert">The payment period for this contribution has expired.</div>}
    </Card>
  );
}
