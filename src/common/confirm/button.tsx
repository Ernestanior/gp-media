import {FC} from "react";
import {Button, Popconfirm} from "antd";
import {IConfirmModule} from "@/common/interface";

const ConfirmButton:FC<IConfirmModule> = ({info, submit, children}) => {
    return <Popconfirm title={info} onConfirm={submit}>
        <Button>{children}</Button>
    </Popconfirm>
}

export default ConfirmButton
