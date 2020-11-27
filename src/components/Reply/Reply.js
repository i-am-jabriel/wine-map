import { Button } from "@material-ui/core"
import { useState } from "react"
import { parseBody, Comment, Content } from "../Helper"

export default props => {
    const [value, setValue] = useState('');
    return (
        <div className='reply-container col'>
            <div className='reply-content row'>
                <textarea id='reply' onInput={e=>setValue(e.target.value)} />
                <div className='reply-preview'>
                    <h3 className='preview-title'>Preview:</h3>
                    <div className='preview-contents'>{parseBody(value).map((c,i)=>c.render(i))}</div>
                </div>
            </div>
            <div className='reply-buttons row'>
                <Button variant="contained" color="primary" onClick={()=>{
                    Comment.addCommentTo(window.corktaint.reply, Content.toBody(parseBody(value)))
                        .then(r=>{
                            window.corktaint.reply = null;
                            window.corktaint.refresh();
                        });
                }}>Submit</Button>
                <Button variant="contained" color="secondary" onClick={()=>{
                    window.corktaint.reply = null;
                    window.corktaint.refresh();
                }}>Cancel</Button>
            </div>
        </div>
    )
}