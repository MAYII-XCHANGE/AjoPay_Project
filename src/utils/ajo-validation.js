export function validateCreateAjo(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter a name for this Ajo.";
  const amount = Number(values.amount);
  if (values.amount === "" || !Number.isFinite(amount) || amount < 100) {
    errors.amount = "Contribution amount must be at least ₦100.";
  }
  if (!values.frequency || !["DAILY", "WEEKLY", "MONTHLY"].includes(values.frequency)) {
    errors.frequency = "Choose a valid contribution frequency.";
  }
  const slots = Number(values.slots);
  if (!Number.isInteger(slots) || slots < 2 || slots > 100) {
    errors.slots = "Number of slots must be between 2 and 100.";
  }
  const firstPayoutAt = new Date(values.firstPayoutAt);
  if (!values.firstPayoutAt || Number.isNaN(firstPayoutAt.getTime())) {
    errors.firstPayoutAt = "Choose the first contribution due date and payout time.";
  } else if (firstPayoutAt.getTime() <= Date.now()) {
    errors.firstPayoutAt = "The first contribution and payout must be scheduled in the future.";
  }
  const lateFee = Number(values.lateFeeAmount);
  if (values.lateFeeAmount === "" || !Number.isFinite(lateFee) || lateFee < 0) {
    errors.lateFeeAmount = "Late fee must be zero or more.";
  }
  const commission = Number(values.creatorCommissionPercent);
  if (values.creatorCommissionPercent === "" || !Number.isFinite(commission) || commission < 0 || commission > 100) {
    errors.creatorCommissionPercent = "Commission must be between 0 and 100%.";
  }
  return errors;
}

export function toApiLocalDateTime(value) {
  return value?.length === 16 ? `${value}:00` : value;
}

export function toApiLocalTime(value) {
  if (!value) return null;
  return value.length === 5 ? `${value}:00` : value;
}

export function toDateTimeInputValue(date) {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}
