import {Router, Request} from 'express'
import {check, validationResult} from "express-validator";
import argon2 from "argon2";
import prisma from "../libs/db.js";
import passport from "../libs/auth.js";

const router = Router()

router.post('/login',
    passport.authenticate('local'),
    async (req, res) => {
        res.json({message: 'ok'})
    }
)

router.post('/register',
    check('email').isEmail(),
    async (req, res) => {
        if (!('email' in req.body) && !('password' in req.body) && !('name' in req.body)) {
            res.status(400)
            return res.json({
                reason: '項目に情報が入力されていません'
            })
        }
        if (!('email' in req.body)) {
            res.status(400)
            return res.json({
                reason: 'メールアドレスを入力してください',
            })
        }
        if (!(validationResult(req).isEmpty())) {
            res.status(400)
            return res.json({
                reason: '正しいメールアドレスを入力してください',
            })
        }
        if (!('password' in req.body)) {
            res.status(400)
            return res.json({
                reason: 'パスワードを入力してください',
            })
        }
        if (!('name' in req.body)) {
            res.status(400)
            return res.json({
                reason: '名前を入力してください',
            })
        }
        const hashedPassword = await argon2.hash(req.body.password, {
            timeCost: 2,
            memoryCost: 19456,
            parallelism: 1
        })

        try {
            await prisma.user.create({
                data: {
                    email: req.body.email,
                    name: req.body.name,
                    password: hashedPassword,
                    updated_at: new Date(),
                }
            })
            return (
                res.status(200).end()
            )
        } catch (e) {
            res.status(400)
            return res.json({
                reason: '登録に失敗しました。すでに登録されている可能性があります。',
            })
        }
    })

router.get('/history', async (req: Request, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            reason: 'Not authenticated'
        })
    }
    const userId = req.user.id
    const histories = await prisma.rental_log.findMany({
        where: {
            user_id: userId
        },
        orderBy : {
            checkout_date: 'desc'
        }
    })
    res.status(200).json({
        histories
    })
})

export default router