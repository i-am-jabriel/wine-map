import { Tooltip } from "@material-ui/core";

export default function Terms(props){
    return <div className='terms-container'>
        <h1>Terms And Conditions</h1>
        <p>This App was created with love, to spread exclusively love back into the universe,</p>
        <p>We value free speech here,</p>
        <p>But we reserve the right to delete any content and users who <Tooltip title='at our discretion'><span>"troll"</span></Tooltip>,</p>
        <p>Thanks for understanding</p>
    </div>
}