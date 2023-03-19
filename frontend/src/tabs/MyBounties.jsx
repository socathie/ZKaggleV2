import BountyCard from '../components/BountyCard';
import Grid from '@mui/material/Grid';
import { useAccount } from 'wagmi';

export default function MyBounties(props) {
    const { address } = useAccount();

    return (
        <Grid container spacing={1} columns={{ xs: 4, sm: 3, md: 4 }}>
            {props.bounties.map((bounty, index) => {
                if (bounty.owner !== address) return null;
                return (
                    <Grid key={index}>
                        <BountyCard index={index} setTab={props.setTab} setIndex={props.setIndex} bounty={bounty} />
                    </Grid>
                )
            })}
        </Grid>
    );
}