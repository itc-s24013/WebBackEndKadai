import express, { Router } from 'express'
import prisma from "../libs/db.js";

const router = Router()

router.get('/author', async (req, res) => {
    const keyword = req.body.keyword
    const authors = await prisma.author.findMany({
        where: {
            name: {
                contains: keyword
            },
            is_deleted: false
        }
    })
    return res.status(200).json({
        authors: authors.map((a) => ({
            id: a.id,
            name: a.name
        }))
    })
})

router.get('/publisher', async (req, res) => {
    const keyword = req.body.keyword
    const publishers = await prisma.publisher.findMany({
        where: {
            name: {
                contains: keyword
            },
            is_deleted: false
        }
    })
    return res.status(200).json({
        publishers: publishers.map((p) => ({
            id: p.id,
            name: p.name
        }))
    })
})

export default router