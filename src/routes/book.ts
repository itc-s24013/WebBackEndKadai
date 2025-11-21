import express, { Router } from 'express'
import db from '../libs/db.js'
import prisma from "../libs/db.js";

const router = Router()

router.get('/list/{:page}', async (req, res) => {
    const page = parseInt(req.params.page || '1')
    const ITEMS_PER_PAGE = 5
    const booksRaw = await db.book.findMany({
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
            author: true
        }
    })
    const books = booksRaw.map((book) => ({
        isbn: book.isbn.toString(),
        title: book.title,
        author: {
            name: book.author?.name ?? ""
        },
        publication_year_month: (book.publication_year+"/"+book.publication_month)
    }))
    const count = await db.book.count({
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
    const bookRaw = await (db.book.findMany({
        where: {
            isbn: isbn,
            is_deleted: false
        },
        include: {
            author: true
        }
    }))
    if (bookRaw.length === 0) {
        return res.status(404).json({ message: "書籍が見つかりません" })
    }
    const book = bookRaw.map((book) => ({
        isbn: book.isbn.toString(),
        title: book.title,
        author: {
            name: book.author?.name ?? ""
        },
        publication_year_month: (book.publication_year+"/"+book.publication_month)
    }))
    return res.status(200).json({
        book: book
    })
})

router.post('/rental', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            reason: 'Not authenticated'
        })
    }
    const book_id = BigInt(req.body.book_id)
    const book = await prisma.book.findUnique({
        where: {
            isbn: book_id
        }
    })
    if (!book || book.is_deleted) {
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

export default router