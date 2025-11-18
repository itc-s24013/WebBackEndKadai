import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from 'express-session'

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import helloRouter from './routes/hello.js'

const app = express()

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json()) // パースを自動化する
app.use(express.urlencoded({extended: false})) // 送られたデータをわかりやすくする
app.use(cookieParser()) // クッキーを使いやすくする
app.use(express.static(path.join(import.meta.dirname, 'public'))) // 静的なコンテンツはここにまとめられてます
app.use(session({
    secret: 'oeiajejlaigjaleaivkgjehgoe',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/hello', helloRouter)

// catch 404 and forward to error handler
app.use(async (req: Request, res: Response, next: NextFunction) => {
    throw createError(404)
})

// error handler
app.use(async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = hasProperty(err, 'message') && err.message || 'Unknown error'
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(hasProperty(err, 'status') && Number(err.status) || 500)
    res.render('error')
})

// unknown 型のデータが、指定のプロパティを持っているかチェックするための関数
function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
    return (
        x instanceof Object && name.every(prop => prop in x)
    )
}

export default app