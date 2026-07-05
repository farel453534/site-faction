import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import meRouter from "./me";
import adminRouter from "./admin";
import contentRouter from "./content";
import gerantRouter from "./gerant";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(meRouter);
router.use(adminRouter);
router.use(contentRouter);
router.use(gerantRouter);

export default router;
