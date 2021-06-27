const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
    console.log(request.method)
    logger.info(`Method: ${request.method}`)
    logger.info(`Path: ${request.path}`)
    logger.info(`Body: ${request.body}`)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        console.log(error)
        return response.status(401).json({ error: 'invalid token' })
    }
    logger.error(error.message)
    next(error)
}

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

const tokenExtractor = (error, request, response, next) => {
    const token = getTokenFrom(request)
    return token
    next(error)
}

const userExtractor = async (error, request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log(decodedToken)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    return user
}
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}