import { deepEqual, equal } from "node:assert/strict";
import { reorderProfilesById } from "./profileOrdering.ts";

const profiles = [
  { id: "first", name: "First" },
  { id: "second", name: "Second" },
  { id: "third", name: "Third" },
];

deepEqual(
  reorderProfilesById(profiles, "third", "first").map((profile) => profile.id),
  ["third", "first", "second"],
);

deepEqual(
  reorderProfilesById(profiles, "first", "third").map((profile) => profile.id),
  ["second", "third", "first"],
);

equal(reorderProfilesById(profiles, "second", "second"), profiles);
equal(reorderProfilesById(profiles, "missing", "first"), profiles);
equal(reorderProfilesById(profiles, "first", "missing"), profiles);
