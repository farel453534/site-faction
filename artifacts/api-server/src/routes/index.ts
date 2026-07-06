import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import meRouter from "./me";
import adminRouter from "./admin";
import contentRouter from "./content";
import gerantRouter from "./gerant";
import blacklistRouter from "./blacklist";
import ticketsRouter from "./tickets";
import generalStaffRouter from "./general-staff";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(meRouter);
router.use(adminRouter);
router.use(contentRouter);
router.use(gerantRouter);
router.use(blacklistRouter);
router.use(ticketsRouter);
router.use(generalStaffRouter);

export default router;
