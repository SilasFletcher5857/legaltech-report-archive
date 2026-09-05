import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const matterIntake = z.object({ matterId: z.string().min(1), clientName: z.string().min(1), signedDocument: z.string().min(1), deadlines: z.array(z.object({ label: z.string(), dueDate: z.string() })) });
export type MatterIntake = z.infer<typeof matterIntake>;

export function followUpState(matter: MatterIntake, today = new Date("2026-01-15")): "follow-up" | "monitor" {
  const overdue = matter.deadlines.some(item => new Date(item.dueDate) < today);
  return overdue ? "follow-up" : "monitor";
}

export async function renderAndArchive(matter: MatterIntake, client = new InfraiClient()) {
  const state = followUpState(matter);
  const markdown = `# Matter ${matter.matterId}\n\nClient: ${matter.clientName}\nSigned document: ${matter.signedDocument}\nDeadline state: ${state}\n`;
  const generated = await client.generatePdf({ markdown, page_size: "A4", orientation: "portrait", store: true });
  return { matterId: matter.matterId, state, jobId: generated.job_id ?? null };
}
