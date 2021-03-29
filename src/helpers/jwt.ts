import jwt from 'jsonwebtoken'

const sign = (payload: object) => jwt.sign(payload, 'rahasia')
const verify = (token: string) => jwt.verify(token, 'rahasia')

export { sign, verify }