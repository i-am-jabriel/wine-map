import { Edit, Image, Map } from '@material-ui/icons';
import Button from './Button';
import {corktaint} from '../Helper';

export default function NewPost(props){
    const open = subtype => {
        props.close();
        corktaint.openModal({type:'post',subtype})
    }
    const b = Button.from([[<Map/>,'Submit Review',()=>open('review')],[<Edit/>,'New Post',()=>open('post')],[<Image/>,'Upload Gallery',()=>open('upload')]]);
    return <div className='navbar-modal-content navbar-modal-new-post'>
        {Button.render(b,'new-post-modal-row')}
    </div>
}