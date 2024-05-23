import { roles } from "../../middlewares/auth.js";

 export const endpoints ={
    create : [roles.Admin],
    update : [roles.Admin], 
    delete : [roles.Admin], 
  
 }