import React, {FC} from "react";
import {Redirect, Route, Router, Switch} from "react-router-dom";
import historyService from "@/store/history"
import LayoutPlx from "../common/layout";
import CustomerList from "@/pages/customerList";
import CreateCustomer from "@/pages/customer/create";
import ModifyCustomerPage from "@/pages/customer/modify";
import SaleList from "@/pages/saleList";
import CreateSale from "@/pages/sale/create";
import ModifySalePage from "@/pages/sale/modify";
import StatisticsList from "@/pages/statistics/list";
import SaleAssignPage from "@/pages/sale/assignCustomer";
import ViewStatistics from "@/pages/statistics/view";

/**
 * 项目路由组件
 * 可以在此根据用户相应的权限组装路由
 * @constructor
 */
const ModuleRouter:FC = () => {

    return <Router history={historyService}>
        <LayoutPlx>
            <Switch>
                <Route exact path="/customer/modify/:type/:id">
                    <ModifyCustomerPage />
                </Route>
                <Route path="/customer/create">
                    <CreateCustomer />
                </Route>
                <Route path="/customer">
                    <CustomerList />
                </Route>
                <Route path="/sale/assign/:id">
                    <SaleAssignPage />
                </Route>
                <Route path="/sale/modify/:id">
                    <ModifySalePage />
                </Route>
                <Route path="/sale/create">
                    <CreateSale />
                </Route>
                <Route path="/sale">
                    <SaleList />
                </Route>
                <Route path="/statistics/:id">
                    <ViewStatistics />
                </Route>
                <Route path="/statistics">
                    <StatisticsList />
                </Route>
                <Redirect to="/customer" />
            </Switch>
        </LayoutPlx>
    </Router>
}

export default ModuleRouter
