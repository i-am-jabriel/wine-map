import { Button } from "@material-ui/core"
import { useState } from "react"
import { parseBody, Comment, Content, Post, corktaint } from "../Helper"

export default props => {
    const [value, setValue] = useState(props.value || '');
    const [title, setTitle] = useState(props.value || '')
    return (
        <div className='reply-container col'>
            <div className='reply-content row'>
                <div className='col'>
                    {corktaint.reply.isPost && <input value={title} onInput={e=>setTitle(e.target.value)} className='post-title-input wide' placeholder='Title'/>}
                    <textarea id='reply' className='wide' onInput={e=>setValue(e.target.value)} defaultValue={value}/>
                </div>
                <div className='reply-preview wide'>
                    <h3 className='preview-title'>Preview:</h3>
                    <div className='preview-contents'>{parseBody(value).map((c,i)=>c.render(i))}</div>
                </div>
            </div>
            <div className='reply-buttons row'>
                <Button variant="contained" color="primary" onClick={()=>{
                    if(corktaint.reply.isPost)
                        Post.submitNewPost(title,Content.fullValues(parseBody(value)));
                    else
                        if(corktaint.reply.replyMode != 'edit')
                            Comment.submitCommentToDatabase(corktaint.reply, Content.fullValues(parseBody(value)));
                        else
                            corktaint.reply.edit(Content.fullValues(parseBody(value)))
                }}>Submit</Button>
                <Button variant="contained" color="secondary" onClick={()=>{
                    corktaint.reply = null;
                    corktaint.refresh();
                }}>Cancel</Button>
            </div>
        </div>
    )
}