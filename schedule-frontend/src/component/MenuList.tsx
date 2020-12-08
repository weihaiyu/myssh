import React from 'react';
import {Menu} from "antd";
import {Link} from "react-router-dom";
import {useLocation} from "react-router-dom";

const MenuList = props => {
	let location = useLocation();
    return (
	    <Menu
		    selectedKeys={[location.pathname.substr(1)]}
		    mode="inline"
		    style={{
			    height: '100%',
			    borderRight: 0
		    }}
	    >

		    <Menu.Item key="schedule">
			    <Link to='schedule'>
				    课程表
			    </Link>
		    </Menu.Item>
		    <Menu.Item key="teacher">
			    <Link to='teacher'>
				    讲师管理
			    </Link>
		    </Menu.Item>
		    <Menu.Item key="lesson">
			    <Link to='lesson'>
				    课程管理
			    </Link>
		    </Menu.Item>
		    <Menu.Item key="calculate">
			    <Link to='calculate'>
				    统计课时
			    </Link>
		    </Menu.Item>
		    <Menu.Item key="holiday">
			    <Link to='holiday'>
				    放假时间管理
			    </Link>
		    </Menu.Item>
	    </Menu>
    )
};

export default MenuList;
