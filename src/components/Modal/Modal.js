import {Modal as MUIModal} from '@material-ui/core';
import { corktaint } from '../Helper';
import NewPost from './NewPost';
export default function Modal(props){
    const close=()=>corktaint.openModal(null);
    return <MUIModal onClose={close} open={true} className='modal'>
        <div className='modal-inner'>
            {props.type.type=='post' && <NewPost type={props.type.subtype}/>}

        </div>
    </MUIModal>
}