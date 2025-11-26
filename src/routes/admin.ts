import express, {Router} from 'express'
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

router.put('/publisher', async (req, res) => {
    const publisher_id = req.body.id
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
        const updatedPublisher = await prisma.publisher.update({
            where: {
                id: publisher_id
            },
            data: {
                name: name
            }
        })
        return res.status(200).json({
            id: updatedPublisher.id,
            name: updatedPublisher.name
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

router.delete('/publisher', async (req, res) => {
    const publisher_id = req.body.id
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
        await prisma.publisher.update({
            where: {
                id: publisher_id
            },
            data: {
                is_deleted: true
            }
        })
        return res.status(200).json({
            message: '出版社情報を削除しました'
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

router.post('/book', async (req, res) => {
    const {isbn, title, author_id, publisher_id, publication_year, publication_month} = req.body
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
    const book = await prisma.book.findUnique({
            where: {
                isbn: BigInt(isbn)
            }
        }
    )
    const author = await prisma.author.findUnique({
        where: {
            id: author_id,
            is_deleted: false
        }
    })
    const publisher = await prisma.publisher.findUnique({
        where: {
            id: publisher_id,
            is_deleted: false
        }
    })
    if (!publisher) {
        return res.status(403).json({
            reason: '存在しない出版社IDです'
        })
    }
    if (!author) {
        return res.status(403).json({
            reason: '存在しない著者IDです'
        })
    }
    if (book) {
        return res.status(400).json({
            reason: '既に存在するISBNです'
        })
    }
    if (publication_month < 1 || publication_month > 12) {
        return res.status(400).json({
            reason: '出版月は1から12の間で指定してください'
        })
    }
    try {
        await prisma.book.create({
            data: {
                isbn: BigInt(isbn),
                title: title,
                author_id: author_id,
                publisher_id: publisher_id,
                publication_year: publication_year,
                publication_month: publication_month,
            }
        })
        return res.status(200).json({
            message: '書籍を登録しました'
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

router.put('/book', async (req, res) => {
    const {isbn, title, author_id, publisher_id, publication_year, publication_month} = req.body
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
    const book = await prisma.book.findUnique({
            where: {
                isbn: BigInt(isbn)
            }
        }
    )
    const author = await prisma.author.findUnique({
        where: {
            id: author_id,
            is_deleted: false
        }
    })
    const publisher = await prisma.publisher.findUnique({
        where: {
            id: publisher_id,
            is_deleted: false
        }
    })
    if (!publisher) {
        return res.status(403).json({
            reason: '存在しない出版社IDです'
        })
    }
    if (!author) {
        return res.status(403).json({
            reason: '存在しない著者IDです'
        })
    }
    if (!book) {
        return res.status(400).json({
            reason: '存在しないISBNです'
        })
    }
    if (publication_month < 1 || publication_month > 12) {
        return res.status(400).json({
            reason: '出版月は1から12の間で指定してください'
        })
    }
    try {
        await prisma.book.update({
            where: {
                isbn: BigInt(isbn)
            },
            data: {
                title: title,
                author_id: author_id,
                publisher_id: publisher_id,
                publication_year: publication_year,
                publication_month: publication_month,
            }
        })
        return res.status(200).json({
            message: '書籍情報を更新しました'
        })
    } catch (e) {
        return res.status(400).json({
            reason: e
        })
    }
})

export default router