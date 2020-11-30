import { Button } from "@material-ui/core"
import { useState } from "react"
import { parseBody, Comment, Content, Post } from "../Helper"

export default props => {
    const [value, setValue] = useState(props.value || '');
    const [title, setTitle] = useState(props.value || '')
    return (
        <div className='reply-container col'>
            {window.corktaint.reply.isPost?
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
                    if(window.corktaint.reply.isPost)
                        Post.submitNewPost(title,Content.fullValues(parseBody(value)));
                    else
                        if(window.corktaint.reply.replyMode != 'edit')
                            Comment.addCommentTo(window.corktaint.reply, Content.fullValues(parseBody(value)));
                        else
                            window.corktaint.reply.edit(Content.fullValues(parseBody(value)))
                }}>Submit</Button>
                <Button variant="contained" color="secondary" onClick={()=>{
                    window.corktaint.reply = null;
                    window.corktaint.refresh();
                }}>Cancel</Button>
            </div>
        </div>
    )
}