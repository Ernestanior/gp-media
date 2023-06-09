import {IRoleLimitModule} from "@/common/interface";
import {E_USER_TYPE} from "@/store/account/interface";
import {XOR} from "ts-xor";

interface IMenu extends IRoleLimitModule{
    url: string;
    text: string;
}

interface IMultipleMenu extends IRoleLimitModule{
    text: string;
    childs: IMenu[]
}

const menuList: Array<XOR<IMenu, IMultipleMenu>> = [
    {
        url: "/customer",
        text: "客户管理"
    },
    {
        url: '/sale',
        text: "销售部门",
        role: [E_USER_TYPE.SALE_MANAGER]
    },
    {
        url: "/statistics",
        text: "统计报表"
    },
    {
        text: "CDN管理",
        childs: [
            {
                url: "/cdn/siteList",
                text: "站点管理"
            },
            {
                url: "/cdn/record",
                text: "记录管理"
            },
            {
                url: "/cdn/operate-log",
                text: "客户操作日志"
            }
        ]
    },
    {
        text: "归档功能",
        role: [E_USER_TYPE.SALE_MANAGER],
        childs: [
            {
                url: "/archive/customer",
                text: "归档客户"
            },
            {
                url: "/archive/domain",
                text: "归档域名"
            }
        ]
    },
    {
        text: "官网设置",
        childs: [
            {
                text: "新闻",
                url: "/news"
            },
            {
                text: "客户服务设置",
                url: "/contact-service"
            }
        ]
    },
    {
        text: "工具",
        childs: [
            {
                text: "批量邮件发送",
                url: "/email"
            },
            {
                text: "子账号查询",
                url: "/sub-account-query"
            }
        ]
    }
]

export default menuList;
