const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const stripe = require("stripe")(functions.config().stripe.secret_key);
const db = admin.firestore();

// 自动处理提现：approve_payout 从 false -> true 时触发
exports.onWithdrawRequestUpdated = functions.firestore
    .document("withdraw_requests/{id}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const id = context.params.id;

        // 触发条件：approve_payout 从 false 变成 true
        if (!!before.approve_payout === !!after.approve_payout || !after.approve_payout) {
            return null;
        }

        // 防止重复处理
        if (after.status === "paid" || after.transferId) {
            return null;
        }

        const { userId, amount, currency, stripeAccountId } = after;

        if (!userId || !amount || !stripeAccountId) {
            await db.collection("withdraw_requests").doc(id).update({
                status: "failed",
                reason: "Missing userId, amount, or stripeAccountId",
            });
            return null;
        }

        let transfer;
        try {
            transfer = await stripe.transfers.create({
                amount: Math.round(amount * 100), // Stripe 以 cents 计费
                currency: (currency || "aud").toLowerCase(),
                destination: stripeAccountId,
            });
        } catch (err) {
            await db.collection("withdraw_requests").doc(id).update({
                status: "failed",
                reason: err.message,
            });
            return null;
        }

        // 更新提现请求状态
        const now = admin.firestore.FieldValue.serverTimestamp();

        await db.collection("withdraw_requests").doc(id).update({
            status: "paid",
            paidAt: now,
            transferId: transfer.id,
        });

        // 写入 wallet_ledger（提现为负数）
        await db.collection("wallet_ledger").add({
            userId,
            amount: -amount,
            currency: currency || "AUD",
            type: "withdrawal",
            status: "confirmed",
            note: "Stripe payout",
            createdAt: now,
        });

        return null;
    });
