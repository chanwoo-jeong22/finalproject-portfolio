package bitc.fullstack502.finalproject

data class OrderRequestDTO(
  val agKey: Int,
  val items: List<OrderItemRequestDTO>,
  val reserveDate: String
)
