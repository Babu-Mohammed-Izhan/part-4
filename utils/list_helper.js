const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    sum = blogs.map(blog => blog.likes).reduce((sum, next) => sum + next)
    console.log(sum)
    return sum
}

const favoriteBlog = (blogs) => {
    const fav = Math.max.apply(Math, blogs.map((o) => { return o.likes }))
    const favBlog = blogs.find((o) => { return o.likes == fav; })
    console.log(favBlog)
    return favBlog
}

const mostBlogs = (blogs) => {
    blogs.map(blog => { lodash.countBy(blog.likes) })
}


module.exports = { dummy, totalLikes, favoriteBlog }