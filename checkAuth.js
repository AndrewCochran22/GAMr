function checkAuth(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        // (also works) next('Not logged in')
        return res.status(401).render('error', { locals: { error: 'not logged in' }})
    }
}

module.exports = checkAuth;