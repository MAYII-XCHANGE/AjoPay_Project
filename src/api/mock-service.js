const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const demoOtp = "123456";
let pendingRegistration = null;
let pendingPasswordReset = null;
let following = new Set();
const followerCounts = { "user-4": 684, "user-5": 421, "user-7": 930 };
let currentUser = {
    id: "user-1",
    name: "Mayowa Adeyemi",
    email: "mayowa@example.com",
    phone: "+234 803 123 4567",
    role: "USER",
    rating: 4.8,
    completedCycles: 12,
    followersCount: 248,
    joinedAt: "2025-03-18",
    dateOfBirth: "",
    address: "",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    accountStatus: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    identityVerified: true,
    twoFactorEnabled: false,
    preferences: {
        contributionReminders: true,
        payoutUpdates: true,
        groupNotifications: true,
        productNews: false,
    },
    bankAccounts: [
        { id: "bank-1", bankCode: "058", bankName: "GTBank", accountNumber: "0000008842", accountName: "Mayowa Adeyemi", isDefault: true, verified: true },
    ],
};
let wallet = { available: 284_500, ajoBalance: 820_000, pending: 50_000 };
const supportedBanks = [
    { code: "058", name: "GTBank" },
    { code: "044", name: "Access Bank" },
    { code: "033", name: "United Bank for Africa" },
    { code: "057", name: "Zenith Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "070", name: "Fidelity Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "999992", name: "OPay" },
    { code: "090267", name: "Kuda Bank" },
    { code: "50515", name: "Moniepoint" },
];
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
        memberIds: [],
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
        currentCycleId: "cycle-new-home-2026",
        progress: 62,
        category: "Home",
        memberIds: ["user-1"],
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
        memberIds: [],
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
        memberIds: [],
        category: "Lifestyle",
    },
];
let transactions = [
    { id: "tx-1", title: "New Home Fund", subtitle: "Monthly contribution", amount: 100_000, direction: "debit", status: "SUCCESSFUL", date: "2026-09-01T09:20:00Z", type: "CONTRIBUTION" },
    { id: "tx-2", title: "Wallet funded", subtitle: "Bank transfer", amount: 250_000, direction: "credit", status: "SUCCESSFUL", date: "2026-08-29T13:12:00Z", type: "FUNDING" },
    { id: "tx-3", title: "Family Support Circle", subtitle: "Round 6 payout", amount: 600_000, direction: "credit", status: "SUCCESSFUL", date: "2026-08-20T16:30:00Z", type: "PAYOUT" },
    { id: "tx-4", title: "Bank withdrawal", subtitle: "GTBank • 8842", amount: 120_000, direction: "debit", status: "PENDING", date: "2026-08-18T11:05:00Z", type: "WITHDRAWAL" },
];
let withdrawals = [
    { id: "WD-1043", user: { id: "user-1", name: "Mayowa Adeyemi", email: "mayowa@example.com" }, amount: 50_000, bankAccount: { bankName: "GTBank", accountNumber: "0000008842" }, requestedAt: "2026-09-02T08:42:00Z", status: "PENDING", initiatedAt: null, settledAt: null },
    { id: "WD-1042", user: { id: "u12", name: "Kemi Adeola", email: "kemi@example.com" }, amount: 450_000, bankAccount: { bankName: "Access Bank", accountNumber: "0000001021" }, requestedAt: "2026-09-03T08:18:00Z", status: "PENDING", initiatedAt: null, settledAt: null },
    { id: "WD-1041", user: { id: "u13", name: "Ibrahim Musa", email: "ibrahim@example.com" }, amount: 180_000, bankAccount: { bankName: "GTBank", accountNumber: "0000006720" }, requestedAt: "2026-09-03T07:56:00Z", status: "PROCESSING", initiatedAt: "2026-09-03T08:10:00Z", settledAt: null },
];
let contributions = [
    { id: "CON-501", cycleId: "cycle-new-home-2026", ajoId: "new-home", participant: { id: "user-1", name: "Mayowa Adeyemi" }, amount: 100_000, dueDate: "2026-09-05T12:00:00Z", status: "DUE", paidAt: null },
    { id: "CON-500", cycleId: "cycle-new-home-2026", ajoId: "new-home", participant: { id: "u8", name: "Amina Yusuf" }, amount: 100_000, dueDate: "2026-09-05T12:00:00Z", status: "PAID", paidAt: "2026-09-02T09:12:00Z" },
];
let notifications = [
    { id: "n-1", title: "Contribution received", message: "Your ₦100,000 contribution to New Home Fund was successful.", date: "2026-09-01T09:21:00Z", read: false, kind: "payment" },
    { id: "n-2", title: "Your payout is getting closer", message: "You are number 6 in New Home Fund. Three payouts to go.", date: "2026-08-30T12:00:00Z", read: false, kind: "group" },
    { id: "n-3", title: "Withdrawal is being processed", message: "Your ₦120,000 withdrawal should arrive within one business day.", date: "2026-08-18T11:06:00Z", read: true, kind: "system" },
];
let joinRequests = [
    { id: "req-1", ajoId: "market-women", user: { id: "u8", name: "Amina Yusuf", email: "amina@example.com", phone: "+234 805 111 2233", role: "USER", rating: 4.9, completedCycles: 8 }, slots: 1, preferredPositions: [3], requestedAt: "2026-09-01T10:30:00Z", status: "PENDING", reviewedAt: null },
    { id: "req-2", ajoId: "school-fees", user: { id: "u9", name: "Chidi Eze", email: "chidi@example.com", phone: "+234 806 222 3344", role: "USER", rating: 4.6, completedCycles: 5 }, slots: 2, preferredPositions: [5, 7], requestedAt: "2026-08-31T14:10:00Z", status: "PENDING", reviewedAt: null },
];
let supportIssues = [
    { id: "ISS-104", user: { id: "u9", name: "Chidi Eze", email: "chidi@example.com" }, type: "DISPUTE", subject: "Contribution marked late", description: "My transfer was completed before the deadline but the contribution still shows as late.", status: "OPEN", resolution: "", createdAt: "2026-09-02T12:30:00Z", updatedAt: "2026-09-02T12:30:00Z" },
    { id: "ISS-103", user: { id: "user-1", name: "Mayowa Adeyemi", email: "mayowa@example.com" }, type: "SYSTEM", subject: "Notification arrived twice", description: "I received the same payout notification two times.", status: "IN_REVIEW", resolution: "Engineering is reviewing notification delivery logs.", createdAt: "2026-08-30T09:15:00Z", updatedAt: "2026-09-01T11:20:00Z" },
];

