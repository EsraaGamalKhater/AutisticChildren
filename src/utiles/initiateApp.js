import { connectionDB } from '../../DB/connection.js';
import { globalResponse } from './errorhandaling.js';
import * as routers from '../modules/index.routes.js';
import cors from 'cors';
import i18n from './i18n.js'; 

export const initiateApp = (app, express) => {
  const port = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cors());
  app.use(i18n.init); 
  
  
  connectionDB();
  app.use('/auth', routers.auhtRouter);
  app.use('/blog', routers.blogsRouter);
  app.use('/user', routers.userRouter);
  app.all('*', (req, res, next) =>
    res.status(404).json({ message: req.translate('404 Not Found URL') })
  );
  app.use(globalResponse);

  app.get('/', (req, res) => res.send(req.translate('Hello World!')));
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
