import assert from "node:assert/strict";
import { followUpState, matterIntake } from "./legal_report.js";

const matter = matterIntake.parse({ matterId: "M-1", clientName: "Clinic", signedDocument: "signed.pdf", deadlines: [{ label: "filing", dueDate: "2026-01-10" }] });
assert.equal(followUpState(matter, new Date("2026-01-15")), "follow-up");
console.log("follow-up decision passed");
