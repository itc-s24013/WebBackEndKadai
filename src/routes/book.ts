import express, { Router } from 'express'
import prisma from "../libs/db.js";

const router = Router()

router.get('/list/{:page}', async (req, res) => {
    const page = parseInt(req.params.page || '1')
    const ITEMS_PER_PAGE = 5
    const booksRaw = await prisma.book.findMany({
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        where: {
            is_deleted: false
        },
        orderBy: [
            { publication_year: 'desc' },
            { publication_month: 'desc' }
        ],
        include: {
            author: true,
            publisher: true,
        }
    })
    const books = booksRaw.map((book) => ({
        isbn: Number(book.isbn),
        title: book.title,
        author: {
            name: book.author.name
        },
        publication_year_month: (book.publication_year+"/"+book.publication_month)
    }))
    const count = await prisma.book.count({
        where: { is_deleted: false },
    })
    const maxPage = Math.ceil(count / ITEMS_PER_PAGE)
    return res.status(200).json({
        current: page,
        last_page: maxPage,
        books: books,
    })
})

router.get('/detail/:isbn', async (req, res) => {
    const isbn = BigInt(req.params.isbn)
    const book = await (prisma.book.findUnique({
        where: {
            isbn: isbn,
            is_deleted: false
        },
        include: {
            author: true,
            publisher: true,
        }
    }))
    if (!book) {
        return res.status(404).json({ message: "書籍が見つかりません" })
    }
    return res.status(200).json({
        isbn: Number(book.isbn),
        title: book.title,
        author: {
            name: book.author.name
        },
        publication_year_month: (book.publication_year+"/"+book.publication_month)
    })
})

router.post('/rental', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            reason: 'ログインしてください'
        })
    }
    const book_id = BigInt(req.body.book_id)
    const book = await prisma.book.findUnique({
        where: {
            isbn: book_id,
            is_deleted: false
        }
    })
    if (!book) {
        return res.status(404).json({
            message: "書籍が見つかりません"
        })
    }
    const histories = await prisma.rental_log.findFirst({
        where: {
            book_isbn: book_id
        },
        orderBy : {
            checkout_date: 'desc',
        }
    })
    if (histories && !histories.returned_date) {
        return res.status(409).json({
            message: "既に貸出中です"
        })
    }
    const today = new Date()
    const rental = await prisma.rental_log.create({
        data: {
            book_isbn: book_id,
            user_id: req.user.id,
            checkout_date: today,
            due_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        }
    })
    res.status(200).json(
        {
            id: rental.id,
            checkout_date: rental.checkout_date,
            due_date: rental.due_date,
        }
    )
})

router.put('/return', async (req, res) => {
    const rental_id = req.body.id
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            reason: 'ログインしてください'
        })
    }
    const rental = await prisma.rental_log.findUnique({
        where: {
            id: rental_id
        }
    })
    if (!rental) {
        return res.status(404).json({
            message: "存在しない貸出記録です"
        })
    }
    if (!(rental.user_id === req.user?.id)) {
        return res.status(403).json({
            message: "他のユーザの貸出書籍です"
        })
    }
    if (rental.returned_date) {
        return res.status(409).json({
            message: "既に返却済みの貸出記録です"
        })
    }
    const today = new Date()
    await prisma.rental_log.update({
        where: {
            id: rental_id
        },
        data: {
            returned_date: today
        }
    })
    return res.status(200).json({
        id: rental_id,
        returned_date: today
    })
})

export default router