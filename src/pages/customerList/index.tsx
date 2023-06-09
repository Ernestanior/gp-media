import React, { FC, useCallback, useMemo } from "react";
import Template from "@/common/template";
import CustomerFilter from "@/pages/customerList/filter";
import MobileFilter from "@/pages/customerList/filterMobile";
import {INormalEvent} from "@/common/interface";
import {Input, notification, TableColumnProps, Tooltip} from "antd";
import {
    agentService,
    customerService,
    saleService,
    userService,
} from "@/store/apis/account";
import historyService from "@/store/history";
// import ConfirmButton from "@/common/confirm/button";
import {copy, reqAndReload} from "@/common/utils";
import Status from "@/common/status";
import {E_COLOR} from "@/common/const";
import {E_All_USER_TYPE, E_USER_TYPE} from "@/store/account/interface";
import useAccountInfo from "@/store/account";
import moment from "moment";
import request from "@/store/request";
import EllipsisTooltip from "@/common/ellipsisTooltip";
import {ellopsisTableConfig} from "@/common/utilsx";
import {statService} from "@/store/apis/stat";
import {IOperationConfig} from "@/common/template/interface";
import msgModal from "@/store/message/service";
import FormItem from "@/common/Form/formItem";
import isMobile from "@/app/isMobile";
import IconFont from "@/common/icon";
import TipBox from "@/common/tip";
import View from "@/common/popup/view";
import {dnsPlanService} from "@/store/apis/dns";

/**
 * 用户启用禁用状态
 */
export const E_USER_STATUS_COLUMN: TableColumnProps<any> = {
    title: "账号状态",
    dataIndex: "status",
    width: 100,
    render(value, item) {
        let leftTime = 0;
        const endDate = moment(item.probationStart, "YYYY/MM/DD").add(
            item.probationPeriod + 1,
            "day"
        );
        if (moment().isBefore(endDate)) {
            leftTime = endDate.diff(moment(), "day");
        }
        if (value === -1) {
            return <Status color={E_COLOR.disable}>禁用</Status>;
        }
        if (item.probation) {
            return (
                <Tooltip title="测试" placement="left">
                    <Status color={E_COLOR.warn}>
                        {leftTime}/{item.probationPeriod}
                    </Status>
                </Tooltip>
            );
        }
        return <Status color={E_COLOR.enable}>正式</Status>;
        // return <Status color={E_COLOR.disable}>禁用</Status>;
    },
};

