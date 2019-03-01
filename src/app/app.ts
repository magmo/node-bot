import * as Koa from 'koa';

// import { config } from './config';
import { logger } from './logging';
import { indexRoutes } from './routes/index';
import { ledgerChannelRoutes } from './routes/ledger_channels';

const app = new Koa();

app.use(logger);
app.use(indexRoutes);
app.use(ledgerChannelRoutes);

export default app;
