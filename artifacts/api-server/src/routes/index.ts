import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shipmentsRouter from "./shipments";
import routeOptRouter from "./routeOpt";
import inventoryRouter from "./inventory";
import fleetRouter from "./fleet";
import analyticsRouter from "./analytics";
import eventsRouter from "./events";
import yardRouter from "./yard";
import fragmentationRouter from "./fragmentation";
import verificationRouter from "./verification";
import workforceRouter from "./workforce";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shipmentsRouter);
router.use(routeOptRouter);
router.use(inventoryRouter);
router.use(fleetRouter);
router.use(analyticsRouter);
router.use(eventsRouter);
router.use(yardRouter);
router.use(fragmentationRouter);
router.use(verificationRouter);
router.use(workforceRouter);

export default router;
