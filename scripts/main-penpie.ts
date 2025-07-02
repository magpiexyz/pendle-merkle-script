import { BigNumber } from 'ethers';
import { normalizeRawRC, queryAllPositions, RC } from './helper';
import rawSwapDatas from './data/swap-result.json';
import { uploadToS3, uploadCSVToDune, reward, arrayToCSVString, writeJson, arrayToCSV } from './helper-penpie';

const WTIME_INF = 2 ** 31 - 1;
const ACCOUNT = '0x6E799758CEE75DAe3d84e09D40dc416eCf713652'.toLowerCase();
const VEPENDLE = '0x4f30a9d41b80ecc5b94306ab4364951ae3170210';

async function main() {
    const votingDatas = await queryAllPositions(WTIME_INF);
    const swapDatas: RC = normalizeRawRC(rawSwapDatas);

    const rewardByPool: RC = {};

    let sumReward = BigNumber.from(0);
    let sumBaseReward = BigNumber.from(0);
    let rewards: reward[] = [];
    let wTimeFrom = 0;
    let wTimeTo = 0;

    for (let id in swapDatas) {
        const [pool, _week] = id.split('-');
        const wTime = parseInt(_week);
        wTimeFrom = wTimeFrom == 0 ? wTime : Math.min(wTimeFrom, wTime);
        wTimeTo = Math.max(wTimeTo, wTime);

        if (!votingDatas[pool] || !votingDatas[pool][ACCOUNT]) continue;

        const rewardAmount = swapDatas[id];
        let totalVotingPower = BigNumber.from(0);

        for (let user of Object.keys(votingDatas[pool])) {
            const userVotingPower = votingDatas[pool][user].valueAt(wTime);
            totalVotingPower = totalVotingPower.add(userVotingPower);
        }


        let distributingDest = pool;
        if (totalVotingPower.eq(0)) {
            distributingDest = VEPENDLE;
            totalVotingPower = BigNumber.from(0);
            for (let user of Object.keys(votingDatas[distributingDest])) {
                const userVotingPower = votingDatas[distributingDest][user].valueAt(wTime);
                totalVotingPower = totalVotingPower.add(userVotingPower);
            }
        }

        const accountShare = votingDatas[distributingDest][ACCOUNT] ? votingDatas[distributingDest][ACCOUNT].valueAt(wTime) : BigNumber.from(0);
        if (accountShare.eq(0)) continue;
        const rewardForAccount = rewardAmount.mul(accountShare).div(totalVotingPower);

        const rid = `${distributingDest}-${wTime}`;
        if (!rewardByPool[rid]) rewardByPool[rid] = BigNumber.from(0);
        rewardByPool[rid] = rewardByPool[rid].add(rewardForAccount);
        // console.log(`pool: ${pool}, wtime: ${wTime}, rewardForAccount: ${rewardForAccount.toString()}`);

        rewards.push({ pool, wTime, rewardForAccount: rewardForAccount.toString(), rewardInPool: rewardAmount.toString(), totalVotingPower: totalVotingPower.toString() });
        sumReward = sumReward.add(rewardForAccount);

        if (pool == VEPENDLE)
            sumBaseReward = sumBaseReward.add(rewardForAccount);
    }

    // for (let rid of Object.keys(rewardByPool)) {
    //     console.log(`${rid}: ${rewardByPool[rid].toString()}`);
    // }

    // Local file export, commented out by default
    // Notice: Don't push the output files to the repository
    // writeJson({ sumReward: sumReward.toString(), sumBaseReward: sumBaseReward.toString(), rewards }, `${wTimeFrom}-${wTimeTo}.json`);
    // arrayToCSV(rewards, `${wTimeFrom}-${wTimeTo}.csv`);

    // Export JSON to S3
    const jsonData = { sumReward: sumReward.toString(), sumBaseReward: sumBaseReward.toString(), rewards };
    await uploadToS3(
        "automa-data",
        `bribe-reward-distribution/vePendleVotingRevenueShare/rewardData/${wTimeFrom}-${wTimeTo}.json`,
        jsonData
    );

    // Export CSV to Dune
    console.log(`Uploading data to Dune system with table name: vependle_fee_${wTimeFrom}_${wTimeTo}`);
    if (await uploadCSVToDune(`vependle_fee_${wTimeFrom}_${wTimeTo}`, arrayToCSVString(rewards))) {
        console.log('CSV uploaded to Dune successfully.');
    }
    else {
        throw new Error('Failed to upload CSV to Dune.');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
