export function validateAjo(values, now = new Date()) {
    const errors = {};
    if (!values.name.trim())
        errors.name = "Enter a name for this Ajo.";
    if (values.contributionAmount <= 0)
        errors.contributionAmount = "Contribution must be greater than zero.";
    if (!Number.isInteger(values.slotCount) || values.slotCount < 2)
        errors.slotCount = "Choose at least two whole slots.";
    if (!values.startDate || new Date(values.startDate).getTime() < now.setHours(0, 0, 0, 0))
        errors.startDate = "Choose a valid future date.";
    return errors;
}
export function isValidPayoutOrder(memberIds, acceptedSlotIds) {
    if (memberIds.length !== acceptedSlotIds.length)
        return false;
    if (new Set(memberIds).size !== memberIds.length)
        return false;
    const accepted = new Set(acceptedSlotIds);
    return memberIds.every((id) => accepted.has(id));
}
