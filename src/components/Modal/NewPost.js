import { Button, Tab, Tabs } from "@material-ui/core";
import { Image } from "@material-ui/icons";
import PropTypes from 'prop-types';
import { createRef, useState } from "react";
import { uploadToBucket } from '../Helper';
import AWS from 'aws-sdk';


function TabPanel(props) {  
    const { children, value, index, ...other } = props;

    return <div className='modal-content' role="tabpanel" hidden={value !== index}>
        {value === index && children}
    </div>
}
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };
  

export default function NewPost(props){
    const [tab, setTab] = useState(props.type);
    const change = (_,t)=> setTab(t);
    const input = createRef();
    const focusInput=()=>input.current.click();
    const onUpload=e=>{
        uploadToBucket(input.current.files,console.log,(e,r)=>{
            if(e && !console.log(e))throw e;
            alert('complete upload');
        });
    }
    return <div>
        <Tabs value={tab} onChange={change} variant='fullWidth'>
            <Tab label='Submit Review' value='review'/>
            <Tab label='New Post' value='post'/>
            <Tab label='Upload Gallery' value='upload'/>
        </Tabs>
        <div className='new-post-modal-inner'>
            <TabPanel value={tab} index="post">
                <h1>Could be the choice of stiens;gate? 1</h1>
            </TabPanel>
            <TabPanel value={tab} index="upload">
                <h1>Upload Gallery</h1>
                <input type="file" ref={input} multiple hidden onChange={onUpload}/>
                <div className='col'>
                    <Button color='primary' className='row' onClick={focusInput}>
                        <Image/> Upload
                    </Button>
                </div>
            </TabPanel>
            <TabPanel value={tab} index="review">
                <h1>Could be the choice of stiens;gate? 3</h1>
            </TabPanel>
        </div>
    </div>
}