const CustomerList: FC = () => {
    const buttons: INormalEvent[] = useMemo(() => {
        return [
            {
                text: "新增",
                primary: true,
                event() {
                    historyService.push("/customer/create");
                },
            },
        ];
    }, []);

  // const query = useCallback((data) => {
  //     return saleService.QueryUserList({}, data);
  // }, [])
    const queryDataFunction = useCallback(async (filters) => {
        const cusList = await request(saleService.QueryUserList({}, filters));
        if (cusList.isSuccess && cusList.result) {
            const data: any = cusList.result;

            const params = data.content
                .filter(
                    (item: { type: string; dnsServiceFlag: number }) =>
                        item.type !== USER_TYPE[2].id && item.dnsServiceFlag
                )
                .map((item: { id: number }) => item.id);
            const dnsUsage: any = await request(
                saleService.CustomerDnsUsage({}, [...params])
            );
            if (dnsUsage.isSuccess && dnsUsage.result) {
                dnsUsage.result.forEach((item: any) => {
                    data.content.forEach((i: any) => {
                        if (i.id === item.customerId) {
                            i["usedDomains"] = item.usedDomains;
                        }
                    });
                });
            }

            const customerIds:number[] = data.content
                .filter((item: { type: string }) => item.type !== USER_TYPE[2].id)
                .map((item: { id: number }) => item.id);
            const cdnUsage = await request<any[]>(
                statService.SaleStatCustomer(customerIds)
            );
            if (cdnUsage.isSuccess && cdnUsage.result) {
                cdnUsage.result.forEach((item: any) => {
                    data.content.forEach((i: any) => {
                        if (i.id === item.customerId) {
                            i["usedMasterDomains"] = item.usedMasterDomains;
                            i["usedSites"]=item.usedSites;
                        }
                    });
                });
            }
            const dnsInfo = await request<any[]>(dnsPlanService.customerListDnsPlan({}, customerIds));
            if(dnsInfo.isSuccess && dnsInfo.result){
                dnsInfo.result.forEach((item:any)=>{
                    data.content.forEach((i: any) => {
                        if (i.id === item.customerId) {
                            const list: any[] = [];
                            const l = item.customPlanBalance;
                            if (l) {
                                if (l?.customised) {
                                    list.push({
                                        label:  '定制版',
                                        used: l?.customised?.usedAmount,
                                    })
                                }
                                if (l?.enterprise) {
                                    list.push({
                                        label:  '企业版',
                                        used: l?.enterprise?.usedAmount,
                                    })
                                }
                                if (l?.free) {
                                    list.push({
                                        label: '免费版',
                                        used: l?.free?.usedAmount,
                                    })
                                }
                                if (l?.standard) {
                                    list.push({
                                        label: '标准版',
                                        used: l?.standard?.usedAmount,
                                    })
                                }
                                if (l?.new_enterprise) {
                                    list.push({
                                        label:  '新企业版',
                                        used: l?.new_enterprise?.usedAmount,
                                    })
                                }
                            }
                            i['dnsPlanBalance'] = list;
                        }
                    });
                })
            }
            return data;
        }
        return null;
    }, []);

    // modify
    const modify = useCallback((customer) => {
        historyService.push(`/customer/modify/${customer.type}/${customer.id}`);
    }, []);

    // disable
    const disable = useCallback((data) => {
        let config;
        if (data.type === E_All_USER_TYPE.AGENT) {
            config = userService.DisableUser({id: data.userId}, {});
        } else {
            config = customerService.DisableCustomer({id: data.id}, {});
        }
        reqAndReload(config, () => notification.success({message: "配置已更新"}));
    }, []);

    // enable
    const enable = useCallback((data) => {
        let config;
        if (data.type === E_All_USER_TYPE.AGENT) {
            config = userService.EnableUser({id: data.userId}, {});
        } else {
            config = customerService.EnableCustomer({id: data.id}, {});
        }
        reqAndReload(config, () => notification.success({message: "配置已更新"}));
    }, []);

    // modify
    const deleteCustomer = useCallback((data) => {
        let config;
        if (data.type === E_All_USER_TYPE.AGENT) {
            config = agentService.Delete({id: data.id}, {});
        } else {
            config = customerService.Delete({id: data.id}, {});
        }
        reqAndReload(config, () => notification.success({message: "配置已更新"}));
    }, []);

    const info = useAccountInfo();
    let _columns_fix: any = columns;
    if (info && info.type === E_USER_TYPE.SALE_MANAGER) {
        _columns_fix = columns_manage;
    }

    const options: IOperationConfig = useMemo(() => {
        return [
            [{
                text: "查看",
                hide: () => !isMobile,
                event(data) {
                    if (data) {
                        const {
                            name,
                            email,
                            saleName,
                            type,
                            status,
                            probation,
                            cdnServiceFlag,
                            usedMasterDomains,
                            limitMasterDomains,
                            dnsServiceFlag,
                            usedDomains,
                            limitDedicatedPlans
                        } = data
                        const dataList=[
                            {label:'客户名称',content:name},
                            {label:'客户邮箱',content:email},
                            {label:'销售员',content:saleName?saleName:"-"},
                            {label:'客户类型',content:type},
                            {label:'账号状态',content:status === -1?
                                    <Status color={E_COLOR.disable}>禁用</Status>:
                                    probation? <Tooltip title="测试" placement="left">
                                    <Status color={E_COLOR.warn}>测试</Status></Tooltip>:
                                    <Status color={E_COLOR.enable}>正式</Status>
                            },
                            {label:'CDN',content:type === USER_TYPE[2].id ?"-" :
                                    cdnServiceFlag !== 1 ?
                                        <Status color={E_COLOR.off}>未启用</Status>
                                        : <>
                                            <Status color={E_COLOR.enable}>启用</Status>
                                            {usedMasterDomains || 0}/{limitMasterDomains}{" "}
                                        </>
                            },
                            {label:'DNS',content:type === USER_TYPE[2].id ? "-" :
                                    dnsServiceFlag !== 1 ?
                                        <Status color={E_COLOR.off}>未启用</Status>
                                        : <>
                                            <Status color={E_COLOR.enable}>启用</Status>
                                            {usedDomains || 0}/{limitDedicatedPlans || 0}{" "}
                                        </>},
                        ]
                        const value = {
                            node:<View dataList={dataList} />,
                        }
                        msgModal.createEvent("popup", value)
                    }
                },
            },
                {
                    text: "修改",
                    event(data) {
                        modify(data);
                    }
                },
                {
                    text: "禁用",
                    hide: (data) => data.status !== 1,
                    event(data) {
                        const value = {
                            title: "禁用",
                            content: `你确定要禁用客户: ${data.name} ？`,
                            onOk: () => disable(data)
                        }
                        msgModal.createEvent("modal", value)
                    }
                },
                {
                    text: "启用",
                    hide: (data) => data.status === 1,
                    event(data) {
                        const value = {
                            title: "启用",
                            content: `你确定要启用客户: ${data.name} ？`,
                            onOk: () => enable(data)
                        }
                        msgModal.createEvent("modal", value)
                    }
                },
                {
                    text: "重置密码",
                    event(data) {
                        const value = {
                            title: "重置密码",
                            content: <TipBox style={{width:isMobile?320:440}} type="warning" title="提示">请确认为{data.name}重置密码</TipBox>,
                            onOk: () => resetPwd(data.userId)
                        }
                        msgModal.createEvent("modal", value)
                    },
                },
                {
                    text: "删除",
                    event(data) {
                        // deleteCustomer(data);
                        const value = {
                            title: "删除",
                            content: `你确定要删除客户: ${data.name} ？`,
                            onOk: () => deleteCustomer(data)
                        }
                        msgModal.createEvent("modal", value)
                    },
                }]
        ]
    }, [deleteCustomer, enable, disable, modify])

    // 下拉
    /** 旧版本
     const _columns: any = useMemo(() => {
    return [
      ..._columns_fix,
      {
        title: "操作",
        dataIndex: "opt",
        width: 200,
        fixed: "right",
        render(_: any, data: any) {
          return (
            <Space>
              <Button
                onClick={() => {
                  modify(data);
                }}
              >
                修改
              </Button>
              {data.status === 1 && (
                <ConfirmButton
                  info={`确定禁用此客户${data.name}/${data.email}？`}
                  submit={() => {
                    disable(data);
                  }}
                >
                  禁用
                </ConfirmButton>
              )}
              {data.status !== 1 && (
                <ConfirmButton
                  info={`确定启用此客户${data.name}/${data.email}？`}
                  submit={() => {
                    enable(data);
                  }}
                >
                  启用
                </ConfirmButton>
              )}
              <ConfirmButton
                info={`确定删除此客户${data.name}/${data.email}？`}
                submit={() => {
                  deleteCustomer(data);
                }}
              >
                删除
              </ConfirmButton>
            </Space>
          );
        },
      },

    ];
  }, [_columns_fix]);
     */
    return (
        <section>
            <Template
                primarySearch={primarySearch}
                filter={isMobile ? <MobileFilter/> : <CustomerFilter/>}
                event={buttons}
                columns={isMobile ? columnMobile : _columns_fix}
                // queryData={query}
                optList={options}
                queryDataFunction={queryDataFunction}
                rowKey="id"
                scroll={isMobile ? {} : {
                    x: 1200,
                }}
            />
        </section>
    );
};

