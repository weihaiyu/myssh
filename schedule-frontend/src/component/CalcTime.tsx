import React from 'react';
import {Button} from "antd";
// const {ipcRenderer} = window.require('electron');

const CalcTime = props => {
    return (
        <div>
            <Button
                type='primary'
                onClick={() => {
                    // ipcRenderer.send('getUrl', 111);
                }}
            >
                选择文件夹
            </Button>
        </div>
    )
};

export default CalcTime;
