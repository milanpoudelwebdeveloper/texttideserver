import db from '@root/db'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, country } = req.body
    if (!name || !email || !password || !country) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existsQuery = 'SELECT * FROM users WHERE email = $1'
    const emailExists = await db.query(existsQuery, [email])
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: 'User with that email already exists. Please use another email' })
    }
    const createQuery = 'INSERT INTO users (name, email, password, country) VALUES ($1, $2, $3, $4)'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hashSync(password, salt)
    const createdUser = await db.query(createQuery, [name, email, hashedPassword, country])
    if (createdUser) {
      return res.status(201).json({ message: 'User created successfully' })
    } else {
      return res.status(400).json({ message: 'User could not be created. Please try again' })
    }
  } catch (e) {
    console.log('Hey register controller error', e)
    return res.status(500).json({ message: 'Internal server error. Please try again later' })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' })
    }
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1'
    const userExists = await db.query(userExistsQuery, [email])
    if (userExists?.rows.length > 0) {
      const foundUser = userExists.rows[0]
      const isPasswordValid = bcrypt.compareSync(password, foundUser?.password)
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Incorrect Password' })
      } else {
        const payload = {
          id: foundUser.id
        }
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string)
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '10min' })
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        })
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        })
        return res.status(200).json({
          message: 'Logged in successfully',
          user: {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            country: foundUser.country
          }
        })
      }
    } else {
      return res.status(400).json({ message: 'User with that email does not exist' })
    }
  } catch (e) {
    console.log('Hey login controller error', e)
    return res.status(500).json({ message: 'Internal server error. Please try again later' })
  }
}
