import express, { Router } from 'express'
import prisma from "../libs/db.js";

const router = Router()

router.post('/author', async (req, res) => {
    const name = req.body.name
    if (!req.isAuthenticated()) {
        return res.status(400).json({
            reason: 'ログインをしてください'
        })
    }
    if (req.user.is_admin !== true) {
        return res.status(403).json({
            reason: '管理者権限がありません'
        })
    }
    try {
        const newAuthor = await prisma.author.create({
            data: {
                name: name
            }
        })
        return res.status(200).json({
            id: newAuthor.id,
            name: newAuthor.name
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

export default router