const withMembership = (ajo, userId) => ({
    ...ajo,
    joined: Boolean(userId && ajo.memberIds?.includes(userId)),
});

const withAjoDetails = (request) => {
    const ajo = ajos.find((item) => item.id === request.ajoId);
    return {
        ...request,
        user: { ...request.user },
        ajo: ajo ? { id: ajo.id, name: ajo.name, creator: ajo.creator, creatorId: ajo.creatorId } : null,
    };
};
export const mockApi = {
    async login(email, _password) {
        void _password;
        await wait();
        if (pendingRegistration?.email === email)
            throw new Error("Verify your email address before signing in.");
        return { ...currentUser, email };
    },
    async register(name, email) {
        await wait();
        pendingRegistration = {
            ...currentUser,
            id: `user-${Date.now()}`,
            name,
            email,
            phone: "",
            rating: 0,
            completedCycles: 0,
            followersCount: 0,
            joinedAt: new Date().toISOString(),
            dateOfBirth: "",
            address: "",
            city: "",
            state: "",
            bankAccounts: [],
            emailVerified: false,
            phoneVerified: false,
            identityVerified: false,
            accountStatus: "PENDING_VERIFICATION",
            walletActive: false,
        };
        return { email, expiresInSeconds: 600, purpose: "REGISTRATION" };
    },
    async requestRegistrationOtp(email) {
        await wait(350);
        if (!pendingRegistration || pendingRegistration.email !== email)
            throw new Error("Start registration before requesting a verification code.");
        return { email, expiresInSeconds: 600, purpose: "REGISTRATION" };
    },
    async verifyRegistrationOtp(email, otp) {
        await wait(500);
        if (!pendingRegistration || pendingRegistration.email !== email || otp !== demoOtp)
            throw new Error("The verification code is invalid or has expired.");
        currentUser = {
            ...pendingRegistration,
            emailVerified: true,
            accountStatus: "ACTIVE",
            walletActive: true,
        };
        pendingRegistration = null;
        return { ...currentUser };
    },
    async requestPasswordResetOtp(email) {
        await wait(400);
        pendingPasswordReset = { email, otpConfirmed: false };
        return { email, expiresInSeconds: 600, purpose: "PASSWORD_RESET" };
    },
    async confirmPasswordResetOtp(email, otp) {
        await wait(450);
        if (!pendingPasswordReset || pendingPasswordReset.email !== email || otp !== demoOtp)
            throw new Error("The reset code is invalid or has expired.");
        pendingPasswordReset = { ...pendingPasswordReset, otpConfirmed: true };
        return { resetToken: `reset-${Date.now()}` };
    },
    async resetPassword(email, resetToken, _password) {
        void _password;
        await wait(500);
        if (!pendingPasswordReset?.otpConfirmed || pendingPasswordReset.email !== email || !resetToken)
            throw new Error("Confirm your reset code before choosing a new password.");
        pendingPasswordReset = null;
        return { success: true };
    },
    async profile() {
        await wait(200);
        return { ...currentUser };
    },
    async updateProfile(updates) {
        await wait(650);
        currentUser = { ...currentUser, ...updates };
        return { ...currentUser };
    },
    async getFollowerSummary(userId, viewerId) {
        await wait(220);
        return {
            count: (followerCounts[userId] || 0) + [...following].filter((pair) => pair.endsWith(`:${userId}`)).length,
            isFollowing: following.has(`${viewerId}:${userId}`),
        };
    },
    async followUser(userId, viewerId) {
        await wait(350);
        following = new Set(following).add(`${viewerId}:${userId}`);
        return { success: true };
    },
    async unfollowUser(userId, viewerId) {
        await wait(350);
        const next = new Set(following);
        next.delete(`${viewerId}:${userId}`);
        following = next;
        return { success: true };
    },
    async changePassword() {
        await wait(750);
        return { success: true };
    },
    async logoutAllDevices() {
        await wait(650);
        return { success: true };
    },
    async deleteAccount() {
        await wait(850);
        return { success: true };
    },
    async wallet() {
        await wait();
        return wallet;
    },
    async fundingAccount(user) {
        await wait(300);
        return {
            bankName: "Wema Bank",
            accountNumber: "0123456789",
            accountName: `AjoPay / ${user?.name || currentUser.name}`,
            reference: `AJO-${user?.id || currentUser.id}`.toUpperCase(),
            provider: "Paystack",
        };
    },
    async getBanks() {
        await wait(250);
        return supportedBanks.map((bank) => ({ ...bank }));
    },
    async resolveBankAccount({ bankCode, accountNumber, user }) {
        await wait(550);
        const bank = supportedBanks.find((item) => item.code === bankCode);
        if (!bank || !/^\d{10}$/.test(accountNumber))
            throw new Error("Enter a valid bank and 10-digit account number.");
        return {
            bankCode,
            bankName: bank.name,
            accountNumber,
            accountName: user?.name || currentUser.name,
            recipientCode: `RCP_${bankCode}_${accountNumber.slice(-4)}`,
            verified: true,
        };
    },
    async saveBankAccount(user, account) {
        await wait(450);
        if (!account?.verified || !account?.recipientCode)
            throw new Error("Verify this account before saving it.");
        const accounts = user?.bankAccounts || [];
        if (accounts.some((item) => item.bankCode === account.bankCode && item.accountNumber === account.accountNumber))
            throw new Error("This bank account has already been added.");
        const created = {
            ...account,
            id: `bank-${Date.now()}`,
            isDefault: account.isDefault || accounts.length === 0,
        };
        const bankAccounts = [
            ...accounts.map((item) => ({ ...item, isDefault: created.isDefault ? false : item.isDefault })),
            created,
        ];
        currentUser = { ...currentUser, ...user, bankAccounts };
        return { user: { ...currentUser }, account: { ...created } };
    },
    async setDefaultBankAccount(user, id) {
        await wait(350);
        const bankAccounts = (user?.bankAccounts || []).map((account) => ({ ...account, isDefault: account.id === id }));
        currentUser = { ...currentUser, ...user, bankAccounts };
        return { ...currentUser };
    },
    async removeBankAccount(user, id) {
        await wait(350);
        const bankAccounts = (user?.bankAccounts || []).filter((account) => account.id !== id);
        if (bankAccounts.length && !bankAccounts.some((account) => account.isDefault))
            bankAccounts[0] = { ...bankAccounts[0], isDefault: true };
        currentUser = { ...currentUser, ...user, bankAccounts };
        return { ...currentUser };
    },
    async getAjos(userId) {
        await wait();
        return ajos.map((ajo) => withMembership(ajo, userId));
    },
    async getAjo(id, userId) {
        await wait();
        const ajo = ajos.find((item) => item.id === id);
        if (!ajo)
            throw new Error("Ajo not found");
        return withMembership(ajo, userId);
    },
    async createAjo(input, creator = currentUser) {
        await wait(700);
        const created = { ...input, id: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), filledSlots: 1, status: "OPEN", creator: creator.name, creatorId: creator.id, memberCount: 1, memberIds: [creator.id] };
        ajos = [created, ...ajos];
        return created;
    },
    async requestToJoin({ ajoId, user, slots = 1, preferredPosition = null }) {
        await wait(650);
        const ajo = ajos.find((item) => item.id === ajoId);
        if (!ajo)
            throw new Error("This Ajo could not be found.");
        if (!user?.id)
            throw new Error("Sign in before requesting to join an Ajo.");
        if (ajo.status !== "OPEN")
            throw new Error("This Ajo is no longer accepting join requests.");
        if (ajo.creatorId === user.id || ajo.memberIds?.includes(user.id))
            throw new Error("You are already a member of this Ajo.");
        if (joinRequests.some((request) => request.ajoId === ajoId && request.user.id === user.id && request.status === "PENDING"))
            throw new Error("You already have a pending request for this Ajo.");
        if (slots < 1 || slots > ajo.slotCount - ajo.filledSlots)
            throw new Error("The number of requested slots is no longer available.");
        const request = {
            id: `req-${Date.now()}`,
            ajoId,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || "Not provided",
                role: user.role || "USER",
                rating: user.rating || 0,
                completedCycles: user.completedCycles || 0,
            },
            slots,
            preferredPositions: preferredPosition ? [Number(preferredPosition)] : [],
            requestedAt: new Date().toISOString(),
            status: "PENDING",
            reviewedAt: null,
        };
        joinRequests = [request, ...joinRequests];
        return withAjoDetails(request);
    },
    async getJoinRequests({ userId, ajoId, status, creatorId } = {}) {
        await wait();
        return joinRequests
            .filter((request) => !userId || request.user.id === userId)
            .filter((request) => !ajoId || request.ajoId === ajoId)
            .filter((request) => !status || request.status === status)
            .filter((request) => {
                if (!creatorId) return true;
                const ajo = ajos.find((item) => item.id === request.ajoId);
                return ajo?.creatorId === creatorId;
            })
            .map(withAjoDetails);
    },
    async reviewJoinRequest(id, decision) {
        await wait(650);
        const request = joinRequests.find((item) => item.id === id);
        if (!request)
            throw new Error("This join request could not be found.");
        if (request.status !== "PENDING")
            throw new Error("This request has already been reviewed.");
        if (!["ACCEPTED", "DECLINED"].includes(decision))
            throw new Error("Choose whether to accept or decline this request.");
        const ajo = ajos.find((item) => item.id === request.ajoId);
        if (!ajo)
            throw new Error("The Ajo connected to this request could not be found.");
        if (decision === "ACCEPTED" && request.slots > ajo.slotCount - ajo.filledSlots)
            throw new Error("There are not enough available slots for this request.");

        joinRequests = joinRequests.map((item) => item.id === id ? { ...item, status: decision, reviewedAt: new Date().toISOString() } : item);
        if (decision === "ACCEPTED") {
            ajos = ajos.map((item) => item.id === request.ajoId ? {
                ...item,
                filledSlots: item.filledSlots + request.slots,
                memberCount: item.memberCount + 1,
                memberIds: [...new Set([...(item.memberIds || []), request.user.id])],
            } : item);
        }
        notifications = [{
            id: `n-${Date.now()}`,
            userId: request.user.id,
            title: decision === "ACCEPTED" ? "Join request accepted" : "Join request declined",
            message: decision === "ACCEPTED"
                ? `You are now a member of ${ajo.name}. Welcome to the circle!`
                : `Your request to join ${ajo.name} was declined. You can explore other available Ajos.`,
            date: new Date().toISOString(),
            read: false,
            kind: "group",
        }, ...notifications];
        return withAjoDetails(joinRequests.find((item) => item.id === id));
    },
    async cancelJoinRequest(id, userId) {
        await wait(450);
        const request = joinRequests.find((item) => item.id === id);
        if (!request || request.user.id !== userId)
            throw new Error("This join request could not be found.");
        if (request.status !== "PENDING")
            throw new Error("Only a pending request can be cancelled.");
        joinRequests = joinRequests.filter((item) => item.id !== id);
        return { success: true, ajoId: request.ajoId };
    },
    async setAjoOrder(id, memberOrder) {
        await wait(500);
        const ajo = ajos.find((item) => item.id === id);
        if (!ajo)
            throw new Error("This Ajo could not be found.");
        ajos = ajos.map((item) => item.id === id ? { ...item, payoutOrder: [...memberOrder] } : item);
        return withMembership(ajos.find((item) => item.id === id));
    },
    async startAjo(id) {
        await wait(600);
        const ajo = ajos.find((item) => item.id === id);
        if (!ajo || ajo.status !== "OPEN")
            throw new Error("Only an open Ajo can be started.");
        if (ajo.filledSlots !== ajo.slotCount)
            throw new Error("Fill every slot before starting this Ajo.");
        ajos = ajos.map((item) => item.id === id ? { ...item, status: "ACTIVE", startDate: new Date().toISOString(), currentRound: 1, progress: 0 } : item);
        return withMembership(ajos.find((item) => item.id === id));
    },
    async exitAjo(id, userId) {
        await wait(500);
        const ajo = ajos.find((item) => item.id === id);
        if (!ajo || ajo.status !== "ACTIVE" || !ajo.memberIds?.includes(userId))
            throw new Error("You cannot exit this Ajo.");
        ajos = ajos.map((item) => item.id === id ? { ...item, memberIds: item.memberIds.filter((memberId) => memberId !== userId), exitedMemberIds: [...new Set([...(item.exitedMemberIds || []), userId])] } : item);
        return { success: true };
    },
    async endAjo(id, creatorId) {
        await wait(500);
        const ajo = ajos.find((item) => item.id === id);
        if (!ajo || ajo.creatorId !== creatorId || ajo.status !== "OPEN")
            throw new Error("Only the creator can end an Ajo before it starts.");
        ajos = ajos.map((item) => item.id === id ? { ...item, status: "CLOSED" } : item);
        return withMembership(ajos.find((item) => item.id === id), creatorId);
    },
    async getCycleContributions(cycleId) {
        await wait();
        return contributions.filter((item) => item.cycleId === cycleId).map((item) => ({ ...item, participant: { ...item.participant } }));
    },
    async payContribution(id, userId) {
        await wait(650);
        const contribution = contributions.find((item) => item.id === id);
        if (!contribution || contribution.participant.id !== userId || contribution.status !== "DUE")
            throw new Error("This contribution is not available for payment.");
        if (wallet.ajoBalance < contribution.amount)
            throw new Error("Your Ajo wallet balance is too low for this payment.");
        contributions = contributions.map((item) => item.id === id ? { ...item, status: "PAID", paidAt: new Date().toISOString() } : item);
        wallet = { ...wallet, ajoBalance: wallet.ajoBalance - contribution.amount };
        transactions = [{ id: `tx-${Date.now()}`, title: "Ajo contribution", subtitle: contribution.ajoId, amount: contribution.amount, direction: "debit", status: "SUCCESSFUL", date: new Date().toISOString(), type: "CONTRIBUTION" }, ...transactions];
        return { ...contributions.find((item) => item.id === id) };
    },
    async rateParticipant({ ajoId, participantId, creatorId, rating, comment = "" }) {
        await wait(450);
        const ajo = ajos.find((item) => item.id === ajoId);
        const eligible = ajo?.status === "COMPLETED" || ajo?.exitedMemberIds?.includes(participantId);
        if (!ajo || ajo.creatorId !== creatorId || !eligible)
            throw new Error("This participant is not eligible to be rated.");
        return { id: `rating-${Date.now()}`, ajoId, participantId, rating, comment, createdAt: new Date().toISOString() };
    },
    async transactions(type = "ALL") {
        await wait();
        return transactions
            .filter((transaction) => type === "ALL" || transaction.type === type)
            .map((transaction) => ({ ...transaction }));
    },
    async notifications(userId, { page = 1, pageSize = 10 } = {}) {
        await wait();
        const visible = notifications.filter((item) => !item.userId || item.userId === userId);
        const start = (page - 1) * pageSize;
        return {
            items: visible.slice(start, start + pageSize).map((item) => ({ ...item })),
            unreadCount: visible.filter((item) => !item.read).length,
            page,
            pageSize,
            total: visible.length,
            totalPages: Math.max(1, Math.ceil(visible.length / pageSize)),
        };
    },
    async markNotificationRead(id) {
        notifications = notifications.map((item) => item.id === id ? { ...item, read: true } : item);
        return { success: true };
    },
    async updateNotificationPreferences(user, preferences) {
        await wait(400);
        currentUser = { ...currentUser, ...user, preferences: { ...preferences } };
        return { ...currentUser };
    },
    async withdraw({ amount, bankAccount, user }) {
        await wait(800);
        if (!bankAccount?.verified)
            throw new Error("Choose a verified bank account for this withdrawal.");
        if (!Number.isFinite(amount) || amount <= 0)
            throw new Error("Enter a valid withdrawal amount.");
        if (amount > wallet.available)
            throw new Error("Insufficient balance");
        wallet = { ...wallet, available: wallet.available - amount, pending: wallet.pending + amount };
        transactions = [{ id: `tx-${Date.now()}`, title: "Bank withdrawal", subtitle: bankAccount ? `${bankAccount.bankName} • ${bankAccount.accountNumber.slice(-4)}` : "Bank account", amount, direction: "debit", status: "PENDING", date: new Date().toISOString(), type: "WITHDRAWAL" }, ...transactions];
        const request = { id: `WD-${Date.now()}`, user: { id: user.id, name: user.name, email: user.email }, amount, bankAccount: { ...bankAccount }, requestedAt: new Date().toISOString(), status: "PENDING", initiatedAt: null, settledAt: null };
        withdrawals = [request, ...withdrawals];
        return { ...request };
    },
    async getWithdrawals(userId) {
        await wait();
        return withdrawals.filter((request) => request.user.id === userId).map((request) => ({ ...request, user: { ...request.user }, bankAccount: { ...request.bankAccount } }));
    },
    async getAdminWithdrawals() {
        await wait();
        return withdrawals.map((request) => ({ ...request, user: { ...request.user }, bankAccount: { ...request.bankAccount } }));
    },
    async initiateWithdrawal(id) {
        await wait(500);
        const request = withdrawals.find((item) => item.id === id);
        if (!request || request.status !== "PENDING")
            throw new Error("Only a pending withdrawal can be initiated.");
        withdrawals = withdrawals.map((item) => item.id === id ? { ...item, status: "PROCESSING", initiatedAt: new Date().toISOString() } : item);
        return { ...withdrawals.find((item) => item.id === id) };
    },
    async confirmWithdrawal(id, outcome) {
        await wait(550);
        const request = withdrawals.find((item) => item.id === id);
        if (!request || request.status !== "PROCESSING")
            throw new Error("Initiate this withdrawal before confirming settlement.");
        const status = outcome === "PAID" ? "PAID" : "FAILED";
        withdrawals = withdrawals.map((item) => item.id === id ? { ...item, status, settledAt: new Date().toISOString() } : item);
        if (request.user.id === currentUser.id) {
            wallet = status === "PAID"
                ? { ...wallet, pending: Math.max(0, wallet.pending - request.amount) }
                : { ...wallet, pending: Math.max(0, wallet.pending - request.amount), available: wallet.available + request.amount };
        }
        return { ...withdrawals.find((item) => item.id === id) };
    },
    async requests(filters) {
        return mockApi.getJoinRequests(filters);
    },
    async submitSupportIssue({ user, type, subject, description }) {
        await wait(500);
        const issue = { id: `ISS-${Date.now()}`, user: { id: user.id, name: user.name, email: user.email }, type, subject, description, status: "OPEN", resolution: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        supportIssues = [issue, ...supportIssues];
        return { ...issue, user: { ...issue.user } };
    },
    async getSupportIssues(userId) {
        await wait();
        return supportIssues.filter((issue) => issue.user.id === userId).map((issue) => ({ ...issue, user: { ...issue.user } }));
    },
    async getAdminSupportIssues() {
        await wait();
        return supportIssues.map((issue) => ({ ...issue, user: { ...issue.user } }));
    },
    async updateSupportIssue(id, updates) {
        await wait(450);
        if (!supportIssues.some((issue) => issue.id === id))
            throw new Error("This support issue could not be found.");
        supportIssues = supportIssues.map((issue) => issue.id === id ? { ...issue, ...updates, updatedAt: new Date().toISOString() } : issue);
        return { ...supportIssues.find((issue) => issue.id === id) };
    },
};