export default CustomerList;

const columnMobile: TableColumnProps<any>[] = [
    {
        title: "客户名称",
        dataIndex: "name",
        sorter: true,
        width: 110,
        fixed: isMobile ? undefined : "left",
        ...ellopsisTableConfig,
    },
    {
        title: "客户邮箱",
        dataIndex: "email",
        sorter: true,
        width: 120,
        ...ellopsisTableConfig,
    }
]
const columns: TableColumnProps<any>[] = [
    {
        title: "客户名称",
        dataIndex: "name",
        sorter: true,
        width: 130,
        fixed: isMobile ? undefined : "left",
        ...ellopsisTableConfig,
    },
    {
        title: "客户邮箱",
        dataIndex: "email",
        sorter: true,
        width: 150,
        ...ellopsisTableConfig,
    },
    {
        title: "客户类型",
        dataIndex: "type",
        width: 90,
        onCell: () => ({
            style: {
                whiteSpace: "nowrap",
                maxWidth: 90,
            },
        }),
        render: (type) => {
            const item = USER_TYPE.find((it) => it.id === type);
            if (item) {
                if (item.name.length > 6) {
                    return (
                        <EllipsisTooltip title={item.name}>{item.name}</EllipsisTooltip>
                    );
                }
                return item.name;
            }
            return "-";
        },
    },
    {
        ...E_USER_STATUS_COLUMN,
    },
    {
        title: "CDN",
        dataIndex: "probation",
        width: 110,
        render(_, data) {
            if (data.type === USER_TYPE[2].id) {
                return "-";
            }
            // CDN服务未启用
            if (data.cdnServiceFlag !== 1) {
                return <Status color={E_COLOR.off}>未启用</Status>;
            }
            return (
                <>
                    <Status color={E_COLOR.enable}>启用</Status>
                    {data.customerType==="cname"?
                        <>{data.usedSites || 0}/{data.limitCnames}</>:
                        <>{data.usedMasterDomains || 0}/{data.limitMasterDomains}</>
                    }
                </>
            );

            // return <div>
            //     <Status color={E_COLOR.warn}>测试</Status>
            //     {leftTime}/{data.probationPeriod}
            // </div>
        },
    },
    {
        title: "DNS",
        dataIndex: "dnsServiceFlag",
        width: 110,
        render(_, data) {
            if (data.type === USER_TYPE[2].id) {
                return "-";
            }
            // DNS服务未启用
            if (data.dnsServiceFlag !== 1) {
                return <Status color={E_COLOR.off}>未启用</Status>;
            }
            const dnsTip = data.dnsPlanBalance && data.dnsPlanBalance.map((item:any)=><div key={item.label}>{item.label}: {item.used}</div>)
            return (
                <Tooltip title={dnsTip}>
                    <Status color={E_COLOR.enable}>启用</Status>
                    {data.usedDomains || 0}/{data.limitDedicatedPlans || 0}
                </Tooltip>
            );
        },
    },
];

