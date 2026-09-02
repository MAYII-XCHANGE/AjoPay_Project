import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mockApi } from "../api/mock-service";
import { CheckIcon, PlusIcon, SearchIcon, ShieldIcon } from "../components/icons";
import { Badge, Button, Card, Modal, PageHeader, Skeleton } from "../components/ui";
import { AjoCard } from "../features/ajo/ajo-card";
import { useAuth } from "../contexts/auth-context";
import { formatCurrency, formatDate, frequencyLabel } from "../utils/formatters";
export function FindAjoPage({ publicView = false }) {
    const [search, setSearch] = useState("");
    const [frequency, setFrequency] = useState("ALL");
    const { data = [], isLoading } = useQuery({ queryKey: ["ajos"], queryFn: mockApi.getAjos });
    const filtered = data.filter((ajo) => ajo.status === "OPEN" && ajo.name.toLowerCase().includes(search.toLowerCase()) && (frequency === "ALL" || ajo.frequency === frequency));
    const content = <><PageHeader eyebrow="DISCOVER" title="Find the right Ajo for you" description="Explore trusted savings circles that fit your goals and budget." action={!publicView && <Link to="/ajos/create" className="button button--primary"><PlusIcon />Create an Ajo</Link>}/><div className="filter-bar"><label><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or goal"/></label><select value={frequency} onChange={(event) => setFrequency(event.target.value)} aria-label="Filter by frequency"><option value="ALL">All frequencies</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="DAILY">Daily</option></select></div><div className="results-head"><span>{filtered.length} Ajos available</span><small>All circles are reviewed by our team</small></div><div className="ajo-grid ajo-grid--three">{isLoading ? [1, 2, 3].map((n) => <Skeleton className="skeleton--card" key={n}/>) : filtered.map((ajo) => <AjoCard ajo={ajo} key={ajo.id}/>)}</div></>;
    if (publicView)
        return <div className="public-list"><header><Link to="/" className="text-link">← AjoPay home</Link><div><Link to="/login">Log in</Link><Link to="/register" className="button button--primary">Create account</Link></div></header><main className="page">{content}</main></div>;
    return <div className="page">{content}</div>;
}
export function MyAjosPage() {
    const [tab, setTab] = useState("active");
    const { data = [], isLoading } = useQuery({ queryKey: ["user-ajos"], queryFn: mockApi.getAjos });
    const mine = tab === "created" ? data.filter((ajo) => ajo.creatorId === "user-1") : tab === "available" ? data.filter((ajo) => ajo.status === "OPEN") : data.filter((ajo) => ajo.joined);
    return <div className="page"><PageHeader eyebrow="YOUR CIRCLES" title="My Ajos" description="Everything you’re saving towards, all in one place." action={<Link to="/ajos/create" className="button button--primary"><PlusIcon />Create an Ajo</Link>}/><div className="tabs">{[["active", "Active"], ["created", "Created by me"], ["available", "Explore"]].map(([value, label]) => <button className={tab === value ? "active" : ""} onClick={() => setTab(value)} key={value}>{label}</button>)}</div><div className="ajo-grid">{isLoading ? <Skeleton className="skeleton--card"/> : mine.map((ajo) => <AjoCard key={ajo.id} ajo={ajo}/>)}</div></div>;
}
export function AjoDetailPage() {
    const { ajoId = "" } = useParams();
    const [joinOpen, setJoinOpen] = useState(false);
    const [slots, setSlots] = useState(1);
    const [success, setSuccess] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: ajo, isLoading } = useQuery({ queryKey: ["ajo", ajoId], queryFn: () => mockApi.getAjo(ajoId) });
    const join = useMutation({ mutationFn: () => mockApi.requestToJoin(ajoId, slots), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["ajo", ajoId] }); await queryClient.invalidateQueries({ queryKey: ["ajos"] }); setSuccess(true); } });
    if (isLoading || !ajo)
        return <div className="page"><Skeleton className="skeleton--hero"/></div>;
    const available = ajo.slotCount - ajo.filledSlots;
    const isOwner = ajo.creatorId === user?.id;
    return <div className="page"><Link to="/find-ajo" className="back-link">← Back to Ajos</Link><section className="detail-hero"><div><Badge tone={ajo.status === "ACTIVE" ? "blue" : "green"}>{ajo.status === "ACTIVE" ? "Active circle" : "Open to join"}</Badge><h1>{ajo.name}</h1><p>{ajo.description}</p><span>Created by <b>{ajo.creator}</b> • ★ 4.9</span></div><Card><small>Contribution</small><strong>{formatCurrency(ajo.contributionAmount)}</strong><span>{frequencyLabel[ajo.frequency]}</span>{isOwner ? <Link to={`/ajos/${ajo.id}/manage`} className="button button--primary">Manage this Ajo</Link> : ajo.joined ? <Button disabled><CheckIcon /> Request submitted</Button> : <Button onClick={() => setJoinOpen(true)} disabled={!available}>Request to join</Button>}<small><ShieldIcon />Your money stays protected in your wallet.</small></Card></section><div className="detail-grid"><Card><h2>Circle details</h2><dl><div><dt>Members</dt><dd>{ajo.filledSlots} of {ajo.slotCount}</dd></div><div><dt>Available slots</dt><dd>{available}</dd></div><div><dt>Starts</dt><dd>{formatDate(ajo.startDate)}</dd></div><div><dt>Frequency</dt><dd>{frequencyLabel[ajo.frequency]}</dd></div><div><dt>Total payout</dt><dd>{formatCurrency(ajo.contributionAmount * ajo.slotCount)}</dd></div><div><dt>Late-payment grace</dt><dd>2 days</dd></div></dl></Card><Card><h2>How your cycle works</h2><ol className="timeline"><li><i>1</i><span><b>Join the circle</b><small>Request your slot and preferred payout turn.</small></span></li><li><i>2</i><span><b>Contribute on schedule</b><small>Pay {formatCurrency(ajo.contributionAmount)} {frequencyLabel[ajo.frequency].toLowerCase()}.</small></span></li><li><i>3</i><span><b>Receive your payout</b><small>Get {formatCurrency(ajo.contributionAmount * ajo.slotCount)} when it’s your turn.</small></span></li></ol></Card></div><Modal open={joinOpen} onClose={() => { setJoinOpen(false); setSuccess(false); }} title={success ? "Request sent" : `Join ${ajo.name}`}>{success ? <div className="success-panel"><span><CheckIcon /></span><h3>You’re one step closer</h3><p>{ajo.creator} will review your request. We’ll let you know as soon as there’s an update.</p><Button onClick={() => setJoinOpen(false)}>Done</Button></div> : <form className="modal-form" onSubmit={(event) => { event.preventDefault(); join.mutate(); }}><p>Choose the number of slots you want. You won’t be charged until the circle starts.</p><label>Number of slots<select value={slots} onChange={(event) => setSlots(Number(event.target.value))}>{Array.from({ length: available }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} slot{index ? "s" : ""}</option>)}</select></label><label>Preferred payout position<select><option>Any available position</option>{Array.from({ length: ajo.slotCount }, (_, index) => <option key={index + 1}>Position {index + 1}</option>)}</select></label><div className="summary-box"><span>Contribution</span><b>{formatCurrency(ajo.contributionAmount * slots)} {frequencyLabel[ajo.frequency].toLowerCase()}</b></div><Button disabled={join.isPending} type="submit">{join.isPending ? "Sending request…" : "Send request"}</Button></form>}</Modal></div>;
}
export function CreateAjoPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [values, setValues] = useState({ name: "", amount: "", frequency: "MONTHLY", slots: "", date: "", category: "Business", description: "" });
    const mutation = useMutation({ mutationFn: () => mockApi.createAjo({ name: values.name, description: values.description || "A trusted savings circle.", contributionAmount: Number(values.amount), frequency: values.frequency, slotCount: Number(values.slots), startDate: values.date, category: values.category }), onSuccess: (ajo) => navigate(`/ajos/${ajo.id}`) });
    const submit = (event) => { event.preventDefault(); if (!values.name || Number(values.amount) <= 0 || Number(values.slots) < 2 || !values.date) {
        setError("Please complete all required fields with valid values.");
        return;
    } if (new Date(values.date) < new Date()) {
        setError("The start date must be in the future.");
        return;
    } mutation.mutate(); };
    const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));
    return <div className="page page--narrow"><Link to="/my-ajos" className="back-link">← Back to My Ajos</Link><PageHeader eyebrow="NEW SAVINGS CIRCLE" title="Create an Ajo" description="Set the rules clearly so everyone knows exactly what to expect."/><form className="create-form" onSubmit={submit}><Card><h2>About this Ajo</h2><div className="form-grid"><label>Ajo name *<input value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. New Car Fund"/></label><label>Goal or category<select value={values.category} onChange={(e) => set("category", e.target.value)}><option>Business</option><option>Home</option><option>Education</option><option>Lifestyle</option><option>Emergency</option></select></label><label className="full">Short description<textarea value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell members what you’re saving towards"/></label></div></Card><Card><h2>Contribution details</h2><div className="form-grid"><label>Contribution amount (₦) *<input type="number" value={values.amount} onChange={(e) => set("amount", e.target.value)} placeholder="50,000" min="1"/></label><label>Frequency *<select value={values.frequency} onChange={(e) => set("frequency", e.target.value)}><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select></label><label>Number of slots *<input type="number" value={values.slots} onChange={(e) => set("slots", e.target.value)} min="2" max="50" placeholder="10"/></label><label>First contribution date *<input type="date" value={values.date} onChange={(e) => set("date", e.target.value)}/></label></div>{values.amount && values.slots && <div className="payout-preview"><span>Estimated payout each turn</span><strong>{formatCurrency(Number(values.amount) * Number(values.slots))}</strong></div>}</Card>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-actions"><Link to="/my-ajos" className="button button--secondary">Cancel</Link><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating…" : "Create Ajo"}</Button></div></form></div>;
}
