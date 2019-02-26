import * as Koa from 'koa';

// import { config } from './config';
import { logger } from './logging';
import { allocatorChannelRoutes } from './routes/allocator_channels';
import { indexRoutes } from './routes/index';

const app = new Koa();

app.use(logger);
app.use(indexRoutes);
app.use(allocatorChannelRoutes);

export default app;