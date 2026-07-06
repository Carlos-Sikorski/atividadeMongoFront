import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oficinasRouter from "./oficinas";
import veiculosRouter from "./veiculos";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oficinasRouter);
router.use(veiculosRouter);
router.use(dashboardRouter);

export default router;
