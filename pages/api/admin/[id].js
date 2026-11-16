export default function handler(req, res) {
  return res.status(404).json({ message: 'Deprecated route. Use /api/admin/issues/[id] instead.' })
}
