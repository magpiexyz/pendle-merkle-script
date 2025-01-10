import { BigNumber } from 'ethers';
import { normalizeRawRC, queryAllPositions, RC } from './helper';
import rawSwapDatas from './data/swap-result.json';

const WTIME_INF = 2 ** 31 - 1;
const ACCOUNT = '0x64627901dadb46ed7f275fd4fc87d086cff1e6e3'.toLowerCase();
const vePendle = '0x4f30a9d41b80ecc5b94306ab4364951ae3170210';
async function main() {
    const votingDatas = await queryAllPositions(WTIME_INF);
    const swapDatas: RC = normalizeRawRC(rawSwapDatas);

    const rewardByPool: RC = {};

    for(let id in swapDatas) {
        const [pool, _week] = id.split('-');
        const wTime = parseInt(_week);

        if (!votingDatas[pool]) continue;

        const rewardAmount = swapDatas[id];
        let totalVotingPower = BigNumber.from(0);

        for (let user of Object.keys(votingDatas[pool])) {
            const userVotingPower = votingDatas[pool][user].valueAt(wTime);
            totalVotingPower = totalVotingPower.add(userVotingPower);
        }


        let distributingDest = pool;
        if (totalVotingPower.eq(0)) {
            distributingDest = vePendle;
            totalVotingPower = BigNumber.from(0);
            for(let user of Object.keys(votingDatas[distributingDest])) {
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
    }

    for (let rid of Object.keys(rewardByPool)) {
        console.log(`${rid}: ${rewardByPool[rid].toString()}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
