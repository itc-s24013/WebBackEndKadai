import {Router, Request} from 'express'
import prisma from "../libs/db.js";
import passport from "../libs/auth.js";

const router = Router()

router.post('/login',
    passport.authenticate('local', {}),
    async (req, res) => {
        res.json({message: 'ok'})
    }
)


export default router