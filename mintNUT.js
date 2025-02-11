import fs from 'fs/promises';
import log from "./utils/logger.js"
import iniBapakBudi from "./utils/banner.js"
import mintNFT from './utils/mintNUT.js';

const RPC_URL = 'https://rpc-testnet.haust.app';

async function readWallets() {
    try {
        await fs.access("wallets.json");

        const data = await fs.readFile("wallets.json", "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            log.error("No wallets found in wallets.json");
            return [];
        }
        throw err;
    }
}

async function main() {
    log.info(iniBapakBudi);
    await new Promise(res => setTimeout(res, 3000));
    const wallets = await readWallets();

    if (wallets.length === 0) {
        log.warn("No wallets to process.");
        return;
    }

    log.info(`Found ${wallets.length} existing wallets...`);

    try {
        const batchSize = 10;
        for (let i = 0; i < wallets.length; i += batchSize) {
            const batch = wallets.slice(i, i + batchSize);

            log.info(`Processing batch ${Math.ceil((i + 1) / batchSize)} with ${batch.length} wallets...`);

            await Promise.all(
                batch.map(async (wallet) => {
                    log.info(`Processing wallet: ${wallet.address}`);
                    await mintNFT(wallet.privateKey, RPC_URL);
                })
            );

            log.info(`Processing Batch ${Math.ceil((i + 1) / batchSize)} completed.`);
        }
    } catch (error) {
        log.error("Error processing wallets:", error.message);
    }
}

main();
