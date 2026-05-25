export type OrderedProfile = {
  id: string;
};

export function reorderProfilesById<T extends OrderedProfile>(
  profiles: T[],
  sourceId: string,
  targetId: string,
) {
  if (sourceId === targetId) return profiles;

  const sourceIndex = profiles.findIndex((profile) => profile.id === sourceId);
  const targetIndex = profiles.findIndex((profile) => profile.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0) return profiles;

  const nextProfiles = [...profiles];
  const [sourceProfile] = nextProfiles.splice(sourceIndex, 1);
  nextProfiles.splice(targetIndex, 0, sourceProfile);

  return nextProfiles;
}
