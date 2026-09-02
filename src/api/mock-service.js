const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const currentUser = {
    id: "user-1",
    name: "Mayowa Adeyemi",
    email: "mayowa@example.com",
    phone: "+234 803 123 4567",
    role: "USER",
    rating: 4.8,
    completedCycles: 12,
};
let wallet = { available: 284_500, ajoBalance: 820_000, pending: 50_000 };
let ajos = [
    {
        id: "market-women",
        name: "Market Women Circle",
        description: "A trusted weekly savings circle for growing small businesses.",
        contributionAmount: 50_000,
        frequency: "WEEKLY",
        slotCount: 10,
        filledSlots: 8,
        startDate: "2026-09-12",
        status: "OPEN",
        creator: "Ngozi Okafor",
        creatorId: "user-4",
        memberCount: 8,
        category: "Business",
    },
    {
        id: "new-home",
        name: "New Home Fund",
        description: "Monthly contributions towards rent, furniture and moving costs.",
        contributionAmount: 100_000,
        frequency: "MONTHLY",
        slotCount: 8,
        filledSlots: 8,
        startDate: "2026-05-01",
        status: "ACTIVE",
        creator: "Mayowa Adeyemi",
        creatorId: "user-1",
        memberCount: 8,
        nextPayment: "2026-09-05",
        currentRound: 5,
        progress: 62,
        category: "Home",
        joined: true,
    },
    {
        id: "school-fees",
        name: "School Fees Plan",
        description: "A steady monthly plan to prepare for the next school session.",
        contributionAmount: 75_000,
        frequency: "MONTHLY",
        slotCount: 12,
        filledSlots: 9,
        startDate: "2026-10-01",
        status: "OPEN",
        creator: "Tunde Bello",
        creatorId: "user-5",
        memberCount: 9,
        category: "Education",
    },
    {
        id: "december-flex",
        name: "December Flex",
        description: "Save weekly and enjoy a more comfortable festive season.",
        contributionAmount: 20_000,
        frequency: "WEEKLY",
        slotCount: 15,
        filledSlots: 11,
        startDate: "2026-09-18",
        status: "OPEN",
        creator: "Sade Williams",
        creatorId: "user-7",
        memberCount: 11,
        category: "Lifestyle",
    },
];
let transactions = [
    { id: "tx-1", title: "New Home Fund", subtitle: "Monthly contribution", amount: 100_000, direction: "debit", status: "SUCCESSFUL", date: "2026-09-01T09:20:00Z", type: "CONTRIBUTION" },
    { id: "tx-2", title: "Wallet funded", subtitle: "Bank transfer", amount: 250_000, direction: "credit", status: "SUCCESSFUL", date: "2026-08-29T13:12:00Z", type: "FUNDING" },
    { id: "tx-3", title: "Family Support Circle", subtitle: "Round 6 payout", amount: 600_000, direction: "credit", status: "SUCCESSFUL", date: "2026-08-20T16:30:00Z", type: "PAYOUT" },
    { id: "tx-4", title: "Bank withdrawal", subtitle: "GTBank • 8842", amount: 120_000, direction: "debit", status: "PENDING", date: "2026-08-18T11:05:00Z", type: "WITHDRAWAL" },
];
let notifications = [
    { id: "n-1", title: "Contribution received", message: "Your ₦100,000 contribution to New Home Fund was successful.", date: "2026-09-01T09:21:00Z", read: false, kind: "payment" },
    { id: "n-2", title: "Your payout is getting closer", message: "You are number 6 in New Home Fund. Three payouts to go.", date: "2026-08-30T12:00:00Z", read: false, kind: "group" },
    { id: "n-3", title: "Withdrawal is being processed", message: "Your ₦120,000 withdrawal should arrive within one business day.", date: "2026-08-18T11:06:00Z", read: true, kind: "system" },
];
const requests = [
    { id: "req-1", user: { id: "u8", name: "Amina Yusuf", email: "amina@example.com", phone: "+234 805 111 2233", role: "USER", rating: 4.9, completedCycles: 8 }, slots: 1, preferredPositions: [3], requestedAt: "2026-09-01" },
    { id: "req-2", user: { id: "u9", name: "Chidi Eze", email: "chidi@example.com", phone: "+234 806 222 3344", role: "USER", rating: 4.6, completedCycles: 5 }, slots: 2, preferredPositions: [5, 7], requestedAt: "2026-08-31" },
];
export const mockApi = {
    async login(email, _password) {
        void _password;
        await wait();
        return { ...currentUser, email };
    },
    async register(name, email) {
        await wait();
        return { ...currentUser, name, email };
    },
    async profile() {
        await wait(200);
        return currentUser;
    },
    async wallet() {
        await wait();
        return wallet;
    },
    async getAjos() {
        await wait();
        return [...ajos];
    },
    async getAjo(id) {
        await wait();
        const ajo = ajos.find((item) => item.id === id);
        if (!ajo)
            throw new Error("Ajo not found");
        return ajo;
    },
    async createAjo(input) {
        await wait(700);
        const created = { ...input, id: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), filledSlots: 1, status: "OPEN", creator: currentUser.name, creatorId: currentUser.id, memberCount: 1 };
        ajos = [created, ...ajos];
        return created;
    },
    async requestToJoin(id, slots) {
        await wait(650);
        ajos = ajos.map((ajo) => ajo.id === id ? { ...ajo, joined: true, filledSlots: Math.min(ajo.slotCount, ajo.filledSlots + slots) } : ajo);
        return { success: true };
    },
    async transactions() {
        await wait();
        return [...transactions];
    },
    async notifications() {
        await wait();
        return [...notifications];
    },
    async markNotificationRead(id) {
        notifications = notifications.map((item) => item.id === id ? { ...item, read: true } : item);
        return { success: true };
    },
    async withdraw(amount) {
        await wait(800);
        if (amount > wallet.available)
            throw new Error("Insufficient balance");
        wallet = { ...wallet, available: wallet.available - amount, pending: wallet.pending + amount };
        transactions = [{ id: `tx-${Date.now()}`, title: "Bank withdrawal", subtitle: "GTBank • 8842", amount, direction: "debit", status: "PENDING", date: new Date().toISOString(), type: "WITHDRAWAL" }, ...transactions];
        return { success: true };
    },
    async requests() {
        await wait();
        return requests;
    },
};
