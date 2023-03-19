import BountyCard from '../components/BountyCard';
import Grid from '@mui/material/Grid';

export default function AllBounties(props) {
    return (
        <Grid container spacing={1} columns={{ xs: 4, sm: 3, md: 4 }}>
            {props.bounties.map((bounty, index) => {
                return (
                    <Grid key={index}>
                        <BountyCard index={index} setTab={props.setTab} setIndex={props.setIndex} bounty={bounty} />
                    </Grid>
                )
            })}
        </Grid>
    );
}