const columns_manage = [
    ...columns.slice(0, 2),
    {
        title: "销售员",
        dataIndex: "saleName",
        width: 130,
        onCell: () => ({
            style: {
                whiteSpace: "nowrap",
                maxWidth: 110,
            },
        }),
        render: (value: any) => {
            if (value.length > 10) {
                return <EllipsisTooltip title={value}>{value}</EllipsisTooltip>;
            }
            return value || "-";
        },
    },
    ...columns.slice(2),
];

export const USER_TYPE = [
    {
        id: "direct",
        name: "直属客户",
    },
    {
        id: "assign_to_agent",
        name: "代理客户",
    },
    {
        id: "agent",
        name: "代理",
    },
];

const primarySearch = <>
    <FormItem noStyle name="name">
        <Input style={{width: "70vw"}} placeholder="名称" allowClear/>
    </FormItem>
</>

export const resetPwd = async(id:number) => {
    const res:any = await request(userService.ResetUserPwd({ id }, {}));
    const value = {
        title: "重置密码",
        content: <div style={{display:"flex",width:'100%',flexDirection:"column",alignItems:"center"}}>
            <div style={{color:"#68e047",marginBottom:5}}>
                <IconFont type={'iconchenggong'} style={{width:10,marginRight:10}} />
                <span className='success'>重置密码成功</span>
            </div>
            <div style={{display:"flex",alignItems:"center",padding:'5px 10px',border:"1px solid #eee",borderRadius:5}}>
                <span onDoubleClick={()=>copy(res.result)}>{res.result}</span>
                <IconFont type="iconwendangfuzhi" onClick={()=>copy(res.result)} />
            </div>
        </div>

    }
    msgModal.createEvent("modal", value)
}