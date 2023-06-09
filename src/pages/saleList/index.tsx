import React, {FC, useCallback, useMemo} from "react";
import {INormalEvent} from "@/common/interface";
import historyService from "@/store/history";
import {saleService} from "@/store/apis/account";
import {queryValueFromListRender, reqAndReload} from "@/common/utils";
import Template from "@/common/template";
import {SALE_LIST} from "@/pages/sale/create";
import SaleFilter from "@/pages/saleList/filter";
import SaleFilterMobile from "@/pages/saleList/filterMobile";
import {E_USER_STATUS_COLUMN, resetPwd} from "@/pages/customerList";
import {E_USER_TYPE} from "@/store/account/service";
import {IOperationConfig} from "@/common/template/interface";
import msgModal from "@/store/message/service";
import FormItem from "@/common/Form/formItem";
import {Input} from "antd";
import isMobile from "@/app/isMobile";
import Status from "@/common/status";
import {E_COLOR} from "@/common/const";
import TipBox from "@/common/tip";
import View from "@/common/popup/view";

const SaleList:FC = () => {

    const buttons: INormalEvent[] = useMemo(()=> {
        return [{
            text: '新增',
            primary: true,
            event(){
                historyService.push("/sale/create")
            }
        }]
    }, [])

    const query = useCallback((data) => {
        return saleService.QueryList({}, data);
    }, [])

    // modify
    const modify = useCallback(sale => {
        historyService.push(`/sale/modify/${sale.id}`)
    }, [])

    // disable
    // const disable = useCallback(({userId}) => {
    //     const config = userService.EnableUser({ id:userId }, {});
    //     reqAndReload(config)
    // }, [])
    //
    // // enable
    // const enable = useCallback(({userId}) => {
    //     const config = userService.DisableUser({ id:userId }, {});
    //     reqAndReload(config)
    // }, [])

    // modify
    const deleteUser = useCallback(({id}) => {
        const config = saleService.Delete({ saleId: id }, {});
        reqAndReload(config)
    }, [])

    // 分配客户
    const reAssignCustomer = useCallback(({id}) => {
        // 跳转到为销售分配客户页面
        historyService.push("/sale/assign/" + id)
    }, [])

    const options: IOperationConfig = useMemo(() => {
        return [
            [
                {
                    text: "查看",
                    hide: () => !isMobile,
                    event(data) {
                        if (data) {
                            const {
                                name,
                                type,
                                status
                            } = data
                            const dataList = [
                                {label:'客户名称',content:name},
                                {label:'客户类型',content:type},
                                {label:'账号状态',content:status === 1?<Status color={E_COLOR.enable}>正式</Status>:<Status color={E_COLOR.disable}>禁用</Status>},
                            ]
                            const value = {
                                node: <View dataList={dataList} />,
                            }
                            msgModal.createEvent("popup", value)
                        }
                    },
                },
                {
                    text: "分配客户",
                    hide:(data)=>!(data.type === E_USER_TYPE.SALE),
                    event(data) {
                        reAssignCustomer(data)
                    }
                },
                {
                    text: "修改",
                    hide:(data)=>data.status !== 1,
                    event(data) {
                        modify(data)
                    }
                },
                {
                    text: "重置密码",
                    event(data) {
                        const value = {
                            title: "重置密码",
                            content: <TipBox style={{width:isMobile?320:440}} type="warning" title="提示">请确认为{data.name}重置密码?</TipBox>,
                            onOk: () => resetPwd(data.id)
                        }
                        msgModal.createEvent("modal", value)
                    },
                },
                {
                    text: "删除",
                    event(data) {
                        // deleteCustomer(data);
                        const value = {
                            title:"删除",
                            content:`你确定要删除销售: ${data.name}`,
                            onOk:()=>deleteUser(data)
                        }
                        msgModal.createEvent("modal",value)
                    },
                }]
        ]
    }, [deleteUser,reAssignCustomer,modify])

    // 下拉
    /** 老版本
    const _columns = useMemo(() => {
        return [
            ...columns,
            {
                title: "操作",
                dataIndex: "opt",
                width: 260,
                render(_:any, data:any){
                    const showAssign = data.type === E_USER_TYPE.SALE;
                    return <Space>
                        {showAssign && <Button onClick={() => { reAssignCustomer(data) }}>分配客户</Button>}
                        <Button onClick={() => { modify(data) }}>修改</Button>
                        <ConfirmButton info={`确定删除此用户${data.name}/${data.email}？`} submit={() => { deleteUser(data) }}>删除</ConfirmButton>
                    </Space>
                }
            }
        ]
    }, [modify, deleteUser, reAssignCustomer])
    */
    return <section>
        <Template
            primarySearch={primarySearch}
            optList={options}
            filter={isMobile?<SaleFilterMobile/>:<SaleFilter />}
            event={buttons}
            columns={isMobile?columnMobile:columns}
            queryData={query}
            rowKey="id"
            scroll={isMobile?{}:{
                x: 1200,
            }}
        />
    </section>
}

export default SaleList

const columnMobile = [
    {
        dataIndex: "name",
        title: "名称",
        width:120
    },
    {
        dataIndex: "type",
        title: "类型",
        width:80,
        render: queryValueFromListRender(SALE_LIST),
    }
]
const columns = [
    {
        dataIndex: "name",
        title: "名称",
    },
    {
        dataIndex: "type",
        title: "类型",
        render: queryValueFromListRender(SALE_LIST),
    },
    E_USER_STATUS_COLUMN
]
const primarySearch=<>
    <FormItem noStyle name="name" >
        <Input style={{width:"70vw"}} placeholder="用户名" allowClear/>
    </FormItem>
</>