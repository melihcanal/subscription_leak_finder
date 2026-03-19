import {createDb} from "../lib/db";
import {SubscriptionRepository} from "../repositories/subscriptionRepository";
import {TransactionRepository} from "../repositories/transactionRepository";
import {UploadRepository} from "../repositories/uploadRepository";
import {SubscriptionService} from "./subscriptionService";
import type {Env} from "../env";

export function createSubscriptionService(env: Env): SubscriptionService {
    const db = createDb(env.DB);
    return new SubscriptionService(
        new UploadRepository(db),
        new TransactionRepository(db),
        new SubscriptionRepository(db),
        env.UPLOADS
    );
}
