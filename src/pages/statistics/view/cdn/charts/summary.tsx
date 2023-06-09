import {FC, useMemo} from "react";
import {Col, Progress, Row, Space} from "antd";
import ProgressCenter from "@/pages/statistics/view/cdn/charts/progressCenter";
import "./summary.less"
import isMobile from "@/app/isMobile";

interface IProps{
    domain: any;
    defence: any;
    packageInfo: any;
}

const CustomerSummary:FC<IProps> = ({domain: originDomain, defence, packageInfo}) => {
    const domain:any = useMemo(() => {
        if(packageInfo.type === "normal"){
            return originDomain;
        }
        // cname
        return packageInfo.cnameBalance
    }, [originDomain, packageInfo])
    const span = useMemo(()=>isMobile?24:12,[])

    const percent = useMemo(() => {
        if(!domain.totalAmount){
            return 100;
        }
        return parseFloat((domain.usedAmount / domain.totalAmount).toFixed(4))* 100;
    }, [domain])

    if(!domain.totalAmount){
        return null;
    }

    const type = packageInfo.type;

    return <section className="customer-summary">
        <Row gutter={15}>
            <Col span={span}>
                <div className="cdn-block">
                    <Row gutter={15}>
                        <Col flex={1}>
                            <p className="cdn-block-title">{type === "cname" ? "站点额度" : "域名额度"}</p>
                            <div className="label-text">
                                <div>{domain.usedAmount}/{domain.totalAmount}</div>
                                <div className="label-text-square">
                                    <Space>
                                        <span className="used" />
                                        <span>已用</span>
                                        <span className="unUsed" />
                                        <span>未用</span>
                                    </Space>
                                </div>
                            </div>
                        </Col>
                        <Col>
                            <Progress
                                width={150}
                                type="circle"
                                strokeLinecap="square"
                                percent={percent}
                                format={() => {
                                    return <ProgressCenter>
                                        <span className="domain">
                                            <span className="total">
                                                {domain.usedAmount}/{domain.totalAmount}
                                            </span>
                                        </span>
                                    </ProgressCenter>
                                }}
                            />
                        </Col>
                    </Row>
                </div>
            </Col>
            <Col span={span}>
                <div className="cdn-block">
                    <Row gutter={15}>
                        <Col flex={1}>
                            <p className="cdn-block-title">防御额度</p>
                            <div className="label-text">
                                <div>{defence.totalAmount === "-1" ? "Unlimited" : `${defence.totalAmount}GB`}</div>
                            </div>
                        </Col>
                        <Col>
                            <Progress
                                width={150}
                                type="circle"
                                strokeLinecap="square"
                                percent={0}
                                format={() => {
                                    return <ProgressCenter>
                                        <span className="defence">
                                            <span className="total">
                                                {defence.totalAmount === "-1" ? "Unlimited" : defence.totalAmount}
                                                {defence.totalAmount !== "-1" && <em>GB</em>}
                                            </span>
                                        </span>
                                    </ProgressCenter>
                                }}
                            />
                        </Col>
                    </Row>
                </div>
            </Col>
        </Row>
    </section>
}

export default CustomerSummary
