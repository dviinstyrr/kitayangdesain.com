import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { password } = await req.json();
  const hash = process.env.ADMIN_PASS_HASH;
  const secret = process.env.JWT_SECRET;

  if (!hash || !secret) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const valid = await bcrypt.compare(password || '', hash);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Password salah' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '30m' });

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
