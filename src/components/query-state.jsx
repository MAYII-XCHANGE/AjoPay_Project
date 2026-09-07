import { AlertIcon } from "./icons";
import { Card, EmptyState } from "./ui";

export function QueryErrorState({ error, title = "We couldn’t load this information" }) {
  return <Card><EmptyState icon={<AlertIcon />} title={title} text={error?.message || "Check your connection and try again."} /></Card>;
}
