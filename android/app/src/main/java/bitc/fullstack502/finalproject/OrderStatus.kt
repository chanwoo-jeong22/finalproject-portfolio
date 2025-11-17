package bitc.fullstack502.finalproject.model

data class OrderStatus(
    val orKey: Int,
    val orDate: String,
    val orStatus: String,
    val orReserve: String,
    val dvName: String,
    val dvPhone: String,
    val orTotal: Int
)
