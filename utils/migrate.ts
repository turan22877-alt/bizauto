export function migrateLegacyOwner<T extends { ownerUid: string }>(items: T[], uid: string): T[] {
  return items.map((item) =>
    !item.ownerUid || item.ownerUid === 'local' ? { ...item, ownerUid: uid } : item
  );
}

export function scopeByOwner<T extends { ownerUid: string }>(items: T[], uid: string): T[] {
  return items.filter((item) => item.ownerUid === uid);
}
