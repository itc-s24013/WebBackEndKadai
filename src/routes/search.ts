import {Router, Request} from 'express'
import {PrismaMariaDb} from '@prisma/adapter-mariadb'
import {Prisma, PrismaClient} from 'db'

const router = Router()
const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'prisma',
    password: 'prisma',
    database: 'chap6',
    connectionLimit: 5
})
const prisma = new PrismaClient({adapter})

interface UserPrams {
    id?: string
    name?: string
    min?: string
    max?: string
    mail?: string
    page?: string
    prev?: string
    next?: string
}