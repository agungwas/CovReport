import bcyrpt from 'bcryptjs'
const salt = bcyrpt.genSaltSync(8)

function hash (word: string) {
  return bcyrpt.hashSync(word, salt)
}
function compare (word: string, hashed: string) {
  return bcyrpt.compareSync(word, hashed)
} 

export { hash, compare }