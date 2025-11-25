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

router.put('/author', async (req, res) => {
    const author_id = req.body.id
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
        const updatedAuthor = await prisma.author.update({
            where: {
                id: author_id
            },
            data: {
                name: name
            }
        })
        return res.status(200).json({
            id: updatedAuthor.id,
            name: updatedAuthor.name
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

router.delete('/author', async (req, res) => {
    const author_id = req.body.id
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
        await prisma.author.update({
            where: {
                id: author_id
            },
            data: {
                is_deleted: true
            }
        })
        return res.status(200).json({
            message: '著者情報を削除しました'
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

router.post('/publisher', async (req, res) => {
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
        const newPublisher = await prisma.publisher.create({
            data: {
                name: name
            }
        })
        return res.status(200).json({
            id: newPublisher.id,
            name: newPublisher.name
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

export default router