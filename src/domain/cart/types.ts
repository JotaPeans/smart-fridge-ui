export type CartItem = {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

export type CartFlight = {
  id: number
  from: { x: number; y: number }
  to: { x: number; y: number }
}
