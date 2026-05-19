import { Router, type IRouter } from "express";
import healthRouter from "./health";
import labRouter from "./lab";
import authRouter from "./auth";
import payloadsRouter from "./payloads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(payloadsRouter);
router.use(labRouter);

export default router;
