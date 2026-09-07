import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { socialService } from "../../services/social-service";
import { Button, Card } from "../../components/ui";

export function RatingForm({ ajoId, participant }) {
  const [score, setScore] = useState("5");
  const [comment, setComment] = useState("");
  const rating = useMutation({
    mutationFn: () => socialService.rateParticipant(ajoId, participant.id, Number(score), comment.trim()),
    meta: { successMessage: "Rating submitted successfully." },
  });
  return <Card><form className="form-grid" onSubmit={(event) => { event.preventDefault(); rating.mutate(); }}><h3 className="full">Rate {participant.name || "participant"}</h3><label>Score<select value={score} onChange={(event) => setScore(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}</select></label><label>Comment<input value={comment} onChange={(event) => setComment(event.target.value)} maxLength="500" /></label>{rating.isError && <div className="form-error full" role="alert">{rating.error.message}</div>}<Button type="submit" disabled={rating.isPending || rating.isSuccess}>{rating.isPending ? "Submitting…" : "Submit rating"}</Button></form></Card>;
}
