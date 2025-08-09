// @ts-ignore
import { Summary } from "../generated/schema";
// @ts-ignore
import { SummarySaved } from "../generated/SummaryVault/SummaryVault";

export function handleSummarySaved(event: SummarySaved): void {
  const id = event.params.id;
  let entity = new Summary(id);
  entity.user = event.params.user;
  entity.summaryId = event.params.id;
  entity.title = event.params.title;
  entity.timestamp = event.params.timestamp;
  entity.save();
} 