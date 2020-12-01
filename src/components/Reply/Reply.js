import { Button } from "@material-ui/core"
import { useState } from "react"
import { parseBody, Comment, Content, Post, corktaint } from "../Helper"

export default props => {
    const [value, setValue] = useState(props.value || '');
    const [title, setTitle] = useState(props.value || '')
    return (
        <div className='reply-container col'>
            {corktaint.reply.isPost?
                <input value={title} onInput={e=>setTitle(e.target.value)} className='post-title-input' placeholder='Title'/>:null}
            <div className='reply-content row'>
                <textarea id='reply' onInput={e=>setValue(e.target.value)} defaultValue={value}/>
                <div className='reply-preview'>
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
                            Comment.addCommentTo(corktaint.reply, Content.fullValues(parseBody(value)));
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