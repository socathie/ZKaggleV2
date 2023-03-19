import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

export default function BountyCard(props) {
    return (
        <Card sx={{ minWidth: 300, margin: 1 }}>
            <CardActionArea
                onClick={() => {
                    props.setTab(0);
                    props.setIndex(props.index);
                }}
                disabled={props.bounty.completedStep.toNumber()===4}
            >
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.bounty.name}
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                    Reward: {props.bounty.reward.formatted} ETH
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                    Status: {props.bounty.completedStep.toNumber()===4 ? "Completed" : "In progress"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    {props.bounty.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    Accuracy required: {props.bounty.accuracyThreshold.toString()}%
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}