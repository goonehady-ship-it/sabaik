import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import slidesRouter from "./slides";
import servicesRouter from "./services";
import containersRouter from "./containers";
import valuesRouter from "./values";
import testimonialsRouter from "./testimonials";
import partnersRouter from "./partners";
import serviceRequestsRouter from "./serviceRequests";
import conversationsRouter from "./conversations";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import aiChatRouter from "./aiChat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(slidesRouter);
router.use(servicesRouter);
router.use(containersRouter);
router.use(valuesRouter);
router.use(testimonialsRouter);
router.use(partnersRouter);
router.use(serviceRequestsRouter);
router.use(conversationsRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(aiChatRouter);

export default router;
