export function migrateLegacyOwner(items, uid) {
  return items.map((item) =>
    !item.ownerUid || item.ownerUid === 'local' ? { ...item, ownerUid: uid } : item
  );
}

export function scopeByOwner(items, uid) {
  return items.filter((item) => item.ownerUid === uid);
}