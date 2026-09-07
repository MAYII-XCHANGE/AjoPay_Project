export function isAjoCreator(ajo, currentUser) {
  if (!ajo || !currentUser) return false;
  if (ajo.creatorId) return ajo.creatorId === currentUser.id;
  return ajo.canManage === true;
}
