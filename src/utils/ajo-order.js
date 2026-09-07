export function reorderBySlotId(members, sourceSlotId, targetSlotId) {
  const sourceIndex = members.findIndex((member) => member.slotId === sourceSlotId);
  const targetIndex = members.findIndex((member) => member.slotId === targetSlotId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return members;

  const next = [...members];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}
