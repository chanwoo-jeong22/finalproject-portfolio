package bitc.fullstack502.finalproject

data class OrderItemRequestDTO(
    val pdKey: Int,
    val rdQuantity: Int,
    val rdPrice: Int,
    val rdProducts: String,
    val rdTotal: Int
)
