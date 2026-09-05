import { matterIntake, renderAndArchive } from "./legal_report.js";

const input = matterIntake.parse({ matterId: "M-1042", clientName: "North Clinic", signedDocument: "consent.pdf", deadlines: [{ label: "response", dueDate: "2026-01-10" }] });
const result = await renderAndArchive(input);
console.log(JSON.stringify(result));
