import Button from "@mui/material/Button";

export default function AllBounties(props) {
    return (
        <div>
            <Button onClick={() => props.setTab(0)}>Test</Button>
        </div>
    );
}